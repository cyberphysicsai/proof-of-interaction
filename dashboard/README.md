# Proof of Interaction Dashboard

Local-first dashboard for auditing a Proof of Interaction `proof-of-interaction`
skill directory — **free, frictionless, and private**. There is no payment
gate, no account, no wallet, and no outbound network call of any kind: the
server binds to `127.0.0.1`, reads only the configured local Timechain root,
and nothing ever leaves the machine.

## Local Run

```bash
cd dashboard
npm install
npm run dev
```

Open `http://127.0.0.1:8788` — the dashboard loads immediately.

To point at a specific skill instance:

```bash
CT_DASHBOARD_ROOT=/path/to/proof-of-interaction npm run dev
```

Without `CT_DASHBOARD_ROOT` the bridge auto-discovers an installed skill
(`~/.codex`, `~/.claude`, `~/.openclaw`, then the repo's bundled copy).

## What It Audits

- **Summary** — ring counts, faculties, blockspace, domain context, with the
  chain re-verified live by the canonical hash walk.
- **Learning Membrane** — self-improvement provenance:
  - *Integrity triptych*: hash chain, witness quorum (HMAC attestations
    re-verified), and telemetry digests (sealed segment hashes re-computed) —
    three independent trust layers, each checked live.
  - *Operators timeline*: every learner adoption/rollback ring with its
    holdout evals.
  - *Dream cycles*: missed-positives mined, per-learner adopt/held outcomes,
    growth proposals.
  - *Economics*: cumulative tokens saved by replay, telemetry event counts,
    replay ledger.
  - *Seal quality*: PoI brightness and span-grounding over chain height.
- **Rings & Blockspace** — searchable ring list with full detail panels and
  content-addressed blob previews.

## Privacy Posture

- An optional hosted site is a static shell; the only process that
  reads Timechain data is the local bridge on your machine.
- A hosted page must **pair** with the bridge using the code printed in your
  terminal; hostile origins are refused; the static handler is traversal-proof.
- The bridge makes **zero outbound requests** — the Content-Security-Policy is
  `connect-src 'self'`.
- No cookies persist anything sensitive; no telemetry about you exists at all.

## Remote (hosted) Use

```bash
npm run bridge
```

Publish `dashboard/public` at an HTTPS origin you control and allow that origin
with `CT_DASHBOARD_PUBLIC_ORIGINS`. Enter the printed pairing code on your
hosted page, using bridge URL `http://127.0.0.1:8788`. See
[static hosting](https://github.com/cyberphysicsai/proof-of-interaction/blob/main/site/README.md)
for setup. Local use needs no hosted site.

## Tests

```bash
npm test          # bridge security posture + learning overview rendering
npm run check     # syntax checks
```

## Environment

| Variable | Default | Purpose |
|---|---|---|
| `CT_DASHBOARD_ROOT` | auto-discover | skill directory to audit |
| `CT_DASHBOARD_HOST` | `127.0.0.1` | bind address |
| `CT_DASHBOARD_PORT` | `8788` | port |
| `CT_DASHBOARD_PUBLIC_ORIGINS` | set explicitly for a hosted UI | origins allowed to pair |
| `CT_DASHBOARD_PAIR_CODE` | random per run | fixed pairing code (≥8 chars) |
