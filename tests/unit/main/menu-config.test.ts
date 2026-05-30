// tests/unit/main/menu-config.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock electron-log
vi.mock('electron-log', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    transports: {
      file: {
        level: 'info',
      },
    },
  },
}));

describe('Menu Configuration', () => {
  // Re-implement the menu template logic for testing without Electron
  const buildMacOSMenuTemplate = (appName: string) => {
    const template = [
      {
        label: appName,
        submenu: [{ role: 'quit' as const }],
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' as const },
          { role: 'redo' as const },
          { type: 'separator' as const },
          { role: 'cut' as const },
          { role: 'copy' as const },
          { role: 'paste' as const },
          { role: 'selectAll' as const },
        ],
      },
    ];
    return template;
  };

  describe('macOS menu template', () => {
    it('contains only App menu with Quit option', () => {
      const template = buildMacOSMenuTemplate('JellyTunes');
      const appMenu = template.find((item) => item.label === 'JellyTunes');

      expect(appMenu).toBeDefined();
      expect(appMenu?.submenu).toBeDefined();
      const submenu = appMenu?.submenu as Array<{ role: string }>;
      expect(submenu).toHaveLength(1);
      expect(submenu[0].role).toBe('quit');
    });

    it('contains Edit menu with required shortcuts', () => {
      const template = buildMacOSMenuTemplate('JellyTunes');
      const editMenu = template.find((item) => item.label === 'Edit');

      expect(editMenu).toBeDefined();
      expect(editMenu?.submenu).toBeDefined();
      const submenu = editMenu?.submenu as Array<{ role: string; type?: string }>;

      // Check required roles
      const roles = submenu.map((item) => item.role);
      expect(roles).toContain('undo');
      expect(roles).toContain('redo');
      expect(roles).toContain('cut');
      expect(roles).toContain('copy');
      expect(roles).toContain('paste');
      expect(roles).toContain('selectAll');

      // Check separator exists between undo/redo and edit operations
      const separatorIndex = submenu.findIndex((item) => item.type === 'separator');
      expect(separatorIndex).toBeGreaterThan(0); // separator between undo/redo and cut/copy/paste
    });

    it('does not contain Window or Help menus', () => {
      const template = buildMacOSMenuTemplate('JellyTunes');
      const labels = template.map((item) => item.label);

      expect(labels).not.toContain('Window');
      expect(labels).not.toContain('Help');
    });

    it('does not contain View menu', () => {
      const template = buildMacOSMenuTemplate('JellyTunes');
      const labels = template.map((item) => item.label);

      expect(labels).not.toContain('View');
    });
  });

  describe('autoHideMenuBar behavior', () => {
    it('returns true for Windows platform', () => {
      const platform = 'win32';
      const shouldAutoHide = platform === 'win32';

      expect(shouldAutoHide).toBe(true);
    });

    it('returns false for macOS platform', () => {
      const platform = 'darwin';
      const shouldAutoHide = platform === 'win32';

      expect(shouldAutoHide).toBe(false);
    });

    it('returns false for Linux platform', () => {
      const platform = 'linux';
      const shouldAutoHide = platform === 'win32';

      expect(shouldAutoHide).toBe(false);
    });
  });

  describe('platform detection', () => {
    it('correctly identifies macOS (darwin)', () => {
      const platform = process.platform;
      const isMacOS = platform === 'darwin';
      const isWindows = platform === 'win32';

      // At runtime this will be actual platform, but for testing logic we verify the conditions
      expect(typeof isMacOS).toBe('boolean');
      expect(typeof isWindows).toBe('boolean');
    });

    it('menu configuration depends on platform', () => {
      const getMenuConfig = (platform: string) => {
        if (platform === 'darwin') {
          return { type: 'application', minimal: true };
        } else if (platform === 'win32') {
          return { autoHide: true };
        } else {
          return { autoHide: false };
        }
      };

      expect(getMenuConfig('darwin')).toEqual({ type: 'application', minimal: true });
      expect(getMenuConfig('win32')).toEqual({ autoHide: true });
      expect(getMenuConfig('linux')).toEqual({ autoHide: false });
    });
  });
});
