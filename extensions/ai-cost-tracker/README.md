# AI Cost Tracker

Dev-loadable Chrome extension for tracking AI usage by creative project.

## MVP behavior

- Works on ChatGPT, Claude, Adobe Firefly, and fal.ai web pages.
- Detects visible conversation or prompt text and estimates token counts from page text length.
- Stores metadata only: project, tool, model, token estimates, cost estimate, rating, note, URL, and title.
- Uses `chrome.storage.local`; there is no account, server, or sync.
- Labels costs as API-equivalent estimates, not exact subscription or provider billing.
- Uses manual cost override for surfaces where pricing is credit-based or model-specific.

## Install locally

1. Download or copy this folder.
2. Open Chrome and go to `chrome://extensions`.
3. Enable Developer Mode.
4. Click Load unpacked.
5. Select the `extensions/ai-cost-tracker` folder.
6. Pin AI Cost Tracker from the Chrome extensions menu.

## Test flow

1. Open a supported AI page: ChatGPT, Claude, Firefly, or fal.ai.
2. Open the extension popup.
3. Confirm the detected tool, model, turn count, and estimated cost.
4. Create or select a project.
5. Add a rating/note and click Log usage.
6. Export JSON when you want a portable backup.
