# Immich Backtext viewer

This small userscript injects a "Reverse Side" panel into Immich photo detail pages so you can view the paired back-side image. Currently relies on strategy used by my Epson FastFoto scanner (photos named with _a/_b suffixes). Should be fairly easy to modify for other matching strategies.

It is intended to run in Tampermonkey (or similar userscript managers).


## Examples

<div style="display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap">
  <img src="images/Example%201.png" alt="Example 1" style="max-width:48%;height:auto;flex:1 1 48%;border:1px solid #eee;border-radius:4px;padding:4px;background:#fff">
  <img src="images/Example%202.png" alt="Example 2" style="max-width:48%;height:auto;flex:1 1 48%;border:1px solid #eee;border-radius:4px;padding:4px;background:#fff">
</div>

## Features

- Detects photos whose filenames end with `_a.jpg` or `_b.jpg` and looks up the counterpart file.
- Inserts a titled panel into the photo detail sidebar with a thumbnail and link to the counterpart image.
- Clicking the thumbnail opens a full-screen modal of the original counterpart image.

## Installation

1. Install Tampermonkey (or Violentmonkey) in your browser.
2. Install script into Tampermonkey by opening the [raw version of the userscript file](https://github.com/joelspiers15/ImmichReverse/raw/refs/heads/main/immich-reverse.user.js).
3. Adjust the `@match` header for your immich domain (e.g. `https://photos.example.com).

## Usage

- Open a photo detail page in Immich. If the current photo is part of an `_a/_b` pair and the counterpart exists in the library, a "Reverse Side" panel will appear in the sidebar.

