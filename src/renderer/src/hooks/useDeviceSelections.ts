import { useState, useCallback } from 'react'

export interface SyncedItemInfo {
  id: string
  name: string
  type: 'artist' | 'album' | 'playlist'
}

interface DeviceState {
  selectedItems: Set<string>
  syncedItems: Set<string>
  syncedItemsInfo: SyncedItemInfo[]
}

const EMPTY: DeviceState = { selectedItems: new Set(), syncedItems: new Set(), syncedItemsInfo: [] }

export function useDeviceSelections() {
  const [deviceStates, setDeviceStates] = useState<Map<string, DeviceState>>(new Map())
  const [activeDevicePath, setActiveDevicePath] = useState<string | null>(null)

  const activeState = activeDevicePath
    ? (deviceStates.get(activeDevicePath) ?? EMPTY)
    : EMPTY

  // Activate a device: load its synced items and init selection on first visit
  const activateDevice = useCallback(async (path: string) => {
    setActiveDevicePath(path)
    setDeviceStates(prev => {
      if (prev.has(path)) return prev
      // Placeholder while loading
      return new Map(prev).set(path, { selectedItems: new Set(), syncedItems: new Set(), syncedItemsInfo: [] })
    })
    try {
      const items = await window.api.getSyncedItems(path)
      const syncedSet = new Set(items.map(i => i.id))
      setDeviceStates(prev => {
        const existing = prev.get(path)
        // Only init selectedItems if this is the first load
        const selectedItems = existing && existing.syncedItems.size === 0 && existing.selectedItems.size === 0
          ? new Set(syncedSet)
          : (existing?.selectedItems ?? new Set(syncedSet))
        return new Map(prev).set(path, { selectedItems, syncedItems: syncedSet, syncedItemsInfo: items })
      })
    } catch { /* ignore */ }
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

  const toggleItem = useCallback((id: string) => {
    if (!activeDevicePath) return
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
    setDeviceStates(prev => {
      const state = prev.get(activeDevicePath) ?? EMPTY
      const next = new Set(state.selectedItems)
      items.forEach(i => next.add(i.Id))
      return new Map(prev).set(activeDevicePath, { ...state, selectedItems: next })
    })
  }, [activeDevicePath])

  const clearSelection = useCallback(() => {
    if (!activeDevicePath) return
    setDeviceStates(prev => {
      const state = prev.get(activeDevicePath) ?? EMPTY
      return new Map(prev).set(activeDevicePath, { ...state, selectedItems: new Set() })
    })
  }, [activeDevicePath])

  return {
    activeDevicePath,
    selectedTracks: activeState.selectedItems,
    previouslySyncedItems: activeState.syncedItems,
    syncedItemsInfo: activeState.syncedItemsInfo,
    activateDevice,
    updateSyncedItems,
    removeDevice,
    toggleItem,
    selectItems,
    clearSelection,
  }
}
