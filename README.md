# Physics AI-sistant

IGCSE physics tutor and mark-scheme marker. Plain HTML, CSS and JavaScript: no build step.

- `index.html`, `css/styles.css`, `js/app.js`, `js/config.js` make up the site (Netlify publishes the repo root, see `netlify.toml`).
- Backend: Supabase project `rxsyzbkosjqndgsuhmzf` (auth, private storage, `ai-route` edge function).
- `supabase/` holds the edge function and migrations. The `GEMINI_API_KEY` secret must be set on the Supabase project. The AI route uses Google Gemini for all three student options (N1, N2, and N3).
- The key in `js/config.js` is the public publishable key; it is safe in the browser because RLS protects the data.
