import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ICustomWorld } from '../support/world';

// Given steps
Given('la aplicación Jellysync está iniciada', async function(this: ICustomWorld) {
  const title = await this.page!.title();
  expect(title).toContain('Jellysync');
});

Given('el usuario tiene una URL de servidor Jellyfin válida', async function(this: ICustomWorld) {
  this.testData!.validUrl = 'https://jellyfin.example.com';
});

Given('el usuario tiene una API key válida', async function(this: ICustomWorld) {
  this.testData!.validApiKey = 'valid-api-key-123';
});

Given('el usuario tiene una URL de servidor inválida', async function(this: ICustomWorld) {
  this.testData!.invalidUrl = 'https://invalid-server.com';
});

Given('el usuario tiene una API key inválida', async function(this: ICustomWorld) {
  this.testData!.invalidApiKey = 'invalid-key';
});

Given('el usuario está en la pantalla de autenticación', async function(this: ICustomWorld) {
  await this.page!.waitForSelector('[data-testid="auth-screen"]');
});

Given('el usuario ha ingresado credenciales válidas', async function(this: ICustomWorld) {
  await this.page!.fill('[data-testid="server-url-input"]', 'https://jellyfin.example.com');
  await this.page!.fill('[data-testid="api-key-input"]', 'valid-api-key-123');
});

// When steps
When('el usuario ingresa la URL del servidor {string}', async (url: string) => {
  await page.fill('[data-testid="server-url-input"]', url);
});

When('el usuario ingresa la API key {string}', async (apiKey: string) => {
  await page.fill('[data-testid="api-key-input"]', apiKey);
});

When('el usuario hace click en el botón {string}', async (buttonText: string) => {
  const buttonMap: Record<string, string> = {
    'Conectar': '[data-testid="connect-button"]',
    'Sincronizar': '[data-testid="sync-button"]',
    'Cancelar': '[data-testid="cancel-button"]',
    'Reintentar': '[data-testid="retry-button"]',
  };
  const selector = buttonMap[buttonText] || `button:has-text("${buttonText}")`;
  await page.click(selector);
});

When('el usuario deja el campo URL vacío', async () => {
  await page.fill('[data-testid="server-url-input"]', '');
});

When('el usuario deja el campo API key vacío', async () => {
  await page.fill('[data-testid="api-key-input"]', '');
});

When('el usuario marca la casilla {string}', async (label: string) => {
  await page.check(`label:has-text("${label}") input[type="checkbox"]`);
});

// Then steps
Then('la aplicación debería conectarse exitosamente al servidor', async () => {
  await page.waitForSelector('[data-testid="library-screen"]', { timeout: 10000 });
});

Then('debería mostrar la pantalla de biblioteca', async () => {
  const libraryScreen = await page.locator('[data-testid="library-screen"]');
  await expect(libraryScreen).toBeVisible();
});

Then('debería mostrar el mensaje {string}', async (message: string) => {
  const messageLocator = page.locator(`text=${message}`);
  await expect(messageLocator).toBeVisible();
});

Then('la aplicación debería mostrar un mensaje de error', async () => {
  await page.waitForSelector('[data-testid="error-message"]');
});

Then('el mensaje debería decir {string}', async (errorMessage: string) => {
  const errorElement = page.locator('[data-testid="error-message"]');
  await expect(errorElement).toContainText(errorMessage);
});

Then('el botón {string} debería seguir habilitado', async (buttonText: string) => {
  const button = page.locator(`button:has-text("${buttonText}")`);
  await expect(button).toBeEnabled();
});

Then('el botón {string} debería estar deshabilitado', async (buttonText: string) => {
  const button = page.locator(`button:has-text("${buttonText}")`);
  await expect(button).toBeDisabled();
});

Then('debería mostrarse el mensaje de validación {string}', async (validationMessage: string) => {
  const validationElement = page.locator(`text=${validationMessage}`);
  await expect(validationElement).toBeVisible();
});

Then('las credenciales deberían guardarse en el almacenamiento local', async () => {
  const savedUrl = await page.evaluate(() => localStorage.getItem('jellyfinUrl'));
  expect(savedUrl).toBe('https://jellyfin.example.com');
});

Then('en la próxima apertura los campos deberían estar prellenados', async () => {
  // Simular recarga y verificar campos prellenados
  await page.reload();
  const urlInput = page.locator('[data-testid="server-url-input"]');
  await expect(urlInput).toHaveValue('https://jellyfin.example.com');
});