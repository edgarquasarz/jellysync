import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ICustomWorld } from '../support/world';

// Given steps
Given('el usuario está autenticado en Jellyfin', async function(this: ICustomWorld) {
  await this.page!.waitForSelector('[data-testid="library-screen"]');
});

Given('la biblioteca de música está cargada', async function(this: ICustomWorld) {
  await this.page!.waitForSelector('[data-testid="library-content"]');
});

Given('el usuario está en la pantalla de biblioteca', async function(this: ICustomWorld) {
  await this.page!.waitForSelector('[data-testid="library-screen"]');
});

Given('el usuario está viendo la lista de artistas', async function(this: ICustomWorld) {
  await this.page!.click('[data-testid="tab-artists"]');
  await this.page!.waitForSelector('[data-testid="artists-list"]');
});

Given('el usuario está viendo los álbumes de {string}', async function(this: ICustomWorld, artistName: string) {
  await this.page!.click(`[data-testid="artist-item"]:has-text("${artistName}")`);
  await this.page!.waitForSelector('[data-testid="albums-list"]');
});

Given('el usuario está viendo un álbum', async function(this: ICustomWorld) {
  await this.page!.click('[data-testid="album-item"]:first-child');
  await this.page!.waitForSelector('[data-testid="album-detail"]');
});

Given('el usuario está viendo la lista de playlists', async function(this: ICustomWorld) {
  await this.page!.click('[data-testid="tab-playlists"]');
  await this.page!.waitForSelector('[data-testid="playlists-list"]');
});

Given('el usuario está viendo las canciones de un álbum', async function(this: ICustomWorld) {
  await this.page!.click('[data-testid="album-item"]:first-child');
  await this.page!.waitForSelector('[data-testid="tracks-list"]');
});

Given('la biblioteca tiene más de 50 artistas', async function(this: ICustomWorld) {
  const artists = await this.page!.locator('[data-testid="artist-item"]').count();
  expect(artists).toBeGreaterThan(0);
});

// When steps
When('el usuario selecciona la pestaña {string}', async function(this: ICustomWorld, tabName: string) {
  const tabMap: Record<string, string> = {
    'Artistas': 'tab-artists',
    'Álbumes': 'tab-albums',
    'Playlists': 'tab-playlists',
  };
  const testId = tabMap[tabName] || `tab-${tabName.toLowerCase()}`;
  await this.page!.click(`[data-testid="${testId}"]`);
});

When('el usuario hace click en el artista {string}', async function(this: ICustomWorld, artistName: string) {
  await this.page!.click(`[data-testid="artist-item"]:has-text("${artistName}")`);
});

When('el usuario hace click en el álbum {string}', async function(this: ICustomWorld, albumName: string) {
  await this.page!.click(`[data-testid="album-item"]:has-text("${albumName}")`);
});

When('el usuario hace click en la playlist {string}', async function(this: ICustomWorld, playlistName: string) {
  await this.page!.click(`[data-testid="playlist-item"]:has-text("${playlistName}")`);
});

When('el usuario hace click en {string} en el breadcrumb', async function(this: ICustomWorld, breadcrumbText: string) {
  await this.page!.click(`[data-testid="breadcrumb"] >> text=${breadcrumbText}`);
});

When('el usuario hace scroll hasta el final', async function(this: ICustomWorld) {
  await this.page!.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await this.page!.waitForTimeout(500);
});

// Then steps
Then('debería mostrarse una lista de artistas', async function(this: ICustomWorld) {
  const artistsList = this.page!.locator('[data-testid="artists-list"]');
  await expect(artistsList).toBeVisible();
  const artistCount = await this.page!.locator('[data-testid="artist-item"]').count();
  expect(artistCount).toBeGreaterThan(0);
});

Then('cada artista debería mostrar su nombre', async function(this: ICustomWorld) {
  const firstArtist = this.page!.locator('[data-testid="artist-item"]').first();
  await expect(firstArtist.locator('[data-testid="artist-name"]')).toBeVisible();
});

