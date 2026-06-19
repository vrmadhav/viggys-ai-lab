# AI Cost Tracker

Dev-loadable Chrome extension for tracking AI usage by creative project.

## MVP behavior

- Works on ChatGPT, Claude, Adobe Firefly, fal.ai, Google Gemini/Flow, Canva AI, Midjourney, Runway, and Meta AI web pages.
- Detects visible conversation or prompt text and estimates token counts from page text length.
- Estimates fal.ai model costs by reading the price published on the model page itself (per second/megapixel/etc.) and matching it to the detected resolution, audio, and duration — no hardcoded per-model price table. Falls back to manual entry when the page exposes no parseable price.
- Stores metadata only: project, tool, model, token estimates, cost estimate, pricing mode, rating, note, URL, and title.
- Uses `chrome.storage.local`; there is no account, server, or sync.
- Labels costs as provider-model or API-equivalent estimates, not exact subscription or provider billing.
- Uses manual cost override for image, video, design, credit-based, and subscription/GPU-time surfaces without a pricing rule.

## Install locally

1. Download or copy this folder.
2. Open Chrome and go to `chrome://extensions`.
3. Enable Developer Mode.
4. Click Load unpacked.
5. Select the `extensions/ai-cost-tracker` folder.
6. Pin AI Cost Tracker from the Chrome extensions menu.

## Test flow

1. Open a supported AI page: ChatGPT, Claude, Firefly, fal.ai, Gemini/Flow, Canva, Midjourney, Runway, or Meta AI.
2. Open the extension popup.
3. Confirm the detected tool, model, turn count, and estimated/manual cost state. On fal.ai model pages, check the estimate note — it cites the page's own per-unit price and the duration/resolution/audio it assumed.
4. Create or select a project.
5. Add a rating/note and click Log usage.
6. Export JSON when you want a portable backup.
