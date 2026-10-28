# Proof of Interaction Dashboard Downloads

These files contain the Proof of Interaction runtime skills and optional local
Timechain dashboard. All runtime packages are v1.0.0 and start without a chain.

- `proof-of-interaction-static-site.zip` is the static site bundle for Hostinger
  `public_html`.
- `proof-of-interaction-dashboard-local-bridge.zip` is the local bridge
  package users run on their own machines.
- `proof-of-interaction-claude-skill-v1.0.0.zip` is the Claude Code skill bundle with
  lifecycle hooks.
- `proof-of-interaction-codex-skill-v1.0.0.zip` is the Codex skill bundle with
  the Codex lifecycle hook installer and reviewable hook template.
- `proof-of-interaction-openclaw-skill-v1.0.0.zip` is the OpenClaw skill bundle with
  native plugin enforcement and explicit mark/seal/stop-check fallback.
- `proof-of-interaction-hermes-skill-v1.0.0.zip` is the Hermes skill bundle with
  explicit Hermes self-enforcement instructions and subagent definition.
- `proof-of-interaction-nanoclaw-skill-v1.0.0.zip` is the NanoClaw skill bundle.
- `proof-of-interaction-smol-lm-skill-v1.0.0.zip` is the experimental
  **Smol LM Version** controller packet. It requires one of the normal runtime engines
  and gates tiny-model drafts behind verified Timechain receipts before release.

The hosted site is only a static UI. The local bridge reads the user's own
`proof-of-interaction` files, requires a one-time pairing code for hosted
access, and makes no outbound network calls. There is no payment gate, wallet
connection, account, or hosted data store.

## Local Bridge Run Commands

```bash
cd ~/Downloads
curl -L -o proof-of-interaction-dashboard-local-bridge.zip https://github.com/cyberphysicsai/proof-of-interaction/raw/main/downloads/proof-of-interaction-dashboard-local-bridge.zip
unzip -o proof-of-interaction-dashboard-local-bridge.zip
cd dashboard
npm install
npm run bridge
```

For local use, run `npm run dev` and open `http://127.0.0.1:8788`. To pair a
separately hosted static UI, follow [static hosting](../site/README.md), run
`npm run bridge`, and enter the pairing code printed in your terminal.

If the skill is installed somewhere custom:

```bash
CT_DASHBOARD_ROOT="/path/to/proof-of-interaction" npm run bridge
```
