const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  saveRecipe: (data) => ipcRenderer.send("save-recipe", data),
  onRecipesLoaded: (callback) =>
    ipcRenderer.on("recipes-on-start", (_event, data) => callback(data)),
  onAromaImport: (callback) =>
    ipcRenderer.on("aroma-import", (event, data) => callback(data)),
});
