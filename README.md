# Athul KM — portfolio upgrade

This is an upgrade of the supplied portfolio, not a replacement template. It retains the existing dark theme, lime accents, profile image, sections, and profile links, and adds Certificates, Achievements, a dynamic Skills feed, and a private admin page.

## Project files
- `index.html` — public portfolio.
- `admin.html` — private management interface (`/admin.html`).
- `js/config.js` — Supabase project URL and browser anon/publishable key.
- `js/public-content.js` — reads published portfolio content.
- `js/admin.js` — authenticated create/edit/delete and uploads.
- `supabase/schema.sql` — database tables, Row Level Security and storage bucket.
- `certificates/` — the two original NPTEL PDF files supplied for this project.
- `Profile.PNG` — your existing profile image.

## Backend setup (required for dynamic management)
GitHub Pages serves static files. The admin dashboard therefore uses Supabase for authentication, database and file storage.

1. Create a Supabase project.
2. Open Supabase **SQL Editor** and run all of `supabase/schema.sql`.
3. In Supabase **Authentication → Users**, create your own administrator account.
4. In **Authentication → Settings**, disable public sign-ups. This starter RLS setup grants management permissions to authenticated users, so do not allow public registrations or create additional user accounts.
5. Open **Project Settings → API**. Copy the Project URL and anon/publishable key.
6. Paste those values into `js/config.js`. The anon/publishable key is intended for browser use. Never use a `service_role` key or database password in frontend code.
7. Upload the project files to the root of your existing GitHub Pages repository. Keep the original `Profile.PNG` filename capitalization.
8. Visit `https://Athul-K-M.github.io/admin.html` (or your existing Pages URL), sign in, and use the dashboard to manage content.

## Add the two existing certificates
The original PDFs are included in `certificates/` unchanged. Sign in to the dashboard and create these two records, selecting the matching PDF in the upload field:

**Python for Data Science**
- Issuer: NPTEL
- Completion period: January–February 2026
- Duration: 4 weeks
- Score: 79
- Recommended credits: 2

**Ethical Hacking**
- Issuer: NPTEL
- Completion period: July–October 2026
- Duration: 12 weeks
- Score: 68%
- Recommended credits: 4

Once uploaded and saved, the database-backed certificate cards replace the static fallback cards on the public page.

## Admin features
- Certificates: add, edit and delete metadata; upload PDF/image; optional verification URL.
- Skills: add, edit and delete; choose a category.
- Achievements: add, edit and delete; optional supporting upload.
- Public visitors only see published content. Dashboard changes are saved in Supabase and appear on the public site on refresh.

## File upload limits
The dashboard accepts PDF, PNG, JPG and WebP files up to 10 MB. The storage bucket is public so visitors can open public certificate links; do not upload private documents.

## Important security note
This starter setup assumes the only authenticated account is you. Public sign-ups must remain disabled. If you later add another authenticated user, tighten the SQL policies to authorize only your specific admin user ID. Never publish a Supabase service-role key.

## Deploying updates
Commit and push the project files to the `main` branch of your existing GitHub Pages repository. Keep the existing Pages deployment setting (Deploy from branch → `main` → root). After the Supabase setup, new content can be managed through `/admin.html` without redeploying the site.
