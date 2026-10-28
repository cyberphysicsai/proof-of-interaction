# Proof of Interaction Static Dashboard

`dashboard/public` is the static dashboard UI. The local bridge reads the user's
Timechain files on their own machine; a hosted UI pairs with that bridge using
a one-time code. No hosted deployment is required to run Proof of Interaction.

## Local use

```bash
cd dashboard
npm install
npm run dev
```

Open `http://127.0.0.1:8788`. Set `CT_DASHBOARD_ROOT` to the installed
`proof-of-interaction` folder when using a custom location.

## Optional static hosting

Publish only the contents of `dashboard/public`, including dotfiles. Do not
publish the repository root or any installed skill's `chain/` or registries.
The static files are `index.html`, `styles.css`, `app.js`, `config.js`,
`_headers`, and `.htaccess`.

For Cloudflare Pages, select this repository, use build command `none`, and
set the output directory to `dashboard/public`. For Hostinger, upload those
files to the selected domain's `public_html` directory.

Hostinger Git deployment requires a branch whose root contains the static
files. The optional `site/deploy.sh` helper creates and pushes a `site-deploy`
branch from `dashboard/public`; configure that branch as the deployment source.
Run the helper only when you intend to publish a hosted dashboard.

## Pair a hosted UI

Allow your actual HTTPS origin when launching the bridge. The hostname below
is an example; replace it with the site you control:

```bash
CT_DASHBOARD_PUBLIC_ORIGINS=https://dashboard.example.com npm run bridge
```

Open your hosted dashboard, enter bridge URL `http://127.0.0.1:8788`, and use
the pairing code printed by the bridge. The bridge binds to localhost and
refuses unpaired origins. Timechain data remains on the user's machine.
