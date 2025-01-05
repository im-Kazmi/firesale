import { app, BrowserWindow, dialog } from "electron";
import { join } from "path";
import fs from "fs/promises";

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: join(__dirname, "preload.js"),
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  mainWindow.webContents.openDevTools({
    mode: "detach",
  });

  mainWindow.once("ready-to-show", () => {
    showOpenDialog();
  });
};

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

const showOpenDialog = async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: "Markdown File", extensions: ["md"] }],
  });

  if (result.canceled) return;

  const content = await fs.readFile(result.filePaths[0], { encoding: "utf-8" });

  console.log(content);
};
