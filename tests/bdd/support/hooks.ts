import { Before, After, Status, BeforeAll, AfterAll } from '@cucumber/cucumber';
import { ICustomWorld } from './world';
import { launchApp, closeApp, getMainWindow } from './app-launcher';

// Aumentar el timeout para Electron
const ELECTRON_TIMEOUT = 60000; // 60 segundos

Before({ timeout: ELECTRON_TIMEOUT }, async function (this: ICustomWorld) {
  try {
    this.app = await launchApp();
    this.page = await getMainWindow(this.app);
    this.testData = {};
  } catch (error) {
    console.error('Failed to launch app:', error);
    throw error;
  }
});

After(async function (this: ICustomWorld, scenario) {
  // Tomar screenshot si el test falló
  if (scenario.result?.status === Status.FAILED && this.page) {
    const screenshot = await this.page.screenshot({
      path: `./tests/bdd/screenshots/${scenario.pickle.name.replace(/\s+/g, '_')}.png`,
      fullPage: true,
    });
    this.attach(screenshot, 'image/png');
  }
  
  // Cerrar la aplicación
  if (this.app) {
    await closeApp(this.app);
  }
  
  this.app = undefined;
  this.page = undefined;
});