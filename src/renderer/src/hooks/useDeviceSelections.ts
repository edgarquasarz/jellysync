import { useState, useCallback, useRef } from 'react'

export interface SyncedItemInfo {
  id: string
  name: string
  type: 'artist' | 'album' | 'playlist'
}

interface DeviceState {
  selectedItems: Set<string>
  syncedItems: Set<string>
  syncedItemsInfo: SyncedItemInfo[]
  outOfSyncItems: Set<string>
  estimatedSizeBytes: number | null
  syncedMusicBytes: number | null
  isActivatingDevice: boolean
  isCalculatingSize: boolean
}

const EMPTY: DeviceState = { selectedItems: new Set(), syncedItems: new Set(), syncedItemsInfo: [], outOfSyncItems: new Set(), estimatedSizeBytes: null, syncedMusicBytes: null, isActivatingDevice: false, isCalculatingSize: false }

/** Build a cache key from path+options to detect unchanged re-activations */
function buildActivationKey(
  path: string,
  options?: {
    itemIds: string[]; itemTypes: Record<string, 'artist' | 'album' | 'playlist'>
    convertToMp3: boolean; bitrate: '128k' | '192k' | '320k'
    coverArtMode?: 'off' | 'embed' | 'separate'
  }
): string | null {
  if (!options) return null
  const sortedIds = [...options.itemIds].sort().join(',')
  return `${path}:${sortedIds}:${options.convertToMp3}:${options.bitrate}:${options.coverArtMode ?? 'embed'}`
}