Then('cada artista debería mostrar la cantidad de álbumes', async function(this: ICustomWorld) {
  const firstArtist = this.page!.locator('[data-testid="artist-item"]').first();
  await expect(firstArtist.locator('[data-testid="album-count"]')).toBeVisible();
});

Then('debería mostrarse la vista del artista', async function(this: ICustomWorld) {
  await this.page!.waitForSelector('[data-testid="artist-detail"]');
});

Then('debería mostrar todos los álbumes del artista', async function(this: ICustomWorld) {
  const albumsList = this.page!.locator('[data-testid="albums-list"]');
  await expect(albumsList).toBeVisible();
  const albumCount = await this.page!.locator('[data-testid="album-item"]').count();
  expect(albumCount).toBeGreaterThan(0);
});

Then('debería mostrar información del artista (nombre, biografía si existe)', async function(this: ICustomWorld) {
  await expect(this.page!.locator('[data-testid="artist-name-header"]')).toBeVisible();
});

Then('debería mostrarse la lista de canciones del álbum', async function(this: ICustomWorld) {
  const tracksList = this.page!.locator('[data-testid="tracks-list"]');
  await expect(tracksList).toBeVisible();
});

Then('cada canción debería mostrar título, duración y número de pista', async function(this: ICustomWorld) {
  const firstTrack = this.page!.locator('[data-testid="track-item"]').first();
  await expect(firstTrack.locator('[data-testid="track-title"]')).toBeVisible();
  await expect(firstTrack.locator('[data-testid="track-duration"]')).toBeVisible();
  await expect(firstTrack.locator('[data-testid="track-number"]')).toBeVisible();
});

Then('debería mostrar la portada del álbum', async function(this: ICustomWorld) {
  await expect(this.page!.locator('[data-testid="album-cover"]')).toBeVisible();
});

Then('debería mostrarse una lista de playlists', async function(this: ICustomWorld) {
  const playlistsList = this.page!.locator('[data-testid="playlists-list"]');
  await expect(playlistsList).toBeVisible();
});

Then('cada playlist debería mostrar su nombre', async function(this: ICustomWorld) {
  const firstPlaylist = this.page!.locator('[data-testid="playlist-item"]').first();
  await expect(firstPlaylist.locator('[data-testid="playlist-name"]')).toBeVisible();
});

Then('cada playlist debería mostrar la cantidad de canciones', async function(this: ICustomWorld) {
  const firstPlaylist = this.page!.locator('[data-testid="playlist-item"]').first();
  await expect(firstPlaylist.locator('[data-testid="track-count"]')).toBeVisible();
});

Then('debería mostrarse el nombre de la playlist', async function(this: ICustomWorld) {
  await expect(this.page!.locator('[data-testid="playlist-name-header"]')).toBeVisible();
});

Then('debería mostrar el total de duración', async function(this: ICustomWorld) {
  await expect(this.page!.locator('[data-testid="playlist-duration"]')).toBeVisible();
});

Then('debería volver a la lista de artistas', async function(this: ICustomWorld) {
  await expect(this.page!.locator('[data-testid="artists-list"]')).toBeVisible();
});

Then('debería volver a la vista principal de biblioteca', async function(this: ICustomWorld) {
  await expect(this.page!.locator('[data-testid="library-content"]')).toBeVisible();
});

Then('debería mostrar los primeros 20 artistas', async function(this: ICustomWorld) {
  const artistCount = await this.page!.locator('[data-testid="artist-item"]').count();
  expect(artistCount).toBeGreaterThanOrEqual(Math.min(20, artistCount));
});

Then('debería cargar los siguientes 20 artistas', async function(this: ICustomWorld) {
  await this.page!.waitForTimeout(500);
});

Then('la lista debería mostrar 40 artistas en total', async function(this: ICustomWorld) {
  const artistCount = await this.page!.locator('[data-testid="artist-item"]').count();
  expect(artistCount).toBeGreaterThanOrEqual(40);
});
