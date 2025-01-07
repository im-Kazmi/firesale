/// <reference types="vite/client" />
/// <reference types="electron" />

declare interface AppState {
  currentFilePath: string | null;
  isFileDirty: boolean;
  recentFiles: string[];
}

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

declare interface Window {
  api: {
    onFileOpen: (cb: (content: string, path: string) => void) => void;
    showOpenDialog: () => void;
    showExportDialog: (htmlContent: string) => void;
    openInDefaultApp: () => void;
    saveFile: (markdownText: string) => void;
    getAppState: () => AppState;
    showFileInFolder: () => void;
  };
}
