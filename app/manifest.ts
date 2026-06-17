import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ToolNook — A quiet workspace of professional tools",
    short_name: "ToolNook",
    description:
      "Focused browser-native tools for developers and writers. Everything runs client-side — your data never leaves the tab.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1b1b19",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
