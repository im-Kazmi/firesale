import { renderMarkdown } from "./markdown";
import Elements from "./elements";

window.api.onFileOpen((content) => {
  Elements.MarkdownView.textContent = content;
  renderMarkdown(content);
});

Elements.MarkdownView.addEventListener("input", async () => {
  const markdownValue = Elements.MarkdownView.value;

  renderMarkdown(markdownValue);
});

Elements.OpenFileButton.addEventListener("click", async () => {
  window.api.showOpenDialog();
});

Elements.SaveMarkdownButton.addEventListener("click", async () => {
  const markdownData = Elements.MarkdownView.value;

  window.api.saveFile(markdownData);
});

Elements.ExportHtmlButton.addEventListener("click", async () => {
  const renderedHTML = Elements.RenderedView.innerHTML;
  window.api.showExportDialog(renderedHTML);
});
