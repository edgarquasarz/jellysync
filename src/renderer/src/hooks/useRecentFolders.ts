import { useState } from 'react'

const STORAGE_KEY = 'jellysync_recent_folders'
const MAX_RECENT = 5

function loadRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function useRecentFolders() {
  const [recentFolders, setRecentFolders] = useState<string[]>(loadRecent)

  const addRecentFolder = (path: string) => {
    setRecentFolders(prev => {
      const updated = [path, ...prev.filter(p => p !== path)].slice(0, MAX_RECENT)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }

  const removeRecentFolder = (path: string) => {
    setRecentFolders(prev => {
      const updated = prev.filter(p => p !== path)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }

  return { recentFolders, addRecentFolder, removeRecentFolder }
}
