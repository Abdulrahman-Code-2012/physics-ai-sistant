# Physics AI-sistant

IGCSE physics tutor and mark-scheme checker using React, Supabase and OpenRouter.

Features: text questions, real voice-note input, image questions, private uploads, persistent conversations, and answer marking against a required official mark scheme.

Production setup: apply the Supabase migration in `supabase/migrations/20261003_production_security.sql`, deploy `supabase/functions/ai-route/index.ts` as `ai-route`, set the `OPENROUTER_API_KEY` secret, then deploy the Vite app with `npm run build` to `dist`.

Student uploads use private Storage buckets and short-lived signed URLs. The Edge Function validates the Supabase JWT before calling OpenRouter.