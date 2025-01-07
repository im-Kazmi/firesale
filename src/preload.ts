import { ipcRenderer, contextBridge } from "electron";
import { EVENTS } from "./enums";

contextBridge.exposeInMainWorld("api", {
  showOpenDialog: () => ipcRenderer.send(EVENTS.OPEN_DIALOG),
  onFileOpen: (callback: (content: string) => void) => {
    ipcRenderer.on(EVENTS.FILE_OPENED, (_, content) => {
      callback(content);
    });
  },
  showExportDialog: (htmlContent: string) =>
    ipcRenderer.send(EVENTS.EXPORT_HTML, htmlContent),
  saveFile: (markdownText: string) =>
    ipcRenderer.send(EVENTS.SAVE_FILE, markdownText),
  getAppState: () => ipcRenderer.invoke(EVENTS.GET_APP_STATE),
  showFileInFolder: () => ipcRenderer.send(EVENTS.SHOW_FILE_IN_FOLER),
});
