"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cucumber_1 = require("@cucumber/cucumber");
const test_1 = require("@playwright/test");
// Given steps
(0, cucumber_1.Given)('la biblioteca está cargada con múltiples artistas y géneros', async function () {
    await this.page.waitForSelector('[data-testid="library-content"]');
    const artistCount = await this.page.locator('[data-testid="artist-item"]').count();
    (0, test_1.expect)(artistCount).toBeGreaterThan(1);
});
(0, cucumber_1.Given)('el usuario está en la pestaña {string}', async function (tabName) {
    const tabMap = {
        'Artistas': 'tab-artists',
        'Álbumes': 'tab-albums',
        'Playlists': 'tab-playlists',
    };
    const testId = tabMap[tabName] || `tab-${tabName.toLowerCase()}`;
    await this.page.click(`[data-testid="${testId}"]`);
});
(0, cucumber_1.Given)('el usuario ha aplicado filtros', async function () {
    await this.page.click('[data-testid="filter-button"]');
    await this.page.click('[data-testid="filter-genre"]');
    await this.page.click('text=Rock');
});
(0, cucumber_1.Given)('el usuario está viendo artistas', async function () {
    await this.page.click('[data-testid="tab-artists"]');
    await this.page.waitForSelector('[data-testid="artists-list"]');
});
(0, cucumber_1.Given)('el usuario ha buscado {string} anteriormente', async function (searchTerm) {
    await this.page.fill('[data-testid="search-input"]', searchTerm);
    await this.page.keyboard.press('Enter');
    await this.page.waitForTimeout(500);
    await this.page.reload();
});
(0, cucumber_1.Given)('el usuario ha aplicado el filtro {string}', async function (filterText) {
    const [filterType, filterValue] = filterText.split(': ');
    await this.page.click('[data-testid="filter-button"]');
    await this.page.click(`[data-testid="filter-${filterType.toLowerCase()}"]`);
    await this.page.click(`text=${filterValue}`);
});
// When steps
(0, cucumber_1.When)('el usuario escribe {string} en el campo de búsqueda', async function (searchTerm) {
    await this.page.fill('[data-testid="search-input"]', searchTerm);
    await this.page.keyboard.press('Enter');
});
(0, cucumber_1.When)('el usuario selecciona el filtro {string}', async function (filterType) {
    await this.page.click('[data-testid="filter-button"]');
    const filterMap = {
        'Género': 'filter-genre',
        'Década': 'filter-decade',
        'Año': 'filter-year',
    };
    const testId = filterMap[filterType] || `filter-${filterType.toLowerCase()}`;
    await this.page.click(`[data-testid="${testId}"]`);
});
(0, cucumber_1.When)('el usuario selecciona {string}', async function (option) {
    await this.page.click(`text=${option}`);
});
(0, cucumber_1.When)('el usuario aplica el filtro {string}', async function (filterText) {
    const [filterType, filterValue] = filterText.split(': ');
    await this.page.click('[data-testid="filter-button"]');
    await this.page.click(`[data-testid="filter-${filterType.toLowerCase()}"]`);
    await this.page.click(`text=${filterValue}`);
});
(0, cucumber_1.When)('el usuario hace click en {string}', async function (buttonText) {
    if (buttonText === 'Limpiar filtros') {
        await this.page.click('[data-testid="clear-filters"]');
    }
    else {
        await this.page.click(`button:has-text("${buttonText}")`);
    }
});
(0, cucumber_1.When)('el usuario busca {string}', async function (searchTerm) {
    await this.page.fill('[data-testid="search-input"]', searchTerm);
    await this.page.keyboard.press('Enter');
});
(0, cucumber_1.When)('el usuario selecciona la opción de ordenamiento {string}', async function (sortOption) {
    await this.page.click('[data-testid="sort-dropdown"]');
    const sortMap = {
        'Ordenar por: A-Z': 'sort-az',
        'Ordenar por: Añadido recientemente': 'sort-recent',
        'Ordenar por: Año': 'sort-year',
    };
    const testId = sortMap[sortOption] || `sort-${sortOption.toLowerCase()}`;
    await this.page.click(`[data-testid="${testId}"]`);
});
// Then steps
(0, cucumber_1.Then)('deberían mostrarse resultados que contengan {string}', async function (searchTerm) {
    const results = this.page.locator('[data-testid="search-result"]');
    await (0, test_1.expect)(results.first()).toBeVisible();
    const count = await results.count();
    (0, test_1.expect)(count).toBeGreaterThan(0);
});
(0, cucumber_1.Then)('los resultados deberían incluir canciones, álbumes y artistas', async function () {
    await (0, test_1.expect)(this.page.locator('[data-testid="result-type-song"]')).toBeVisible();
    await (0, test_1.expect)(this.page.locator('[data-testid="result-type-album"]')).toBeVisible();
    await (0, test_1.expect)(this.page.locator('[data-testid="result-type-artist"]')).toBeVisible();
});
(0, cucumber_1.Then)('cada resultado debería mostrar su tipo \(canción, álbum, artista\)', async function () {
    const firstResult = this.page.locator('[data-testid="search-result"]').first();
    await (0, test_1.expect)(firstResult.locator('[data-testid="result-type-badge"]')).toBeVisible();
});
(0, cucumber_1.Then)('deberían mostrarse solo los artistas del género Rock', async function () {
    const activeFilter = this.page.locator('[data-testid="active-filter"]');
    await (0, test_1.expect)(activeFilter).toContainText('Rock');
});
(0, cucumber_1.Then)('el contador debería actualizarse con el total filtrado', async function () {
    const counter = this.page.locator('[data-testid="filtered-count"]');
    await (0, test_1.expect)(counter).toBeVisible();
});
(0, cucumber_1.Then)('deberían mostrarse solo los álbumes de los años 60', async function () {
    const albums = this.page.locator('[data-testid="album-item"]');
    const count = await albums.count();
    for (let i = 0; i < count; i++) {
        const year = await albums.nth(i).locator('[data-testid="album-year"]').textContent();
        const yearNum = parseInt(year || '0');
        (0, test_1.expect)(yearNum).toBeGreaterThanOrEqual(1960);
        (0, test_1.expect)(yearNum).toBeLessThan(1970);
    }
});
(0, cucumber_1.Then)('los álbumes deberían estar ordenados por año', async function () {
    const years = await this.page.locator('[data-testid="album-year"]').allTextContents();
    const yearNums = years.map(y => parseInt(y)).filter(n => !isNaN(n));
    const sorted = [...yearNums].sort((a, b) => a - b);
    (0, test_1.expect)(yearNums).toEqual(sorted);
});
(0, cucumber_1.Then)('deberían mostrarse solo álbumes de Rock de los 70s', async function () {
    const activeFilters = this.page.locator('[data-testid="active-filter"]');
    await (0, test_1.expect)(activeFilters).toContainText('Rock');
    await (0, test_1.expect)(activeFilters).toContainText('1970s');
});
(0, cucumber_1.Then)('ambos filtros deberían mostrarse como tags activos', async function () {
    const tags = this.page.locator('[data-testid="filter-tag"]');
    (0, test_1.expect)(await tags.count()).toBeGreaterThanOrEqual(2);
});
(0, cucumber_1.Then)('todos los filtros deberían eliminarse', async function () {
    const activeFilters = this.page.locator('[data-testid="active-filter"]');
    (0, test_1.expect)(await activeFilters.count()).toBe(0);
});
(0, cucumber_1.Then)('debería mostrarse la biblioteca completa', async function () {
    const artistCount = await this.page.locator('[data-testid="artist-item"]').count();
    (0, test_1.expect)(artistCount).toBeGreaterThan(0);
});
(0, cucumber_1.Then)('debería mostrarse el mensaje {string}', async function (message) {
    const messageLocator = this.page.locator(`text=${message}`);
    await (0, test_1.expect)(messageLocator).toBeVisible();
});
(0, cucumber_1.Then)('debería sugerir {string}', async function (suggestion) {
    await (0, test_1.expect)(this.page.locator(`text=${suggestion}`)).toBeVisible();
});
(0, cucumber_1.Then)('deberían mostrarse resultados de Jazz que contengan {string}', async function (searchTerm) {
    const activeFilter = this.page.locator('[data-testid="active-filter"]:has-text("Jazz")');
    await (0, test_1.expect)(activeFilter).toBeVisible();
    const results = this.page.locator('[data-testid="search-result"]');
    (0, test_1.expect)(await results.count()).toBeGreaterThan(0);
});
(0, cucumber_1.Then)('el filtro de género debería seguir activo', async function () {
    const genreFilter = this.page.locator('[data-testid="active-filter"]:has-text("Jazz")');
    await (0, test_1.expect)(genreFilter).toBeVisible();
});
(0, cucumber_1.Then)('los artistas deberían ordenarse alfabéticamente', async function () {
    const names = await this.page.locator('[data-testid="artist-name"]').allTextContents();
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    (0, test_1.expect)(names).toEqual(sorted);
});
(0, cucumber_1.Then)('los artistas deberían ordenarse por fecha de adición', async function () {
    // Verificar que se aplicó el ordenamiento
    await (0, test_1.expect)(this.page.locator('[data-testid="sort-indicator-recent"]')).toBeVisible();
});
(0, cucumber_1.Then)('debería mostrarse {string} en las búsquedas recientes', async function (searchTerm) {
    await this.page.click('[data-testid="search-input"]');
    await (0, test_1.expect)(this.page.locator(`[data-testid="recent-search"]:has-text("${searchTerm}")`)).toBeVisible();
});
(0, cucumber_1.Then)('deberían mostrarse los resultados de {string}', async function (searchTerm) {
    const searchInput = this.page.locator('[data-testid="search-input"]');
    await (0, test_1.expect)(searchInput).toHaveValue(searchTerm);
    const results = this.page.locator('[data-testid="search-result"]');
    (0, test_1.expect)(await results.count()).toBeGreaterThan(0);
});
