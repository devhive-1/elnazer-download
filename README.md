# El Nazer download landing page

Static Arabic-first download and family invite pages for El Nazer 0.3.2. No build step, no PHP, no database.

## Publish on Hostinger

1. Open Hostinger hPanel → Websites → File Manager.
2. Open `public_html` for the temporary domain.
3. Upload the **contents** of this folder (not the folder itself), including `.htaccess`.
4. Make sure `index.html` is at the root of `public_html`.
5. Open the temporary domain and test:
   - Android download
   - Windows ZIP download
   - SHA-256 copy buttons
   - Light/dark toggle
   - `/404.html`

If the ZIP is used, extract it first and upload all extracted files.

## Publish on GitHub Pages

The page is deployed to the public repository `devhive-1/elnazer-download` on the `main`
branch. GitHub Pages serves it at:

```text
https://devhive-1.github.io/elnazer-download/
```

## Updating a release

When a matching release is published, `.github/workflows/sync-release-metadata.yml`
downloads its assets, updates these values in the source repository, and publishes the
landing page to `devhive-1/elnazer-download`:

- `index.html`: version badges, file sizes, SHA-256 hashes, release date, download URLs.
- `assets/js/app.js`: the `androidUrl`, `armv7Url`, and `windowsUrl` constants used by
  the device recommendation banner.
- `sitemap.xml`: `lastmod`.
- This README if the publishing flow changes.

The stable download URLs are:

```text
https://jqbkdyzlqjifqpcjaegp.supabase.co/storage/v1/object/public/downloads/elnazer-latest-arm64.apk
https://jqbkdyzlqjifqpcjaegp.supabase.co/storage/v1/object/public/downloads/elnazer-latest-armv7.apk
https://jqbkdyzlqjifqpcjaegp.supabase.co/storage/v1/object/public/downloads/elnazer-latest-x86_64.apk
https://jqbkdyzlqjifqpcjaegp.supabase.co/storage/v1/object/public/downloads/elnazer-latest-windows.zip
```

## Notes

- The Windows build is a portable ZIP containing `ElNazer.exe` and its supporting files.
  There is no standalone EXE download.
- No analytics, external scripts, CDN fonts, or tracking pixels are used.
- Fonts and the brand mark are bundled locally.
- `.htaccess` adds security headers, compression, caching, and a custom 404 for Apache /
  LiteSpeed hosting. GitHub Pages ignores it.
