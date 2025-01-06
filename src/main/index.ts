import { app, BrowserWindow, dialog, ipcMain } from "electron";
import { join } from "path";
import fs from "fs/promises";
import { EVENTS } from "../enums";
import { appState, getAppState, updateAppState } from "../state";

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      nodeIntegration: true,
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

const showOpenDialog = async (browserWindow: BrowserWindow) => {
  const result = await dialog.showOpenDialog(browserWindow, {
    properties: ["openFile"],
    filters: [{ name: "Markdown File", extensions: ["md"] }],
  });

  if (result.canceled) return;

  const filePath = result.filePaths[0];

  await openFile(browserWindow, filePath);
};

const showExportDialog = async (
  browserWindow: BrowserWindow,
  htmlContent: string,
) => {
  const result = await dialog.showSaveDialog(browserWindow, {
    properties: ["createDirectory"],
    filters: [{ name: "HTML File", extensions: ["html"] }],
  });

  if (result.canceled) return;

  const filePath = result.filePath;

  if (!filePath) return;

  await saveFile(filePath, htmlContent);
};

ipcMain.on(EVENTS.OPEN_DIALOG, async (event) => {
  const browserWindow = BrowserWindow.fromWebContents(event.sender);

  if (!browserWindow) return;

  await showOpenDialog(browserWindow);
});

ipcMain.on(EVENTS.FILE_SAVED, async (event, markdownContent) => {
  const browserWindow = BrowserWindow.fromWebContents(event.sender);

  if (!browserWindow) return;

  console.log(getAppState());
  await saveFile(getAppState().currentFilePath!, markdownContent);
});

ipcMain.on(EVENTS.EXPORT_HTML, async (event, htmlContent) => {
  const browserWindow = BrowserWindow.fromWebContents(event.sender);

  if (!browserWindow) return;

  await showExportDialog(browserWindow, htmlContent);
});

const openFile = async (browserWindow: BrowserWindow, path: string) => {
  const content = await fs.readFile(path, { encoding: "utf-8" });

  updateAppState({ currentFilePath: path, isFileDirty: false });

  browserWindow.webContents.send(EVENTS.FILE_OPENED, content, path);
};

const saveFile = async (path: string, data: string) => {
  try {
    await fs.writeFile(path, data, "utf-8");
  } catch (err) {
    console.log(err);
  }
};

ipcMain.handle(EVENTS.GET_APP_STATE, () => getAppState());
