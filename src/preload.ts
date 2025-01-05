import { ipcRenderer, contextBridge } from "electron";
import { EVENTS } from "./enums";
import Elements from "./renderer/elements";
import { renderMarkdown } from "./renderer/markdown";

ipcRenderer.on(EVENTS.FILE_OPENED, (_, content: string, filePath: string) => {
  Elements.MarkdownView.textContent = content;
  renderMarkdown(content);
});

contextBridge.exposeInMainWorld("api", {
  showOpenDialog: () => ipcRenderer.send(EVENTS.OPEN_DIALOG),
  showSaveDialog: (htmlContent: string) =>
    ipcRenderer.send(EVENTS.EXPORT_HTML, htmlContent),
});