export function useDeviceSelections() {
  const [deviceStates, setDeviceStates] = useState<Map<string, DeviceState>>(new Map())
  const [activeDevicePath, setActiveDevicePath] = useState<string | null>(null)
  // Track last activation key to skip unnecessary re-analysis
  const lastActivationKeyRef = useRef<string | null>(null)
  // Track in-flight activation to avoid duplicate getSyncedItems calls
  const activatingRef = useRef<Set<string>>(new Set())
  // Store last activation options so revalidateDevice can reuse them
  const lastOptionsRef = useRef<Parameters<typeof activateDevice>[1] | null>(null)

  const activeState = activeDevicePath
    ? (deviceStates.get(activeDevicePath) ?? EMPTY)
    : EMPTY

  // Activate a device: load its synced items and init selection on first visit
  const activateDevice = useCallback(async (path: string, options?: {
    serverUrl: string; apiKey: string; userId: string
    itemIds: string[]; itemTypes: Record<string, 'artist' | 'album' | 'playlist'>
    convertToMp3: boolean; bitrate: '128k' | '192k' | '320k'
    coverArtMode?: 'off' | 'embed' | 'separate'
  }) => {
    // Store options so revalidateDevice can reuse them
    lastOptionsRef.current = options ?? null

    // Skip expensive re-analysis when re-activating the same path with identical options
    const key = buildActivationKey(path, options)
    if (key === lastActivationKeyRef.current && !activatingRef.current.has(path)) {
      setActiveDevicePath(path)
      return
    }
    // Mark as activating to prevent concurrent duplicate calls for the same path
    activatingRef.current.add(path)
    lastActivationKeyRef.current = key

    setActiveDevicePath(path)
    setDeviceStates(prev => {
      if (prev.has(path)) {
        const existing = prev.get(path)!
        return new Map(prev).set(path, { ...existing, estimatedSizeBytes: null, syncedMusicBytes: null, isActivatingDevice: true })
      }
      // Placeholder while loading
      return new Map(prev).set(path, { selectedItems: new Set(), syncedItems: new Set(), syncedItemsInfo: [], outOfSyncItems: new Set(), estimatedSizeBytes: null, syncedMusicBytes: null, isActivatingDevice: true, isCalculatingSize: false })
    })
    try {
      // Step 1: get already-synced items from local DB (no Jellyfin calls)
      const items = await window.api.getSyncedItems(path)
      const syncedIds = new Set(items.map((i: { id: string }) => i.id))

      // Step 2: only call analyzeDiff for items already on device (Bug A fix)
      // In fresh install syncedIds is empty → 0 Jellyfin calls
      const idsToAnalyze = options?.itemIds.filter(id => syncedIds.has(id)) ?? []

      const [outOfSyncResult, sizeResult] = await Promise.all([
        idsToAnalyze.length > 0 && options
          ? window.api.analyzeDiff({
              serverUrl: options.serverUrl,
              apiKey: options.apiKey,
              userId: options.userId,
              itemIds: idsToAnalyze,
              itemTypes: options.itemTypes,
              destinationPath: path,
              options: { convertToMp3: options.convertToMp3, bitrate: options.bitrate, coverArtMode: options.coverArtMode ?? 'embed' },
            }).then((result: { success: boolean; items: Array<{ itemId: string; summary: { metadataChanged: number; pathChanged: number }; subItems?: Array<{ itemId: string; summary: { newTracks: number; metadataChanged: number; pathChanged: number } }> }> }) => {
              if (!result.success) return null
              const outOfSyncIds = new Set<string>()
              for (const item of result.items) {
                if (item.summary.metadataChanged > 0 || item.summary.pathChanged > 0) {
                  outOfSyncIds.add(item.itemId)
                }
                // Also mark specific sub-items (albums within artist) as out-of-sync
                if (item.subItems) {
                  for (const sub of item.subItems) {
                    if (sub.summary.metadataChanged > 0 || sub.summary.pathChanged > 0 || sub.summary.newTracks > 0) {
                      outOfSyncIds.add(sub.itemId)
                    }
                  }
                }
              }
              return outOfSyncIds
            }).catch(() => null)
          : Promise.resolve(null),
        // estimateSize for ALL selected items (new + already-synced) so the storage bar projection is accurate
        // Pass syncedIds so it can separate synced vs new bytes in a single call
        options?.itemIds && options.itemIds.length > 0
          ? window.api.estimateSize({
              serverUrl: options.serverUrl,
              apiKey: options.apiKey,
              userId: options.userId,
              itemIds: options.itemIds,
              itemTypes: options.itemTypes,
              convertToMp3: options.convertToMp3,
              bitrate: options.bitrate,
              syncedIds: [...syncedIds],
            }).catch(() => null)
          : Promise.resolve(null),
      ])
      const syncedSet = new Set(items.map((i: { id: string }) => i.id))
      const resolvedOutOfSync = outOfSyncResult ?? new Set<string>()
      setDeviceStates(prev => {
        const existing = prev.get(path)
        // Only init selectedItems if this is the first load
        const selectedItems = existing && existing.syncedItems.size === 0 && existing.selectedItems.size === 0
          ? new Set(syncedSet)
          : (existing?.selectedItems ?? new Set(syncedSet))
        return new Map(prev).set(path, {
          selectedItems,
          syncedItems: syncedSet,
          syncedItemsInfo: items,
          outOfSyncItems: resolvedOutOfSync,
          estimatedSizeBytes: sizeResult?.totalBytes ?? null,
          syncedMusicBytes: sizeResult?.syncedMusicBytes ?? null,
          isActivatingDevice: false,
          isCalculatingSize: false,
        })
      })
    } catch { /* ignore */ } finally {
      activatingRef.current.delete(path)
      setDeviceStates(prev => {
        const state = prev.get(path)
        if (!state) return prev
        return new Map(prev).set(path, { ...state, isActivatingDevice: false })
      })
    }
  }, [])

  // Refresh synced items for a device after sync completes
  const updateSyncedItems = useCallback((path: string, items: SyncedItemInfo[]) => {
    setDeviceStates(prev => {
      const state = prev.get(path) ?? EMPTY
      const syncedItems = new Set(items.map(i => i.id))
      return new Map(prev).set(path, { ...state, syncedItems, syncedItemsInfo: items })
    })
  }, [])

  // Remove device state (on disconnect or remove)
  const removeDevice = useCallback((path: string) => {
    setDeviceStates(prev => {
      const next = new Map(prev)
      next.delete(path)
      return next
    })
    setActiveDevicePath(prev => prev === path ? null : prev)
  }, [])

  // Invalidate cache so next activateDevice call re-runs analysis (e.g., after library refresh)
  const invalidateCache = useCallback(() => {
    lastActivationKeyRef.current = null
  }, [])

  const toggleItem = useCallback((id: string) => {
    if (!activeDevicePath) return
    invalidateCache()
    setDeviceStates(prev => {
      const state = prev.get(activeDevicePath) ?? EMPTY
      const next = new Set(state.selectedItems)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return new Map(prev).set(activeDevicePath, { ...state, selectedItems: next })
    })
  }, [activeDevicePath])

  const selectItems = useCallback((items: Array<{ Id: string }>) => {
    if (!activeDevicePath) return
    invalidateCache()
    setDeviceStates(prev => {
      const state = prev.get(activeDevicePath) ?? EMPTY
      const next = new Set(state.selectedItems)
      items.forEach(i => next.add(i.Id))
      return new Map(prev).set(activeDevicePath, { ...state, selectedItems: next })
    })
  }, [activeDevicePath])

  const clearSelection = useCallback(() => {
    if (!activeDevicePath) return
    invalidateCache()
    setDeviceStates(prev => {
      const state = prev.get(activeDevicePath) ?? EMPTY
      return new Map(prev).set(activeDevicePath, { ...state, selectedItems: new Set() })
    })
  }, [activeDevicePath])

  // Invalidate cache AND re-run activation with last used params
  const revalidateDevice = useCallback(async () => {
    if (!activeDevicePath) return
    lastActivationKeyRef.current = null
    await activateDevice(activeDevicePath, lastOptionsRef.current ?? undefined)
  }, [activeDevicePath])

  // Force recalculate estimatedSizeBytes and syncedMusicBytes when selection changes
  // Calls estimateSize with current selected items without going through full activateDevice
  const recalculateSize = useCallback(async (options: {
    serverUrl: string; apiKey: string; userId: string
    itemIds: string[]; itemTypes: Record<string, 'artist' | 'album' | 'playlist'>
    convertToMp3: boolean; bitrate: '128k' | '192k' | '320k'
    syncedIds?: string[]
  }) => {
    if (!activeDevicePath) return
    setDeviceStates(prev => {
      const state = prev.get(activeDevicePath) ?? EMPTY
      return new Map(prev).set(activeDevicePath, { ...state, isCalculatingSize: true })
    })
    if (options.itemIds.length === 0) {
      setDeviceStates(prev => {
        const state = prev.get(activeDevicePath) ?? EMPTY
        return new Map(prev).set(activeDevicePath, { ...state, estimatedSizeBytes: null, syncedMusicBytes: null, isCalculatingSize: false })
      })
      return
    }
    try {
      const result = await window.api.estimateSize({
        serverUrl: options.serverUrl,
        apiKey: options.apiKey,
        userId: options.userId,
        itemIds: options.itemIds,
        itemTypes: options.itemTypes,
        convertToMp3: options.convertToMp3,
        bitrate: options.bitrate,
        syncedIds: options.syncedIds,
      })
      setDeviceStates(prev => {
        const state = prev.get(activeDevicePath) ?? EMPTY
        return new Map(prev).set(activeDevicePath, { ...state, estimatedSizeBytes: result.totalBytes, syncedMusicBytes: result.syncedMusicBytes ?? null, isCalculatingSize: false })
      })
    } catch {
      setDeviceStates(prev => {
        const state = prev.get(activeDevicePath) ?? EMPTY
        return new Map(prev).set(activeDevicePath, { ...state, isCalculatingSize: false })
      })
    }
  }, [activeDevicePath])

  return {
    activeDevicePath,
    selectedTracks: activeState.selectedItems,
    previouslySyncedItems: activeState.syncedItems,
    syncedItemsInfo: activeState.syncedItemsInfo,
    outOfSyncItems: activeState.outOfSyncItems,
    estimatedSizeBytes: activeState.estimatedSizeBytes,
    syncedMusicBytes: activeState.syncedMusicBytes,
    isActivatingDevice: activeState.isActivatingDevice,
    isCalculatingSize: activeState.isCalculatingSize,
    activateDevice,
    updateSyncedItems,
    removeDevice,
    toggleItem,
    selectItems,
    clearSelection,
    invalidateCache,
    revalidateDevice,
    recalculateSize,
  }
}
