# Duldol content API

The React frontend stays on Vercel. This Worker owns `/api/*` on the same
Cloudflare-proxied site domain. D1 stores documents and media metadata; a private
R2 bucket stores files. Publishing does not change Git or trigger a Vercel build.

## Local development

```powershell
npm --prefix cloudflare install
Copy-Item cloudflare/.dev.vars.example cloudflare/.dev.vars
npm --prefix cloudflare run db:migrate:local
npm --prefix cloudflare run dev
```

Run the Vite frontend separately. Its development proxy must forward `/api` to
`http://127.0.0.1:8787`. `APP_ORIGIN` must match the browser origin, normally
`http://localhost:5173`, including the port. The auth bypass requires all three:
`ENVIRONMENT=development`, `DEV_AUTH_BYPASS=true`, and a loopback Worker request
hostname. It cannot authenticate a request to a public Worker hostname.

```powershell
npm --prefix cloudflare run typecheck
npm --prefix cloudflare test
```

Tests run against temporary local Miniflare D1/R2 bindings. Cloudflare account
credentials and a deployed service are not required.

## Production configuration

1. Create D1 `duldol-content` and a **private** R2 bucket `duldol-media`. Put the
   real D1 ID in `wrangler.jsonc`. Bind them as `DB` and `MEDIA`.
2. Configure `APP_ORIGIN` to the exact HTTPS site origin. Set
   `ACCESS_TEAM_DOMAIN` to `your-team.cloudflareaccess.com`, `ACCESS_AUD` to the
   administrator Access application's audience, and preferably `ADMIN_EMAILS` to
   a comma-separated administrator email allowlist.
3. Create a Cloudflare Access self-hosted application for the site's
   `/api/admin/*` paths, with a policy allowing only the administrator's identity.
   Keep `/api/posts`, `/api/pages`, and `/api/media` public. The Worker verifies
   the JWT signature, issuer, audience, and expiry on every administrator request,
   independently of the Access edge rule.
4. Keep the existing Vercel origin and use a Cloudflare **proxied** DNS record.
   Configure a Worker route for `www.duldoljimi.com/api/*` on the actual zone.
   `/media/*` is also accepted for legacy migration URLs; add that Worker route
   only if imported documents use that alias. New media URLs use `/api/media/*`.
5. Set `R2_ACCOUNT_ID` and `R2_BUCKET_NAME`. Create R2 S3 credentials scoped to
   this bucket and store the values with:

   ```powershell
   cd cloudflare
   npx wrangler secret put R2_ACCESS_KEY_ID
   npx wrangler secret put R2_SECRET_ACCESS_KEY
   ```

   These are server secrets. Never use `VITE_*` variables for credentials.
6. Configure bucket CORS for the exact `APP_ORIGIN`:

   ```json
   [{
     "AllowedOrigins": ["https://www.duldoljimi.com"],
     "AllowedMethods": ["PUT", "HEAD"],
     "AllowedHeaders": ["Content-Type"],
     "ExposeHeaders": ["ETag"],
     "MaxAgeSeconds": 300
   }]
   ```

   Add an R2 lifecycle rule that expires objects under `staging/` after one day.
   Abandoned pending metadata can be reviewed through the administrator asset
   list and removed with the asset DELETE endpoint. Final media keys are never
   exposed through a public R2 bucket.
7. Apply the remote schema and import the reviewed migration output before
   activating the frontend's content API mode. Deploy only after real resource
   IDs, Access settings, routes, and secrets are configured.

Login uses a browser navigation to
`/api/admin/login?return_to=%2FEditor`. Access performs the identity login, and the
Worker redirects the authenticated request back to `/Editor`. Access may answer
an unauthenticated AJAX request with its own redirect/HTML rather than API JSON;
the frontend must offer this login navigation in either case. Public routes and
the Vercel origin remain available independently of administrator login.

## API contract

| Method | Route | Result |
| --- | --- | --- |
| GET | `/api/posts` | `{posts}`; published and listed |
| GET | `/api/posts?featured=1` | `{posts}`; ordered home selections |
| GET | `/api/posts/:idOrSlug` | `{post}`; published detail |
| GET | `/api/pages/:slug` | `{page}`; public pages only |
| GET | `/api/media/:objectKey` | Public finalized file |
| GET | `/api/admin/session` | `{authenticated,email,subject}` |
| GET, POST | `/api/admin/posts` | List or create |
| GET, PUT, DELETE | `/api/admin/posts/:id` | Read, update, delete |
| GET, PUT | `/api/admin/pages/:slug` | Read or update, including private memo |
| GET, POST | `/api/admin/assets` | Review recent files or issue upload |
| POST | `/api/admin/assets/:id/finalize` | Verify file and return `{asset}` |
| DELETE | `/api/admin/assets/:id` | Delete only when unreferenced |
| GET | `/api/admin/media/:objectKey` | Authenticated private file |

Posts accept `title`, `slug`, `work_date`, `content_html`, `cover_asset_key`,
`cover_url`, `status` (`draft`, `published`, `archived`), `is_listed`, `sort_order`,
and nullable `featured_order`. Responses also expose legacy `year`, `hashdate`,
and `titleimg` aliases. `id` is immutable; `slug` preserves old work URLs.

Updates require the document's numeric `version`. A stale version returns 409
without changing either the document or media references. DELETE requires
`{version:N}` in its JSON body or `?version=N` for the same safeguard. Database writes and reference changes are
atomic D1 batches. Every administrator mutation requires a matching `Origin`.

The memo is always private, including if a caller submits `visibility=public`.
Uploaded memo images should use asset `visibility=private`; their URLs require
administrator authentication. Saving HTML strips executable tags, event
attributes, unsafe URL protocols, and unapproved iframe hosts.

### File upload

1. POST `/api/admin/assets` with
   `{filename,content_type,size,visibility:"public"|"private"}`.
2. PUT the file to `upload.url`, with the returned `upload.headers` and
   `credentials: "omit"` for the cross-origin R2 URL. Production uses a five
   minute presigned URL for a unique `staging/` key. Local development returns
   an authenticated Worker PUT URL instead.
3. POST `finalize_url`. The Worker verifies size, MIME metadata, and file
   signature, then copies to a separate immutable final key and marks it ready.
   Reusing the old signed URL cannot overwrite published files.
4. Insert the returned `asset.url` into the document. For a cover also store
   `asset.object_key` as `cover_asset_key`.

Accepted types: JPEG, PNG, GIF, WebP, AVIF, PDF; maximum 20 MiB. Pending or private
files are never returned through the public media route. Referenced files cannot
be deleted. Deleting a post keeps its media for explicit subsequent cleanup.

Reference documentation:
[Access JWT validation](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/),
[R2 presigned uploads](https://developers.cloudflare.com/r2/api/s3/presigned-urls/),
[D1 atomic batches](https://developers.cloudflare.com/d1/worker-api/d1-database/#batch).
