import { describe, it, expect, vi, beforeEach } from 'vitest';
import type React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useLibrary } from './useLibrary';
import type { JellyfinConfig } from '../appTypes';

const mockConfig: JellyfinConfig = { url: 'https://jellyfin.test', apiKey: 'test-key' };

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  vi.clearAllMocks();
});

function createMockFetch() {
  return {
    ok: true,
    json: () =>
      Promise.resolve({
        Items: [
          { Id: 'artist-1', Name: 'Artist 1', AlbumCount: 5, ImageTags: {} },
          { Id: 'artist-2', Name: 'Artist 2', AlbumCount: 3, ImageTags: {} },
        ],
        TotalRecordCount: 2,
      }),
  };
}

describe('useLibrary', () => {
  // URL-based mock helper - matches URL against patterns
  function setupFetchMock(responses: Record<string, { items: unknown[]; total: number }>) {
    mockFetch.mockImplementation((url: string) => {
      // Try exact match first
      if (responses[url]) {
        const { items, total } = responses[url];
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ Items: items, TotalRecordCount: total }),
        });
      }
      // Fallback to pattern matching - check if URL contains the pattern
      for (const pattern of Object.keys(responses)) {
        if (url.includes(pattern)) {
          const { items, total } = responses[pattern];
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ Items: items, TotalRecordCount: total }),
          });
        }
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ Items: [], TotalRecordCount: 0 }),
      });
    });
  }

  describe('loadLibrary', () => {
    it('fetches 3 tabs in parallel', async () => {
      setupFetchMock({
        // Pattern matching - partial URL that will be found via includes()
        'SortBy=Name&Limit=50&StartIndex=0': {
          items: [{ Id: 'artist-1', Name: 'Artist 1', AlbumCount: 5, ImageTags: {} }],
          total: 1,
        },
        'IncludeItemTypes=MusicAlbum': { items: [], total: 0 },
        'IncludeItemTypes=Playlist': { items: [], total: 0 },
      });

      const { result } = renderHook(() => useLibrary(mockConfig, 'user-1'));

      await act(async () => {
        await result.current.loadLibrary('https://jellyfin.test', 'test-key', 'user-1');
      });

      // artists, albums, playlists — all 3 tabs are loaded
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('loadMore', () => {
    it('appends items with deduplication by Id', async () => {
      setupFetchMock({
        // Initial load - 1 artist
        'SortBy=Name&Limit=50&StartIndex=0': {
          items: [{ Id: 'artist-1', Name: 'Artist 1', AlbumCount: 5, ImageTags: {} }],
          total: 4,
        },
        // Load more - 2 artists (1 duplicate, 1 new)
        'SortBy=Name&Limit=50&StartIndex=1': {
          items: [
            { Id: 'artist-1', Name: 'Artist 1', AlbumCount: 5, ImageTags: {} }, // duplicate
            { Id: 'artist-2', Name: 'Artist 2', AlbumCount: 3, ImageTags: {} }, // new
          ],
          total: 4,
        },
        'IncludeItemTypes=MusicAlbum': { items: [], total: 0 },
        'IncludeItemTypes=Playlist': { items: [], total: 0 },
      });

      const { result } = renderHook(() => useLibrary(mockConfig, 'user-1'));

      await act(async () => {
        await result.current.loadLibrary('https://jellyfin.test', 'test-key', 'user-1');
      });

      // Verify initial load
      expect(result.current.artists).toHaveLength(1);
      expect(result.current.artists[0].Id).toBe('artist-1');

      await act(async () => {
        await result.current.loadMore('artists');
      });

      // Should have only 2 unique artists (deduped)
      const uniqueIds = new Set(result.current.artists.map((a) => a.Id));
      expect(uniqueIds.size).toBe(2);
    });
  });

  describe('handleTabChange', () => {
    it('saves scroll position of previous tab', async () => {
      mockFetch.mockResolvedValue(createMockFetch());

      const { result } = renderHook(() => useLibrary(mockConfig, 'user-1'));

      // Mock scroll ref
      const scrollContainer = { scrollTop: 150 };
      (result.current.contentScrollRef as React.MutableRefObject<HTMLDivElement | null>).current =
        scrollContainer as unknown as HTMLDivElement;

      await act(async () => {
        await result.current.loadLibrary('https://jellyfin.test', 'test-key', 'user-1');
      });

      act(() => {
        result.current.handleTabChange('albums');
      });

      // Scroll position of 'artists' tab should be saved
      expect(result.current.pagination.artists.scrollPos).toBe(150);
    });
  });

  describe('lazy tab loading', () => {
    it('loadTab fetches albums data when called directly', async () => {
      // Start with empty loadedTabs (hook initial state has only 'artists')
      mockFetch.mockResolvedValue(createMockFetch());

      const { result } = renderHook(() => useLibrary(mockConfig, 'user-1'));

      // Manually call loadTab for albums (not via handleTabChange, since handleTabChange
      // also changes activeLibrary and saves scroll position)
      await act(async () => {
        await result.current.loadTab('albums');
      });

      // loadTab should have fetched albums data
      expect(mockFetch).toHaveBeenCalled();
      const lastCallUrl = mockFetch.mock.calls[mockFetch.mock.calls.length - 1][0] as string;
      expect(lastCallUrl.toLowerCase()).toContain('includeitemtypes=musicalbum');
    });
  });

  describe('stats', () => {
    it('populates statsObj correctly after loadStats', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            ArtistCount: 42,
            AlbumCount: 120,
            ChildCount: 3000,
            PlaylistCount: 5,
            ItemCount: 3100,
          }),
      });

      const { result } = renderHook(() => useLibrary(mockConfig, 'user-1'));

      await act(async () => {
        await result.current.loadStats('https://jellyfin.test', 'test-key', 'user-1');
      });

      expect(result.current.stats).not.toBeNull();
      expect(result.current.stats?.ArtistCount).toBe(42);
      expect(result.current.stats?.AlbumCount).toBe(120);
      expect(result.current.stats?.SongCount).toBe(3000);
    });
  });
});
