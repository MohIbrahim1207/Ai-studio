# AI Ad Studio

Generate a 15-30 second direct-to-consumer ad from a one-line product brief.

## What It Does

Pipeline structure:
1. Hook (first ~3 seconds)
2. Problem
3. Product solution
4. Social proof / testimonial
5. Call to action

Outputs:
- Script JSON
- Scene plan (4-5 scenes)
- Voiceover audio
- Final MP4 video
- Downloadable assets under `/assets/<runId>/...`

## Tech Stack

- Frontend: React + Vite + TailwindCSS
- Backend: Node.js + Express
- AI: Gemini API for script generation
- TTS: ElevenLabs API example (with fallback silent track)
- Video: FFmpeg scene composition and assembly

## Project Structure

```txt
/ai-ad-studio
  /frontend
  /backend
  /scripts
  /assets
```

## Prerequisites

- Node.js 18+
- FFmpeg available in PATH (`ffmpeg -version` should work)
- Optional: Gemini API key and TTS API key

## Setup

```bash
cd ai-ad-studio
npm install
copy backend/.env.example backend/.env
```

Edit `backend/.env` and set:
- `GEMINI_API_KEY` for real script generation
- `TTS_API_KEY` + `TTS_VOICE_ID` for real voiceover

## Run Locally

```bash
npm run dev
```

Apps:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8787`

## Main API Routes

- `POST /generate-script`
- `POST /generate-scenes`
- `POST /generate-voice`
- `POST /generate-video`

Extra convenience route:
- `POST /generate-all` (used by frontend)

## Request Example

`POST /generate-all`

```json
{
  "brief": "Create a 20 second Instagram ad for a beard growth oil targeting men 20-35",
  "productName": "",
  "audience": "",
  "platform": "Instagram Reels",
  "tone": "testimonial",
  "duration": 20
}
```

## Gemini Integration Example

In `backend/src/services/scriptService.js`, Gemini is called through:
- package: `@google/generative-ai`
- model: `gemini-1.5-flash`
- strict JSON response format with `hook/problem/solution/testimonial/cta`

If Gemini is not configured, the backend falls back to a deterministic script template.

## 5-Minute Generation Target

The pipeline is optimized for local speed:
- Placeholder scene images are generated instantly
- Voiceover uses API if configured, silent fallback otherwise
- FFmpeg composes a short vertical video with text overlays and fades

On a typical dev machine, ad generation usually completes in under 5 minutes.

## Deploy On Render

This repo includes a Render Blueprint: `render.yaml`.

1. Push this project to GitHub.
2. In Render, click **New +** -> **Blueprint**.
3. Select your repo and confirm `render.yaml` is detected.
4. Set secret env vars for the backend service:
  - `GEMINI_API_KEY` (optional but recommended)
  - `TTS_API_KEY` (optional)
  - `DID_API_KEY` (optional)
5. Deploy.

Services created:
- `ai-ad-studio-backend` (Node web service)
- `ai-ad-studio-frontend` (static site)

Production notes:
- Frontend reads `VITE_API_BASE_URL` (auto-wired to backend URL in `render.yaml`).
- Backend asset links use `PUBLIC_BASE_URL`; if omitted, backend falls back to `RENDER_EXTERNAL_URL`.
- FFmpeg/FFprobe default to bundled binaries via `ffmpeg-static` and `ffprobe-static`, so no OS-level install is required on Render.
