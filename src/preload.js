// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import "./index.css";  
// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  readConfigFile: () => ipcRenderer.invoke('read-config-file'),
  writeConfigFile: (configs) => ipcRenderer.invoke('write-config-file', configs),
  deleteConfigFile: (configName) => ipcRenderer.invoke('delete-config-file', configName)
});