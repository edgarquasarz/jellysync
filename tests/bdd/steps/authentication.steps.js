"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cucumber_1 = require("@cucumber/cucumber");
const test_1 = require("@playwright/test");
// Given steps
(0, cucumber_1.Given)('la aplicación Jellysync está iniciada', async function () {
    const title = await this.page.title();
    (0, test_1.expect)(title).toContain('Jellysync');
});
(0, cucumber_1.Given)('el usuario tiene una URL de servidor Jellyfin válida', async function () {
    this.testData.validUrl = 'https://jellyfin.example.com';
});
(0, cucumber_1.Given)('el usuario tiene una API key válida', async function () {
    this.testData.validApiKey = 'valid-api-key-123';
});
(0, cucumber_1.Given)('el usuario tiene una URL de servidor inválida', async function () {
    this.testData.invalidUrl = 'https://invalid-server.com';
});
(0, cucumber_1.Given)('el usuario tiene una API key inválida', async function () {
    this.testData.invalidApiKey = 'invalid-key';
});
(0, cucumber_1.Given)('el usuario está en la pantalla de autenticación', async function () {
    await this.page.waitForSelector('[data-testid="auth-screen"]');
});
(0, cucumber_1.Given)('el usuario ha ingresado credenciales válidas', async function () {
    await this.page.fill('[data-testid="server-url-input"]', 'https://jellyfin.example.com');
    await this.page.fill('[data-testid="api-key-input"]', 'valid-api-key-123');
});
// When steps
(0, cucumber_1.When)('el usuario ingresa la URL del servidor {string}', async function (url) {
    await this.page.fill('[data-testid="server-url-input"]', url);
});
(0, cucumber_1.When)('el usuario ingresa la API key {string}', async function (apiKey) {
    await this.page.fill('[data-testid="api-key-input"]', apiKey);
});
(0, cucumber_1.When)('el usuario hace click en el botón {string}', async function (buttonText) {
    const buttonMap = {
        'Conectar': '[data-testid="connect-button"]',
        'Sincronizar': '[data-testid="sync-button"]',
        'Cancelar': '[data-testid="cancel-button"]',
        'Reintentar': '[data-testid="retry-button"]',
    };
    const selector = buttonMap[buttonText] || `button:has-text("${buttonText}")`;
    await this.page.click(selector);
});
(0, cucumber_1.When)('el usuario deja el campo URL vacío', async function () {
    await this.page.fill('[data-testid="server-url-input"]', '');
});
(0, cucumber_1.When)('el usuario deja el campo API key vacío', async function () {
    await this.page.fill('[data-testid="api-key-input"]', '');
});
(0, cucumber_1.When)('el usuario marca la casilla {string}', async function (label) {
    await this.page.check(`label:has-text("${label}") input[type="checkbox"]`);
});
// Then steps
(0, cucumber_1.Then)('la aplicación debería conectarse exitosamente al servidor', async function () {
    await this.page.waitForSelector('[data-testid="library-screen"]', { timeout: 10000 });
});
(0, cucumber_1.Then)('debería mostrar la pantalla de biblioteca', async function () {
    const libraryScreen = this.page.locator('[data-testid="library-screen"]');
    await (0, test_1.expect)(libraryScreen).toBeVisible();
});
(0, cucumber_1.Then)('debería mostrar el mensaje {string}', async function (message) {
    const messageLocator = this.page.locator(`text=${message}`);
    await (0, test_1.expect)(messageLocator).toBeVisible();
});
(0, cucumber_1.Then)('la aplicación debería mostrar un mensaje de error', async function () {
    await this.page.waitForSelector('[data-testid="error-message"]');
});
(0, cucumber_1.Then)('el mensaje debería decir {string}', async function (errorMessage) {
    const errorElement = this.page.locator('[data-testid="error-message"]');
    await (0, test_1.expect)(errorElement).toContainText(errorMessage);
});
(0, cucumber_1.Then)('el botón {string} debería seguir habilitado', async function (buttonText) {
    const button = this.page.locator(`button:has-text("${buttonText}")`);
    await (0, test_1.expect)(button).toBeEnabled();
});
(0, cucumber_1.Then)('el botón {string} debería estar deshabilitado', async function (buttonText) {
    const button = this.page.locator(`button:has-text("${buttonText}")`);
    await (0, test_1.expect)(button).toBeDisabled();
});
(0, cucumber_1.Then)('debería mostrarse el mensaje de validación {string}', async function (validationMessage) {
    const validationElement = this.page.locator(`text=${validationMessage}`);
    await (0, test_1.expect)(validationElement).toBeVisible();
});
(0, cucumber_1.Then)('las credenciales deberían guardarse en el almacenamiento local', async function () {
    const savedUrl = await this.page.evaluate(() => localStorage.getItem('jellyfinUrl'));
    (0, test_1.expect)(savedUrl).toBe('https://jellyfin.example.com');
});
(0, cucumber_1.Then)('en la próxima apertura los campos deberían estar prellenados', async function () {
    await this.page.reload();
    const urlInput = this.page.locator('[data-testid="server-url-input"]');
    await (0, test_1.expect)(urlInput).toHaveValue('https://jellyfin.example.com');
});
