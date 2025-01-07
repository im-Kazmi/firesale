import { renderMarkdown } from "./markdown";
import Elements from "./elements";

window.api.onFileOpen((content) => {
  Elements.MarkdownView.textContent = content;
  Elements.SaveMarkdownButton.disabled = false;
  Elements.ShowFileButton.disabled = false;
  renderMarkdown(content);
});

Elements.MarkdownView.addEventListener("input", async () => {
  const markdownValue = Elements.MarkdownView.value;
  Elements.SaveMarkdownButton.disabled = false;
  const appState = await window.api.getAppState();

  appState.isFileDirty = true;

  renderMarkdown(markdownValue);
});

Elements.OpenFileButton.addEventListener("click", async () => {
  window.api.showOpenDialog();
});

Elements.SaveMarkdownButton.addEventListener("click", async () => {
  const markdownData = Elements.MarkdownView.value;

  window.api.saveFile(markdownData);

  Elements.SaveMarkdownButton.disabled = true;
});

Elements.ExportHtmlButton.addEventListener("click", async () => {
  const renderedHTML = Elements.RenderedView.innerHTML;
  window.api.showExportDialog(renderedHTML);
});

Elements.ShowFileButton.addEventListener("click", async () => {
  window.api.showFileInFolder();
});
