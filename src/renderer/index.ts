import { renderMarkdown } from "./markdown";
import Elements from "./elements";

Elements.MarkdownView.addEventListener("input", async () => {
  const markdown = Elements.MarkdownView.value;
  renderMarkdown(markdown);
});

Elements.OpenFileButton.addEventListener("click", async () => {
  window.api.showOpenDialog();
});

Elements.ExportHtmlButton.addEventListener("click", async () => {
  const renderedHTML = Elements.RenderedView.innerHTML;
  window.api.showSaveDialog(renderedHTML);
});
