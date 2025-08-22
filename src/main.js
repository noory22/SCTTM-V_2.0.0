import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import fs from 'fs';
import started from 'electron-squirrel-startup';
import "./index.css";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

// IPC handlers for configuration management
ipcMain.handle('read-config-file', async () => {
  const configPath = path.join(app.getPath('userData'), 'ConfigFile.csv');
  
  if (!fs.existsSync(configPath)) {
    // Create empty file with headers if doesn't exist
    const headers = 'ConfigName,Distance,Temperature,Peak Force\n';
    fs.writeFileSync(configPath, headers);
    return [];
  }
  
  const data = fs.readFileSync(configPath, 'utf8');
  const lines = data.trim().split('\n');
  const configs = [];
  
  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const [configName, distance, temperature, peakForce] = lines[i].split(',');
    if (configName && configName.trim() !== '') {
      configs.push({ 
        configName: configName.trim(), 
        distance: distance.trim(), 
        temperature: temperature.trim(), 
        peakForce: peakForce.trim() 
      });
    }
  }
  
  return configs;
});

ipcMain.handle('write-config-file', async (event, configs) => {
  const configPath = path.join(app.getPath('userData'), 'ConfigFile.csv');
  let csvData = 'ConfigName,Distance,Temperature,Peak Force\n';
  
  configs.forEach(config => {
    csvData += `${config.configName},${config.distance},${config.temperature},${config.peakForce}\n`;
  });
  
  fs.writeFileSync(configPath, csvData);
  return true;
});

ipcMain.handle('delete-config-file', async (event, configName) => {
  const configPath = path.join(app.getPath('userData'), 'ConfigFile.csv');
  
  if (!fs.existsSync(configPath)) {
    return false;
  }
  
  const data = fs.readFileSync(configPath, 'utf8');
  const lines = data.trim().split('\n');
  const header = lines[0];
  const updatedLines = [header];
  
  for (let i = 1; i < lines.length; i++) {
    const [currentConfigName] = lines[i].split(',');
    if (currentConfigName.trim() !== configName) {
      updatedLines.push(lines[i]);
    }
  }
  
  fs.writeFileSync(configPath, updatedLines.join('\n'));
  return true;
});

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools in development
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.webContents.openDevTools();
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});