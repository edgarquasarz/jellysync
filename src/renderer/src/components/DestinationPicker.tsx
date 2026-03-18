import { HardDrive, Folder, FolderOpen, X, Usb } from 'lucide-react'
import type { UsbDevice } from '../appTypes'

function formatBytes(bytes: number): string {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(0)} GB`
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(0)} MB`
  return `${(bytes / 1e3).toFixed(0)} KB`
}

interface DestinationPickerProps {
  currentFolder: string | null
  devices: UsbDevice[]
  recentFolders: string[]
  onSelect: (path: string) => void
  onBrowse: () => void
  onRemoveRecent: (path: string) => void
}

export function DestinationPicker({
  currentFolder,
  devices,
  recentFolders,
  onSelect,
  onBrowse,
  onRemoveRecent,
}: DestinationPickerProps): JSX.Element {
  // USB devices that have a mountpoint
  const mountedDevices = devices.flatMap(d =>
    d.mountpoints.map(mp => ({ device: d, path: mp.path }))
  )

  const isSelected = (path: string) => currentFolder === path

  return (
    <div className="space-y-2">
      {/* USB Devices */}
      {mountedDevices.length > 0 && (
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2 px-1">USB Devices</p>
          {mountedDevices.map(({ device, path }) => {
            const free = device.deviceInfo?.free
            const total = device.deviceInfo?.total
            const usedPct = total && free != null ? Math.round(((total - free) / total) * 100) : null

            return (
              <button
                key={path}
                onClick={() => onSelect(path)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                  isSelected(path) ? 'bg-blue-600/20 border border-blue-600/50' : 'bg-zinc-800 hover:bg-zinc-700 border border-transparent'
                }`}
              >
                <Usb className={`w-5 h-5 flex-shrink-0 ${isSelected(path) ? 'text-blue-400' : 'text-zinc-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {device.productName || device.displayName || 'USB Device'}
                  </p>
                  <p className="text-xs text-zinc-500 truncate">{path}</p>
                  {total != null && free != null && usedPct != null && (
                    <div className="mt-1.5">
                      <div className="w-full bg-zinc-700 rounded-full h-1">
                        <div
                          className="bg-blue-500 h-1 rounded-full"
                          style={{ width: `${usedPct}%` }}
                        />
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">{formatBytes(free)} free of {formatBytes(total)}</p>
                    </div>
                  )}
                </div>
                {isSelected(path) && <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />}
              </button>
            )
          })}
        </div>
      )}

      {/* Recent Folders */}
      {recentFolders.length > 0 && (
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2 px-1 mt-3">Recent</p>
          {recentFolders.map(path => (
            <div
              key={path}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                isSelected(path) ? 'bg-blue-600/20 border border-blue-600/50' : 'bg-zinc-800 border border-transparent'
              }`}
            >
              <button
                onClick={() => onSelect(path)}
                className="flex items-center gap-3 flex-1 min-w-0 text-left hover:opacity-80"
              >
                <Folder className={`w-5 h-5 flex-shrink-0 ${isSelected(path) ? 'text-blue-400' : 'text-zinc-400'}`} />
                <p className="text-sm truncate">{path}</p>
              </button>
              {isSelected(path) && <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />}
              <button
                onClick={() => onRemoveRecent(path)}
                className="p-1 text-zinc-600 hover:text-zinc-400 flex-shrink-0"
                title="Remove from recents"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Browse */}
      <div className={mountedDevices.length > 0 || recentFolders.length > 0 ? 'mt-3' : ''}>
        {mountedDevices.length === 0 && recentFolders.length === 0 && (
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2 px-1">Destination</p>
        )}
        <button
          onClick={onBrowse}
          className="w-full flex items-center gap-3 p-3 rounded-lg border border-dashed border-zinc-700 hover:border-zinc-500 transition-colors text-left"
        >
          <FolderOpen className="w-5 h-5 text-zinc-500 flex-shrink-0" />
          <div>
            <p className="text-sm text-zinc-400">Browse...</p>
            <p className="text-xs text-zinc-600">Choose a folder manually</p>
          </div>
        </button>
      </div>

      {/* Current selection if not in any list */}
      {currentFolder && !mountedDevices.some(d => d.path === currentFolder) && !recentFolders.includes(currentFolder) && (
        <div className="p-3 bg-blue-600/20 border border-blue-600/50 rounded-lg flex items-center gap-3">
          <HardDrive className="w-5 h-5 text-blue-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-zinc-400">Selected</p>
            <p className="text-sm font-mono truncate">{currentFolder}</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
        </div>
      )}
    </div>
  )
}
