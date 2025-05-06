// main.js
const { app, BrowserWindow, ipcMain, dialog, Menu, win } = require("electron");
const path = require("path");
const fs = require("fs");

const isMac = process.platform === "darwin";

const savePath = path.join(app.getPath("userData"), "aroma.json");
const saveFilePath = path.join(app.getPath("userData"), "recipes.json");

console.log(saveFilePath);

let mainWindow;

const menuTemplate = [
  {
    label: app.name,
    submenu: [
      {
        label: "Speichern",
        click: () => {
          console.log("Speichern gedrückt");
          // hier kann z.B. ein Dialog oder ipcMain.send genutzt werden
        },
      },
      {
        label: "Laden",
        click: () => {
          console.log("Laden gedrückt");
        },
      },
      { type: "separator" },
      // isMac ? { role: "close" } : { role: "quit" },
    ],
  },
  {
    label: "Aromen",
    submenu: [
      {
        label: "Importieren",
        click: async () => {
          const result = await dialog.showOpenDialog(win, {
            title: "Aromen importieren",
            filters: [{ name: "JSON", extensions: ["json"] }],
            properties: ["openFile"],
          });

          if (!result.canceled && result.filePaths.length > 0) {
            const filePath = result.filePaths[0];

            // JSON-Datei lesen
            fs.readFile(filePath, "utf-8", (err, data) => {
              if (err) {
                console.error("Fehler beim Lesen der Datei:", err);
                return;
              }

              try {
                const jsonData = JSON.parse(data);

                fs.writeFile(
                  savePath,
                  JSON.stringify(jsonData, null, 2),
                  (writeErr) => {
                    if (writeErr) {
                      console.error("Fehler beim Speichern:", writeErr);
                    } else {
                      console.log("Datei gespeichert unter:", savePath);
                    }
                  }
                );

                // An Angular senden
                mainWindow.webContents.send("aroma-import", jsonData);
              } catch (parseErr) {
                console.error("Fehler beim Parsen:", parseErr);
              }
            });
          }
        },
      },
    ],
  },
  {
    label: "Info",
    submenu: [
      {
        label: "Info",
        click: () => {
          createInfoWindow();
        },
      },
    ],
  },
];

function createInfoWindow() {
  const infoWindow = new BrowserWindow({
    width: 400,
    height: 200,
    title: "Info",
    modal: true,
    parent: mainWindow,
    frame: true,
    resizable: false,
    minimizable: false,
    maximizable: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  infoWindow.loadFile(path.join(__dirname, "info.html"));
}

const menu = Menu.buildFromTemplate(menuTemplate);
Menu.setApplicationMenu(menu);
app.setName("lec");
// Error Handling
process.on("uncaughtException", (error) => {
  console.error("Unexpected error: ", error);
});
function createWindow() {
  app.setName("lec");
  mainWindow = new BrowserWindow({
    width: 600,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      enableRemoteModule: false,
      zoomFactor: 0.8,
    },
    icon: __dirname + "../public/VAPICON-Icon.svg",
  });

  console.log(path.join(__dirname + "../public/VAPICON-Icon.png"));

  mainWindow.loadURL("http://localhost:4200");
  // mainWindow.loadFile(
  //   path.join(__dirname, "../dist/e-liquid-calculator/browser/index.html")
  // );
  // mainWindow.loadFile(path.join(__dirname, "../app/index.html"));

  // mainWindow.openDevTools();

  mainWindow.webContents.on("did-finish-load", () => {
    // Pfad wie oben
    const aromaPath = path.join(app.getPath("userData"), "aroma.json");
    const filePath = path.join(app.getPath("userData"), "recipes.json");

    fs.access(aromaPath, fs.constants.F_OK, (err) => {
      if (!err) {
        // Datei existiert → laden
        fs.readFile(aromaPath, "utf-8", (readErr, data) => {
          if (readErr) {
            console.error(
              "Fehler beim Lesen der gespeicherten Aroma-Datei:",
              readErr
            );
            return;
          }

          try {
            const parsedData = JSON.parse(data);
            mainWindow.webContents.send("aroma-import", parsedData);
          } catch (e) {
            console.error("Fehler beim Parsen der gespeicherten Datei:", e);
          }
        });
      } else {
        console.log("Keine gespeicherte aroma.json vorhanden.");
      }
    });

    if (fs.existsSync(filePath)) {
      try {
        const data = fs.readFileSync(filePath, "utf-8");
        const recipes = JSON.parse(data);

        mainWindow.webContents.send("recipes-on-start", recipes);
      } catch (e) {
        console.error("Fehler beim Lesen von recipes.json:", e);
      }
    } else {
      console.log(
        "recipes.json nicht vorhanden – wird beim ersten Speichern erstellt."
      );
    }
  });
}
// App Lifecycle
app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// main.js (continued) const { ipcMain } = require('electron');
ipcMain.on("message", (event, message) => {
  console.log("Message from Renderer:", message);
});

ipcMain.on("save-recipe", (event, newList) => {
  // Lade bestehende Rezepte oder erzeuge leeres Array
  // let allRecipes = [];s

  // if (fs.existsSync(saveFilePath)) {
  //   try {
  //     const fileData = fs.readFileSync(saveFilePath, "utf-8");
  //     allRecipes = JSON.parse(fileData);
  //   } catch (e) {
  //     console.error("Fehler beim Lesen der bestehenden Datei:", e);
  //     // Notfalls leer starten
  //     allRecipes = newList;
  //   }
  // }
  // const isDuplicate = allRecipes.some(
  //   (r) => r.description == newRecipe.description
  // );

  // if (isDuplicate) {
  //   console.log("bereits vorhanden");
  //   return;
  // }

  // allRecipes

  fs.writeFile(saveFilePath, JSON.stringify(newList, null, 2), (err) => {
    if (err) {
      console.error("Fehler beim Speichern der Datei:", err);
    } else {
      console.log("Rezept erfolgreich gespeichert.");
      // event.reply("save-recipe-result", { success: true });
    }
  });
});
