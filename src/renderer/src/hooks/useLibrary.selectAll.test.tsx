// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLibrary } from './useLibrary';
import type { JellyfinConfig } from '../appTypes';

const mockConfig: JellyfinConfig = { url: 'https://jellyfin.test', apiKey: 'test-key' };

const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock window.api for logger
const mockApi = {
  logError: vi.fn(),
};
Object.defineProperty(window, 'api', { value: mockApi, writable: true });

function createMockFetch(items: unknown[], totalCount: number, startIndex: number = 0) {
  return {
    ok: true,
    json: () =>
      Promise.resolve({
        Items: items,
        TotalRecordCount: totalCount,
        StartIndex: startIndex,
      }),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockFetch.mockReset();
});

/**
 * URL-based mocking helper for useLibrary tests.
 * Single mockImplementation that returns responses based on URL patterns.
 */
function setupFetchMock(urlToResponse: Record<string, { items: unknown[]; total: number }>) {
  mockFetch.mockImplementation((url: string) => {
    // Try to find exact match first
    if (urlToResponse[url]) {
      const { items, total } = urlToResponse[url];
      return Promise.resolve(createMockFetch(items, total));
    }
    // Fallback to pattern matching
    for (const pattern of Object.keys(urlToResponse)) {
      if (url.includes(pattern)) {
        const { items, total } = urlToResponse[pattern];
        return Promise.resolve(createMockFetch(items, total));
      }
    }
    return Promise.resolve(createMockFetch([], 0, 0));
  });
}

