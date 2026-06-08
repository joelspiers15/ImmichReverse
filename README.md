# Immich Backtext viewer

This small userscript injects a "Reverse Side" panel into Immich photo detail pages so you can view the paired back-side image (for photos named with _a/_b suffixes). It is intended to run in Tampermonkey (or similar userscript managers) against your Immich instance.

## Features

- Detects photos whose filenames end with `_a.jpg` or `_b.jpg` and looks up the counterpart file.
- Inserts a titled panel into the photo detail sidebar with a thumbnail and link to the counterpart image.
- Clicking the thumbnail opens a full-screen modal of the original counterpart image.

## Installation

1. Install Tampermonkey (or Violentmonkey) in your browser.
2. Open the `immich-reverse.user.js` file and copy its contents (or load it via the raw URL if hosted).
3. Create a new userscript in Tampermonkey and paste the file contents.
4. Adjust the `@match` header if your Immich domain differs from `https://photos.spiers.cc/*`.

## Usage

- Open a photo detail page in Immich. If the current photo is part of an `_a/_b` pair and the counterpart exists in the library, a "Reverse Side" panel will appear in the sidebar.

