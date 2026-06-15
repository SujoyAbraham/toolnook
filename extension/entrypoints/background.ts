import { defineBackground } from "#imports";

export default defineBackground(() => {
  // Chrome/Edge: open the side panel when the toolbar icon is clicked.
  // Firefox uses sidebar_action (generated from the sidepanel entrypoint),
  // which toggles its own sidebar button automatically.
  const sidePanel = (globalThis as typeof globalThis & { chrome?: any }).chrome?.sidePanel;
  if (sidePanel?.setPanelBehavior) {
    sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});
  }
});