describe('useLibrary - selectAll with pagination', () => {
  describe('fetchAllIds', () => {
    it('fetches all item IDs for artists when total > loaded', async () => {
      setupFetchMock({
        '/Artists?SortBy=Name&Limit=50&StartIndex=0': {
          items: [
            { Id: 'artist-1', Name: 'Artist 1', AlbumCount: 5, ImageTags: {} },
            { Id: 'artist-2', Name: 'Artist 2', AlbumCount: 3, ImageTags: {} },
          ],
          total: 4,
        },
        '/Artists?SortBy=Name&Limit=50&StartIndex=2': {
          items: [
            { Id: 'artist-3', Name: 'Artist 3', AlbumCount: 2, ImageTags: {} },
            { Id: 'artist-4', Name: 'Artist 4', AlbumCount: 1, ImageTags: {} },
          ],
          total: 4,
        },
        '/Items?IncludeItemTypes=MusicAlbum': { items: [], total: 0 },
        '/Items?IncludeItemTypes=Playlist': { items: [], total: 0 },
      });

      const { result } = renderHook(() => useLibrary(mockConfig, 'user-1'));

      await act(async () => {
        await result.current.loadLibrary('https://jellyfin.test', 'test-key', 'user-1');
      });

      const allIds = await act(async () => {
        return await result.current.fetchAllIds('artists');
      });

      expect(allIds).toHaveLength(4);
      expect(allIds).toContain('artist-1');
      expect(allIds).toContain('artist-2');
      expect(allIds).toContain('artist-3');
      expect(allIds).toContain('artist-4');
    });

    it('fetches all item IDs for albums when total > loaded', async () => {
      setupFetchMock({
        '/Artists?SortBy=Name&Limit=50&StartIndex=0': { items: [], total: 0 },
        '/Items?IncludeItemTypes=MusicAlbum&Limit=50&StartIndex=0&Recursive=true': {
          items: [
            {
              Id: 'album-1',
              Name: 'Album 1',
              AlbumArtist: 'Artist 1',
              ImageTags: {},
              Type: 'MusicAlbum',
            },
          ],
          total: 3,
        },
        '/Items?IncludeItemTypes=MusicAlbum&Limit=50&StartIndex=1&Recursive=true': {
          items: [
            {
              Id: 'album-2',
              Name: 'Album 2',
              AlbumArtist: 'Artist 2',
              ImageTags: {},
              Type: 'MusicAlbum',
            },
          ],
          total: 3,
        },
        '/Items?IncludeItemTypes=MusicAlbum&Limit=50&StartIndex=2&Recursive=true': {
          items: [
            {
              Id: 'album-3',
              Name: 'Album 3',
              AlbumArtist: 'Artist 3',
              ImageTags: {},
              Type: 'MusicAlbum',
            },
          ],
          total: 3,
        },
        '/Items?IncludeItemTypes=Playlist': { items: [], total: 0 },
      });

      const { result } = renderHook(() => useLibrary(mockConfig, 'user-1'));

      await act(async () => {
        await result.current.loadLibrary('https://jellyfin.test', 'test-key', 'user-1');
      });

      const allIds = await act(async () => {
        return await result.current.fetchAllIds('albums');
      });

      expect(allIds).toHaveLength(3);
      expect(allIds).toContain('album-1');
      expect(allIds).toContain('album-2');
      expect(allIds).toContain('album-3');
    });

    it('fetches all item IDs for playlists when total > loaded', async () => {
      setupFetchMock({
        '/Artists?SortBy=Name&Limit=50&StartIndex=0': { items: [], total: 0 },
        '/Items?IncludeItemTypes=MusicAlbum': { items: [], total: 0 },
        '/Items?IncludeItemTypes=Playlist&Limit=50&StartIndex=0&Recursive=true': {
          items: [
            { Id: 'playlist-1', Name: 'Playlist 1', ImageTags: {}, Type: 'Playlist' },
            { Id: 'playlist-2', Name: 'Playlist 2', ImageTags: {}, Type: 'Playlist' },
          ],
          total: 5,
        },
        '/Items?IncludeItemTypes=Playlist&Limit=50&StartIndex=2&Recursive=true': {
          items: [
            { Id: 'playlist-3', Name: 'Playlist 3', ImageTags: {}, Type: 'Playlist' },
            { Id: 'playlist-4', Name: 'Playlist 4', ImageTags: {}, Type: 'Playlist' },
          ],
          total: 5,
        },
        '/Items?IncludeItemTypes=Playlist&Limit=50&StartIndex=4&Recursive=true': {
          items: [{ Id: 'playlist-5', Name: 'Playlist 5', ImageTags: {}, Type: 'Playlist' }],
          total: 5,
        },
      });

      const { result } = renderHook(() => useLibrary(mockConfig, 'user-1'));

      await act(async () => {
        await result.current.loadLibrary('https://jellyfin.test', 'test-key', 'user-1');
      });

      const allIds = await act(async () => {
        return await result.current.fetchAllIds('playlists');
      });

      expect(allIds).toHaveLength(5);
      expect(allIds).toContain('playlist-1');
      expect(allIds).toContain('playlist-2');
      expect(allIds).toContain('playlist-3');
      expect(allIds).toContain('playlist-4');
      expect(allIds).toContain('playlist-5');
    });

    it('returns already-loaded IDs when all items already fetched', async () => {
      setupFetchMock({
        '/Artists?SortBy=Name&Limit=50&StartIndex=0': {
          items: [
            { Id: 'artist-1', Name: 'Artist 1', AlbumCount: 5, ImageTags: {} },
            { Id: 'artist-2', Name: 'Artist 2', AlbumCount: 3, ImageTags: {} },
          ],
          total: 2,
        },
        '/Items?IncludeItemTypes=MusicAlbum': { items: [], total: 0 },
        '/Items?IncludeItemTypes=Playlist': { items: [], total: 0 },
      });

      const { result } = renderHook(() => useLibrary(mockConfig, 'user-1'));

      await act(async () => {
        await result.current.loadLibrary('https://jellyfin.test', 'test-key', 'user-1');
      });

      const allIds = await act(async () => {
        return await result.current.fetchAllIds('artists');
      });

      expect(allIds).toHaveLength(2);
    });

    it('deduplicates IDs across multiple pages', async () => {
      setupFetchMock({
        '/Artists?SortBy=Name&Limit=50&StartIndex=0': {
          items: [
            { Id: 'artist-1', Name: 'Artist 1', AlbumCount: 5, ImageTags: {} },
            { Id: 'artist-2', Name: 'Artist 2', AlbumCount: 3, ImageTags: {} },
          ],
          total: 3,
        },
        '/Artists?SortBy=Name&Limit=50&StartIndex=2': {
          items: [
            { Id: 'artist-2', Name: 'Artist 2', AlbumCount: 3, ImageTags: {} },
            { Id: 'artist-3', Name: 'Artist 3', AlbumCount: 2, ImageTags: {} },
          ],
          total: 3,
        },
        '/Items?IncludeItemTypes=MusicAlbum': { items: [], total: 0 },
        '/Items?IncludeItemTypes=Playlist': { items: [], total: 0 },
      });

      const { result } = renderHook(() => useLibrary(mockConfig, 'user-1'));

      await act(async () => {
        await result.current.loadLibrary('https://jellyfin.test', 'test-key', 'user-1');
      });

      const allIds = await act(async () => {
        return await result.current.fetchAllIds('artists');
      });

      expect(allIds).toHaveLength(3);
      expect(allIds).toEqual(['artist-1', 'artist-2', 'artist-3']);
    });
  });

  describe('selectAllWithCompleteSet', () => {
    it('selects all items including unloaded pages and calls onSelectAllIds', async () => {
      setupFetchMock({
        '/Artists?SortBy=Name&Limit=50&StartIndex=0': {
          items: [
            { Id: 'artist-1', Name: 'Artist 1', AlbumCount: 5, ImageTags: {} },
            { Id: 'artist-2', Name: 'Artist 2', AlbumCount: 3, ImageTags: {} },
          ],
          total: 5,
        },
        '/Artists?SortBy=Name&Limit=50&StartIndex=2': {
          items: [{ Id: 'artist-3', Name: 'Artist 3', AlbumCount: 2, ImageTags: {} }],
          total: 5,
        },
        '/Artists?SortBy=Name&Limit=50&StartIndex=3': {
          items: [{ Id: 'artist-4', Name: 'Artist 4', AlbumCount: 1, ImageTags: {} }],
          total: 5,
        },
        '/Artists?SortBy=Name&Limit=50&StartIndex=4': {
          items: [{ Id: 'artist-5', Name: 'Artist 5', AlbumCount: 4, ImageTags: {} }],
          total: 5,
        },
        '/Items?IncludeItemTypes=MusicAlbum': { items: [], total: 0 },
        '/Items?IncludeItemTypes=Playlist': { items: [], total: 0 },
      });

      const { result } = renderHook(() => useLibrary(mockConfig, 'user-1'));
      const onSelectAllIds = vi.fn();

      await act(async () => {
        await result.current.loadLibrary('https://jellyfin.test', 'test-key', 'user-1');
      });

      await act(async () => {
        await result.current.selectAllWithCompleteSet('artists', onSelectAllIds);
      });

      expect(onSelectAllIds).toHaveBeenCalledWith([
        'artist-1',
        'artist-2',
        'artist-3',
        'artist-4',
        'artist-5',
      ]);
    });

    it('shows loading state during fetch when items not fully loaded', async () => {
      setupFetchMock({
        '/Artists?SortBy=Name&Limit=50&StartIndex=0': {
          items: [{ Id: 'artist-1', Name: 'Artist 1', AlbumCount: 1, ImageTags: {} }],
          total: 3,
        },
        '/Artists?SortBy=Name&Limit=50&StartIndex=1': {
          items: [{ Id: 'artist-2', Name: 'Artist 2', AlbumCount: 1, ImageTags: {} }],
          total: 3,
        },
        '/Artists?SortBy=Name&Limit=50&StartIndex=2': {
          items: [{ Id: 'artist-3', Name: 'Artist 3', AlbumCount: 1, ImageTags: {} }],
          total: 3,
        },
        '/Items?IncludeItemTypes=MusicAlbum': { items: [], total: 0 },
        '/Items?IncludeItemTypes=Playlist': { items: [], total: 0 },
      });

      const { result } = renderHook(() => useLibrary(mockConfig, 'user-1'));
      const onSelectAllIds = vi.fn();

      await act(async () => {
        await result.current.loadLibrary('https://jellyfin.test', 'test-key', 'user-1');
      });

      // Start selectAll and check loading state immediately
      let selectAllPromise: Promise<void>;
      act(() => {
        selectAllPromise = result.current.selectAllWithCompleteSet('artists', onSelectAllIds);
      });

      // Loading state should be true immediately
      expect(result.current.isSelectingAll).toBe(true);

      // Wait for selectAll to complete
      await act(async () => {
        await selectAllPromise!;
      });

      // Should no longer be loading after completion
      expect(result.current.isSelectingAll).toBe(false);
      expect(onSelectAllIds).toHaveBeenCalledWith(['artist-1', 'artist-2', 'artist-3']);
    });
  });
});
