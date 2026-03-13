"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cucumber_1 = require("@cucumber/cucumber");
const test_1 = require("@playwright/test");
// Given steps
(0, cucumber_1.Given)('la biblioteca está cargada', async function () {
    await this.page.waitForSelector('[data-testid="library-content"]');
});
(0, cucumber_1.Given)('hay un dispositivo USB conectado', async function () {
    // Simular dispositivo conectado o verificar que existe
    const devices = await this.page.locator('[data-testid="usb-device"]').count();
    (0, test_1.expect)(devices).toBeGreaterThan(0);
});
(0, cucumber_1.Given)('el usuario ha seleccionado 5 canciones', async function () {
    // Seleccionar 5 canciones
    const checkboxes = this.page.locator('[data-testid="track-checkbox"]');
    for (let i = 0; i < 5; i++) {
        await checkboxes.nth(i).check();
    }
});
(0, cucumber_1.Given)('la sincronización está en progreso', async function () {
    await this.page.waitForSelector('[data-testid="sync-progress"]');
});
(0, cucumber_1.Given)('el usuario ha seleccionado canciones que exceden el espacio disponible', async function () {
    // Simular selección de muchas canciones
    const checkboxes = this.page.locator('[data-testid="track-checkbox"]');
    const count = await checkboxes.count();
    for (let i = 0; i < Math.min(count, 100); i++) {
        await checkboxes.nth(i).check();
    }
});
// When steps
(0, cucumber_1.When)('un dispositivo USB es conectado', async function () {
    // Simular evento de conexión USB
    await this.page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('usb-device-connected'));
    });
});
(0, cucumber_1.When)('el usuario marca la casilla de la canción {string}', async function (songName) {
    const track = this.page.locator(`[data-testid="track-item"]:has-text("${songName}")`);
    await track.locator('[data-testid="track-checkbox"]').check();
});
(0, cucumber_1.When)('el usuario marca la opción de sincronización {string}', async function (checkboxLabel) {
    if (checkboxLabel === 'Seleccionar todo') {
        await this.page.click('[data-testid="select-all-checkbox"]');
    }
    else {
        await this.page.check(`label:has-text("${checkboxLabel}") input[type="checkbox"]`);
    }
});
(0, cucumber_1.When)('el dispositivo USB es desconectado', async function () {
    await this.page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('usb-device-disconnected'));
    });
});
// Then steps
(0, cucumber_1.Then)('debería detectarse el dispositivo automáticamente', async function () {
    await this.page.waitForSelector('[data-testid="usb-device"]', { timeout: 5000 });
});
(0, cucumber_1.Then)('debería mostrarse el nombre del dispositivo', async function () {
    await (0, test_1.expect)(this.page.locator('[data-testid="device-name"]')).toBeVisible();
});
(0, cucumber_1.Then)('debería mostrar el espacio disponible', async function () {
    await (0, test_1.expect)(this.page.locator('[data-testid="device-free-space"]')).toBeVisible();
});
(0, cucumber_1.Then)('el botón {string} debería habilitarse', async function (buttonText) {
    const button = this.page.locator(`button:has-text("${buttonText}")`);
    await (0, test_1.expect)(button).toBeEnabled();
});
(0, cucumber_1.Then)('el contador de canciones seleccionadas debería mostrar {string}', async function (count) {
    const counter = this.page.locator('[data-testid="selected-count"]');
    await (0, test_1.expect)(counter).toHaveText(count);
});
(0, cucumber_1.Then)('el indicador de espacio requerido debería actualizarse', async function () {
    await (0, test_1.expect)(this.page.locator('[data-testid="required-space"]')).toBeVisible();
});
(0, cucumber_1.Then)('todas las canciones del álbum deberían estar marcadas', async function () {
    const checkboxes = this.page.locator('[data-testid="track-checkbox"]');
    const count = await checkboxes.count();
    for (let i = 0; i < count; i++) {
        await (0, test_1.expect)(checkboxes.nth(i)).toBeChecked();
    }
});
(0, cucumber_1.Then)('el contador debería mostrar el total de canciones del álbum', async function () {
    const totalTracks = await this.page.locator('[data-testid="track-item"]').count();
    const counter = this.page.locator('[data-testid="selected-count"]');
    await (0, test_1.expect)(counter).toHaveText(String(totalTracks));
});
(0, cucumber_1.Then)('debería iniciarse el proceso de sincronización', async function () {
    await this.page.waitForSelector('[data-testid="sync-progress"]', { timeout: 5000 });
});
(0, cucumber_1.Then)('debería mostrarse una barra de progreso', async function () {
    await (0, test_1.expect)(this.page.locator('[data-testid="sync-progress-bar"]')).toBeVisible();
});
(0, cucumber_1.Then)('la sincronización completa', async function () {
    // Esperar a que la barra de progreso llegue al 100%
    await this.page.waitForFunction(() => {
        const progressBar = document.querySelector('[data-testid="sync-progress-bar"]');
        return progressBar && progressBar.getAttribute('aria-valuenow') === '100';
    }, { timeout: 30000 });
});
(0, cucumber_1.Then)('las canciones deberían estar en el dispositivo USB', async function () {
    // Verificar que se muestra confirmación
    await (0, test_1.expect)(this.page.locator('[data-testid="sync-completed-message"]')).toBeVisible();
});
(0, cucumber_1.Then)('la sincronización debería detenerse', async function () {
    await this.page.waitForSelector('[data-testid="sync-cancelled"]', { timeout: 5000 });
});
(0, cucumber_1.Then)('los archivos parcialmente copiados deberían eliminarse', async function () {
    // Verificar estado de limpieza
    await (0, test_1.expect)(this.page.locator('[data-testid="cleanup-completed"]')).toBeVisible();
});
(0, cucumber_1.Then)('la sincronización debería pausarse', async function () {
    const status = this.page.locator('[data-testid="sync-status"]');
    await (0, test_1.expect)(status).toHaveText('Pausada');
});
(0, cucumber_1.Then)('el botón {string} debería estar disponible', async function (buttonText) {
    const button = this.page.locator(`button:has-text("${buttonText}")`);
    await (0, test_1.expect)(button).toBeVisible();
    await (0, test_1.expect)(button).toBeEnabled();
});
(0, cucumber_1.Then)('debería mostrar cuánto espacio adicional se necesita', async function () {
    await (0, test_1.expect)(this.page.locator('[data-testid="additional-space-needed"]')).toBeVisible();
});
(0, cucumber_1.Then)('la sincronización no debería iniciarse', async function () {
    // Verificar que no aparece la barra de progreso
    const progressBar = this.page.locator('[data-testid="sync-progress"]');
    await (0, test_1.expect)(progressBar).not.toBeVisible();
});
