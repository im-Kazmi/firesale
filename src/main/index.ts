import { app, BrowserWindow, dialog, ipcMain } from "electron";
import { join } from "path";
import fs from "fs/promises";
import { EVENTS } from "../enums";
import { getAppState, updateAppState } from "../state";

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    titleBarStyle: "hidden",
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

  mainWindow.setTitle(`kazmi`);
};

app.on("ready", createWindow);

app.on("before-quit", () => {
  const { isFileDirty } = getAppState();
  if (isFileDirty) {
    const response = dialog.showMessageBoxSync({
      type: "warning",
      buttons: ["Save", "Discard", "Cancel"],
      defaultId: 0,
      cancelId: 2,
      message: "You have unsaved changes. Do you want to save before exiting?",
    });

    if (response === 0) {
      // saveFile();
    } else if (response === 1) {
      app.quit();
    }
  }
});

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
    defaultPath: "untitled.html",
  });

  if (result.canceled) return;

  const filePath = result.filePath;

  if (!filePath) return;

  await saveFile(htmlContent);
};

const showSaveDialog = async (browserWindow: BrowserWindow) => {
  const result = await dialog.showSaveDialog(browserWindow, {
    properties: ["createDirectory"],
    filters: [{ name: "Save Markdown", extensions: ["md"] }],
    defaultPath: "untitled.md",
  });

  if (result.canceled) return;

  const filePath = result.filePath;

  return filePath;
};

ipcMain.on(EVENTS.OPEN_DIALOG, async (event) => {
  const browserWindow = BrowserWindow.fromWebContents(event.sender);

  if (!browserWindow) return;

  await showOpenDialog(browserWindow);
});

ipcMain.on(EVENTS.SAVE_FILE, async (event, markdownContent) => {
  const browserWindow = BrowserWindow.fromWebContents(event.sender);

  if (!browserWindow) return;

  await saveFile(markdownContent);
});

ipcMain.on(EVENTS.SHOW_FILE_IN_FOLER, async (event) => {
  const browserWindow = BrowserWindow.fromWebContents(event.sender);

  if (!browserWindow) return;

  await dialog.showOpenDialog(browserWindow, {
    defaultPath: getAppState().currentFilePath!,
    properties: ["multiSelections"],
  });
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

const saveFile = async (data: string) => {
  try {
    const filePath =
      getAppState().currentFilePath ??
      (await showSaveDialog(BrowserWindow.getFocusedWindow()!));

    await fs.writeFile(filePath!, data, "utf-8");
    updateAppState({ currentFilePath: filePath, isFileDirty: false });
  } catch (err) {
    console.log(err);
  }
};

ipcMain.handle(EVENTS.GET_APP_STATE, () => getAppState());
