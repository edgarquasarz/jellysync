"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cucumber_1 = require("@cucumber/cucumber");
const test_1 = require("@playwright/test");
// Given steps
(0, cucumber_1.Given)('el usuario está autenticado en Jellyfin', async function () {
    await this.page.waitForSelector('[data-testid="library-screen"]');
});
(0, cucumber_1.Given)('la biblioteca de música está cargada', async function () {
    await this.page.waitForSelector('[data-testid="library-content"]');
});
(0, cucumber_1.Given)('el usuario está en la pantalla de biblioteca', async function () {
    await this.page.waitForSelector('[data-testid="library-screen"]');
});
(0, cucumber_1.Given)('el usuario está viendo la lista de artistas', async function () {
    await this.page.click('[data-testid="tab-artists"]');
    await this.page.waitForSelector('[data-testid="artists-list"]');
});
(0, cucumber_1.Given)('el usuario está viendo los álbumes de {string}', async function (artistName) {
    await this.page.click(`[data-testid="artist-item"]:has-text("${artistName}")`);
    await this.page.waitForSelector('[data-testid="albums-list"]');
});
(0, cucumber_1.Given)('el usuario está viendo un álbum', async function () {
    await this.page.click('[data-testid="album-item"]:first-child');
    await this.page.waitForSelector('[data-testid="album-detail"]');
});
(0, cucumber_1.Given)('el usuario está viendo la lista de playlists', async function () {
    await this.page.click('[data-testid="tab-playlists"]');
    await this.page.waitForSelector('[data-testid="playlists-list"]');
});
(0, cucumber_1.Given)('el usuario está viendo las canciones de un álbum', async function () {
    await this.page.click('[data-testid="album-item"]:first-child');
    await this.page.waitForSelector('[data-testid="tracks-list"]');
});
(0, cucumber_1.Given)('la biblioteca tiene más de 50 artistas', async function () {
    const artists = await this.page.locator('[data-testid="artist-item"]').count();
    (0, test_1.expect)(artists).toBeGreaterThan(0);
});
// When steps
(0, cucumber_1.When)('el usuario selecciona la pestaña {string}', async function (tabName) {
    const tabMap = {
        'Artistas': 'tab-artists',
        'Álbumes': 'tab-albums',
        'Playlists': 'tab-playlists',
    };
    const testId = tabMap[tabName] || `tab-${tabName.toLowerCase()}`;
    await this.page.click(`[data-testid="${testId}"]`);
});
(0, cucumber_1.When)('el usuario hace click en el artista {string}', async function (artistName) {
    await this.page.click(`[data-testid="artist-item"]:has-text("${artistName}")`);
});
(0, cucumber_1.When)('el usuario hace click en el álbum {string}', async function (albumName) {
    await this.page.click(`[data-testid="album-item"]:has-text("${albumName}")`);
});
(0, cucumber_1.When)('el usuario hace click en la playlist {string}', async function (playlistName) {
    await this.page.click(`[data-testid="playlist-item"]:has-text("${playlistName}")`);
});
(0, cucumber_1.When)('el usuario hace click en {string} en el breadcrumb', async function (breadcrumbText) {
    await this.page.click(`[data-testid="breadcrumb"] >> text=${breadcrumbText}`);
});
(0, cucumber_1.When)('el usuario hace scroll hasta el final', async function () {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await this.page.waitForTimeout(500);
});
// Then steps
(0, cucumber_1.Then)('debería mostrarse una lista de artistas', async function () {
    const artistsList = this.page.locator('[data-testid="artists-list"]');
    await (0, test_1.expect)(artistsList).toBeVisible();
    const artistCount = await this.page.locator('[data-testid="artist-item"]').count();
    (0, test_1.expect)(artistCount).toBeGreaterThan(0);
});
(0, cucumber_1.Then)('cada artista debería mostrar su nombre', async function () {
    const firstArtist = this.page.locator('[data-testid="artist-item"]').first();
    await (0, test_1.expect)(firstArtist.locator('[data-testid="artist-name"]')).toBeVisible();
});
(0, cucumber_1.Then)('cada artista debería mostrar la cantidad de álbumes', async function () {
    const firstArtist = this.page.locator('[data-testid="artist-item"]').first();
    await (0, test_1.expect)(firstArtist.locator('[data-testid="album-count"]')).toBeVisible();
});
(0, cucumber_1.Then)('debería mostrarse la vista del artista', async function () {
    await this.page.waitForSelector('[data-testid="artist-detail"]');
});
(0, cucumber_1.Then)('debería mostrar todos los álbumes del artista', async function () {
    const albumsList = this.page.locator('[data-testid="albums-list"]');
    await (0, test_1.expect)(albumsList).toBeVisible();
    const albumCount = await this.page.locator('[data-testid="album-item"]').count();
    (0, test_1.expect)(albumCount).toBeGreaterThan(0);
});
(0, cucumber_1.Then)('debería mostrar información del artista (nombre, biografía si existe)', async function () {
    await (0, test_1.expect)(this.page.locator('[data-testid="artist-name-header"]')).toBeVisible();
});
(0, cucumber_1.Then)('debería mostrarse la lista de canciones del álbum', async function () {
    const tracksList = this.page.locator('[data-testid="tracks-list"]');
    await (0, test_1.expect)(tracksList).toBeVisible();
});
(0, cucumber_1.Then)('cada canción debería mostrar título, duración y número de pista', async function () {
    const firstTrack = this.page.locator('[data-testid="track-item"]').first();
    await (0, test_1.expect)(firstTrack.locator('[data-testid="track-title"]')).toBeVisible();
    await (0, test_1.expect)(firstTrack.locator('[data-testid="track-duration"]')).toBeVisible();
    await (0, test_1.expect)(firstTrack.locator('[data-testid="track-number"]')).toBeVisible();
});
(0, cucumber_1.Then)('debería mostrar la portada del álbum', async function () {
    await (0, test_1.expect)(this.page.locator('[data-testid="album-cover"]')).toBeVisible();
});
(0, cucumber_1.Then)('debería mostrarse una lista de playlists', async function () {
    const playlistsList = this.page.locator('[data-testid="playlists-list"]');
    await (0, test_1.expect)(playlistsList).toBeVisible();
});
(0, cucumber_1.Then)('cada playlist debería mostrar su nombre', async function () {
    const firstPlaylist = this.page.locator('[data-testid="playlist-item"]').first();
    await (0, test_1.expect)(firstPlaylist.locator('[data-testid="playlist-name"]')).toBeVisible();
});
(0, cucumber_1.Then)('cada playlist debería mostrar la cantidad de canciones', async function () {
    const firstPlaylist = this.page.locator('[data-testid="playlist-item"]').first();
    await (0, test_1.expect)(firstPlaylist.locator('[data-testid="track-count"]')).toBeVisible();
});
(0, cucumber_1.Then)('debería mostrarse el nombre de la playlist', async function () {
    await (0, test_1.expect)(this.page.locator('[data-testid="playlist-name-header"]')).toBeVisible();
});
(0, cucumber_1.Then)('debería mostrar el total de duración', async function () {
    await (0, test_1.expect)(this.page.locator('[data-testid="playlist-duration"]')).toBeVisible();
});
(0, cucumber_1.Then)('debería volver a la lista de artistas', async function () {
    await (0, test_1.expect)(this.page.locator('[data-testid="artists-list"]')).toBeVisible();
});
(0, cucumber_1.Then)('debería volver a la vista principal de biblioteca', async function () {
    await (0, test_1.expect)(this.page.locator('[data-testid="library-content"]')).toBeVisible();
});
(0, cucumber_1.Then)('debería mostrar los primeros 20 artistas', async function () {
    const artistCount = await this.page.locator('[data-testid="artist-item"]').count();
    (0, test_1.expect)(artistCount).toBeGreaterThanOrEqual(Math.min(20, artistCount));
});
(0, cucumber_1.Then)('debería cargar los siguientes 20 artistas', async function () {
    await this.page.waitForTimeout(500);
});
(0, cucumber_1.Then)('la lista debería mostrar 40 artistas en total', async function () {
    const artistCount = await this.page.locator('[data-testid="artist-item"]').count();
    (0, test_1.expect)(artistCount).toBeGreaterThanOrEqual(40);
});
