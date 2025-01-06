export interface AppState {
  currentFilePath: string | null;
  isFileDirty: boolean;
  recentFiles: string[];
}

let appState: AppState = {
  currentFilePath: null,
  isFileDirty: false,
  recentFiles: [],
};

export const getAppState = () => ({ ...appState });

export const updateAppState = (newState: Partial<AppState>) => {
  appState = { ...appState, ...newState };
};

export { appState };
