import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'

interface RemoveFolderModalProps {
  name: string
  path: string
  onCancel: () => void
  onConfirm: (deleteFiles: boolean) => void
  isRemoving?: boolean
}

export function RemoveFolderModal({ name, path, onCancel, onConfirm, isRemoving }: RemoveFolderModalProps): JSX.Element {
  const [deleteFiles, setDeleteFiles] = useState(false)

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onCancel}>
      <div
        data-testid="remove-folder-modal"
        className="bg-surface_container_low border border-outline_variant rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-headline-md">Remove {name}?</h2>
          <button
            onClick={onCancel}
            className="p-1 text-on_surface_variant hover:text-on_surface transition-colors rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <p className="text-body-md text-on_surface_variant mb-4 leading-relaxed">
          <span className="text-on_surface">{name}</span> will be removed from your sidebar.
          Your sync selections are saved — re-add the folder any time to resume.
        </p>

        {/* Checkbox option */}
        <label className="flex items-start gap-3 p-3 bg-surface_container_highest rounded-lg cursor-pointer mb-4 border border-transparent hover:border-outline_variant transition-colors">
          <input
            type="checkbox"
            checked={deleteFiles}
            onChange={e => setDeleteFiles(e.target.checked)}
            disabled={isRemoving}
            className="mt-0.5 accent-primary disabled:opacity-50"
          />
          <div className="flex-1">
            <span className="text-body-md text-on_surface">Also delete synced music files from disk</span>
            <p className="text-mono-sm text-on_surface_variant mt-0.5">{path}</p>
            <p className="text-caption text-on_surface_variant/70 mt-1">
              Only files added by JellyTunes are affected. Cannot be undone.
            </p>
          </div>
        </label>

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            disabled={isRemoving}
            className="px-4 py-2 text-body-md bg-surface_container_highest hover:bg-surface_container_high text-on_surface rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(deleteFiles)}
            disabled={isRemoving}
            className={`px-4 py-2 text-body-md rounded-lg transition-colors font-medium flex items-center gap-2 ${
              deleteFiles
                ? 'bg-error hover:bg-error/80 text-on_primary_container'
                : 'bg-secondary_container hover:bg-secondary_container/80 text-on_secondary_container'
            } disabled:opacity-50`}
          >
            {isRemoving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isRemoving ? 'Deleting...' : deleteFiles ? 'Remove and delete files' : 'Remove folder'}
          </button>
        </div>
      </div>
    </div>
  )
}
