"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cucumber_1 = require("@cucumber/cucumber");
const test_1 = require("@playwright/test");
// Given steps
(0, cucumber_1.Given)('el usuario ha configurado un servidor válido', async function () {
    await this.page.fill('[data-testid="server-url-input"]', 'https://jellyfin.example.com');
    await this.page.fill('[data-testid="api-key-input"]', 'valid-key');
});
(0, cucumber_1.Given)('el servidor Jellyfin está caído', async function () {
    // Simular servidor caído - el test de conexión fallará
    this.testData.serverDown = true;
});
(0, cucumber_1.Given)('el usuario está intentando conectar', async function () {
    await this.page.fill('[data-testid="server-url-input"]', 'https://jellyfin.example.com');
    await this.page.fill('[data-testid="api-key-input"]', 'valid-key');
    await this.page.click('[data-testid="connect-button"]');
});
(0, cucumber_1.Given)('el usuario ingresa credenciales', async function () {
    await this.page.fill('[data-testid="server-url-input"]', 'https://jellyfin.example.com');
    await this.page.fill('[data-testid="api-key-input"]', 'expired-key');
});
(0, cucumber_1.Given)('el usuario está navegando la biblioteca', async function () {
    await this.page.waitForSelector('[data-testid="library-screen"]');
});
(0, cucumber_1.Given)('el usuario está conectado', async function () {
    await this.page.waitForSelector('[data-testid="library-screen"]');
});
// Eliminada duplicación: la sincronización está en progreso está en synchronization.steps.ts
// Eliminada duplicación: hay un dispositivo USB conectado está en synchronization.steps.ts
(0, cucumber_1.Given)('el dispositivo está protegido contra escritura', async function () {
    this.testData.writeProtected = true;
});
// When steps
// Eliminada duplicación: el servidor Jellyfin está caído como When
(0, cucumber_1.When)('el usuario intenta conectar', async function () {
    await this.page.click('[data-testid="connect-button"]');
});
(0, cucumber_1.When)('el servidor tarda más de 30 segundos en responder', async function () {
    // Simular timeout - esperar >30 segundos
    await this.page.waitForTimeout(35000);
});
(0, cucumber_1.When)('la API key ha expirado', async function () {
    // Simular API key expirada
    this.testData.expiredApiKey = true;
});
(0, cucumber_1.When)('se pierde la conexión a internet', async function () {
    await this.page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('network-offline'));
    });
});
(0, cucumber_1.When)('ocurre un error al cargar la biblioteca', async function () {
    this.testData.libraryLoadError = true;
});
(0, cucumber_1.When)('se encuentra un archivo corrupto', async function () {
    // Simular archivo corrupto durante sync
    this.testData.corruptFile = true;
});
(0, cucumber_1.When)('el usuario intenta sincronizar', async function () {
    await this.page.click('[data-testid="sync-button"]');
});
// Then steps
(0, cucumber_1.Then)('debería mostrarse un mensaje de error amigable', async function () {
    await this.page.waitForSelector('[data-testid="error-message"]', { timeout: 10000 });
});
// Eliminada duplicación: el mensaje debería decir {string} está en authentication.steps.ts
(0, cucumber_1.Then)('debería mostrar {string}', async function (suggestion) {
    const suggestionElement = this.page.locator(`text=${suggestion}`);
    await (0, test_1.expect)(suggestionElement).toBeVisible();
});
(0, cucumber_1.Then)('debería ofrecer la opción {string}', async function (option) {
    const button = this.page.locator(`button:has-text("${option}")`);
    await (0, test_1.expect)(button).toBeVisible();
});
// Eliminada duplicación: el botón {string} debería estar disponible está en synchronization.steps.ts
(0, cucumber_1.Then)('debería indicar {string}', async function (message) {
    const messageElement = this.page.locator(`text=${message}`);
    await (0, test_1.expect)(messageElement).toBeVisible();
});
(0, cucumber_1.Then)('debería redirigir a la pantalla de login', async function () {
    await this.page.waitForSelector('[data-testid="auth-screen"]');
});
(0, cucumber_1.Then)('debería mostrarse el contenido en caché si está disponible', async function () {
    const cachedContent = this.page.locator('[data-testid="cached-content"]');
    await (0, test_1.expect)(cachedContent).toBeVisible();
});
(0, cucumber_1.Then)('debería mostrar el estado {string}', async function (status) {
    const statusElement = this.page.locator(`[data-testid="connection-status"]:has-text("${status}")`);
    await (0, test_1.expect)(statusElement).toBeVisible();
});
(0, cucumber_1.Then)('debería mostrar el detalle del error', async function () {
    const errorDetail = this.page.locator('[data-testid="error-detail"]');
    await (0, test_1.expect)(errorDetail).toBeVisible();
});
(0, cucumber_1.Then)('debería ofrecer {string} o {string}', async function (option1, option2) {
    const button1 = this.page.locator(`button:has-text("${option1}")`);
    const button2 = this.page.locator(`button:has-text("${option2}")`);
    const visible = await button1.isVisible().catch(() => false) || await button2.isVisible().catch(() => false);
    (0, test_1.expect)(visible).toBe(true);
});
(0, cucumber_1.Then)('debería registrar el error en logs', async function () {
    // Verificar que hay indicadores de error en la UI
    await (0, test_1.expect)(this.page.locator('[data-testid="error-logged-indicator"]')).toBeVisible();
});
(0, cucumber_1.Then)('debería continuar con la siguiente canción', async function () {
    const progressBar = this.page.locator('[data-testid="sync-progress-bar"]');
    await (0, test_1.expect)(progressBar).toBeVisible();
});
(0, cucumber_1.Then)('al finalizar debería mostrarse {string}', async function (message) {
    await this.page.waitForSelector(`text=${message}`, { timeout: 30000 });
});
(0, cucumber_1.Then)('debería ofrecer ver el reporte de errores', async function () {
    const viewReportButton = this.page.locator('button:has-text("Ver reporte")');
    await (0, test_1.expect)(viewReportButton).toBeVisible();
});
// Eliminada duplicación: debería sugerir {string} está en filters-search.steps.ts
(0, cucumber_1.Then)('debería mostrarse un mensaje genérico amigable', async function () {
    const friendlyError = this.page.locator('[data-testid="friendly-error"]');
    await (0, test_1.expect)(friendlyError).toBeVisible();
});
(0, cucumber_1.Then)('no debería mostrarse código de error técnico al usuario', async function () {
    const technicalError = this.page.locator('[data-testid="technical-error-code"]');
    const isVisible = await technicalError.isVisible().catch(() => false);
    (0, test_1.expect)(isVisible).toBe(false);
});
(0, cucumber_1.Then)('los detalles técnicos deberían estar disponibles para soporte', async function () {
    const technicalDetails = this.page.locator('[data-testid="technical-details"]');
    await (0, test_1.expect)(technicalDetails).toBeVisible();
});
