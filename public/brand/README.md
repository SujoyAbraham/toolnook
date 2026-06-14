# Brand assets

Store ToolNook logo / icon source files and large raster exports here.
Files in `public/` are served at the site root, so a file at
`public/brand/toolnook-icon-512.png` is reachable at `/brand/toolnook-icon-512.png`.

## Where the live favicon comes from

The browser favicon and Apple touch icon are NOT served from this folder.
Next.js auto-generates them from reserved filenames in the `app/` directory:

| File              | Purpose                         |
| ----------------- | ------------------------------- |
| `app/icon.svg`    | Browser tab favicon (placeholder: "TN" lettermark) |
| `app/apple-icon.svg` | iOS home-screen icon         |
| `app/favicon.ico` | Legacy .ico fallback (optional) |

To replace the placeholder with your own image, drop it into `app/` as
`icon.png` (recommended 512×512) and `apple-icon.png` (180×180), then delete
the matching `.svg` placeholders. Keep your master/source artwork in this
`public/brand/` folder.
