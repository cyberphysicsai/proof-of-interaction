# Proof of Interaction

Timechain-based AI self-modeling skills for Claude Code, Codex, OpenClaw,
Hermes, and NanoClaw.

**Release: v1.0.0.** Each installation starts its own fresh Timechain.

Proof of Interaction gives an AI agent a persistent, verifiable cognitive self-model: an
append-only Timechain, a Proof-of-Interaction audit gate, faculty registries, recall,
growth, consensus, and immune recovery helpers. Each runtime bundle is
self-contained and starts with a clean chain.

Cambium growth generates executable faculties: **senses** are data-facing
perceptual/relation algorithms, while **modalities** are environment-facing
cognitive/action faculties for tools, code, benchmarks, games, audits, and other
external tasks. There is **no dynamic code execution** in the skill — recurrence-promoted
faculties get ops composed only from an audited primitive menu. A model may also *author*
an op in real time, but that is **propose-then-activate**: the full code body is committed
as inert text to `registry/emergent.json` (dormant, never executed), and only runs after a
human reviews it and places it into a per-user, gitignored `active_ops.py` (loaded by a
plain static import). Nothing model-authored runs without human approval.

For codebases, Proof of Interaction is not an "infinite context window." It is an
external, queryable, verifiable map: source coordinates, file/chunk hashes,
revision metadata, path-aware recall, neighboring chunks, and sealed audit rings.
Agents should use it for long-horizon orientation, then validate retrieved hits
against live source before making conclusions.

Every runtime text store is explicit UTF-8 across Windows, macOS,
and Linux. Legacy cp1252 JSON/JSONL can be inspected and recovered with the bundled
`encoding_recovery.py`; conversion is confirmation-gated, creates a byte-exact backup,
and never re-anchors registry state until a separate reviewed command.

Adherence telemetry is keyed and deduplicated per logical turn, so
repeated Stop checks and mixed hook channels cannot produce rates above 100%. The full
Python runtime self-test runs on Windows, macOS, and Linux; only direct POSIX shell
wrapper integrations remain platform-specific.

Every runtime bundle exposes the same enforcement report; hook-enabled
runtimes inject its compact form on every session and prompt. A blocked Stop names its
exact turn, enforced root, baseline/current heads, delta, and cause; `python3 enforce.py
status --json` exposes the same state without changing the chain, telemetry, or adherence
counts. Successful Stop hooks remain intentionally silent to preserve the allow contract.

Canonical registries fail closed: an existing unreadable, malformed, or
schema-invalid `grown.json` can never be mistaken for a fresh empty registry or overwritten
by the next growth event. Recovery can list and restore a reviewed Timechain blockspace
snapshot with a byte-exact backup, while re-anchoring remains a separate confirmed step.
Auto-sprout is directly controllable with `cambium.py auto-sprout status|on|off` or a
session-only `CT_AUTO_SPROUT=1|0` override. When enabled, safe primitive-composed faculty
fusion/sprouting and immediate invocation are permitted; authored code still requires
human review and activation.

Explicit `grown.json` recovery sequence:

```bash
python3 encoding_recovery.py registry-snapshots --root /path/to/proof-of-interaction --name grown.json
python3 encoding_recovery.py restore-registry --root /path/to/proof-of-interaction \
  --name grown.json --ring KNOWN_GOOD_RING --confirm
# Review grown.json and its .bak sibling before the separate trust step:
python3 encoding_recovery.py reanchor --root /path/to/proof-of-interaction \
  --confirm-reviewed --reason "reviewed blockspace registry recovery"
```

## Public share links

| Runtime | Skill file | Raw file | Bundle folder |
|---|---|---|---|
| Claude Code | [Claude SKILL.md](https://github.com/cyberphysicsai/proof-of-interaction/blob/main/skills/claude/proof-of-interaction/SKILL.md) | [raw](https://raw.githubusercontent.com/cyberphysicsai/proof-of-interaction/main/skills/claude/proof-of-interaction/SKILL.md) | [folder](https://github.com/cyberphysicsai/proof-of-interaction/tree/main/skills/claude/proof-of-interaction) |
| Codex | [Codex SKILL.md](https://github.com/cyberphysicsai/proof-of-interaction/blob/main/skills/codex/proof-of-interaction/SKILL.md) | [raw](https://raw.githubusercontent.com/cyberphysicsai/proof-of-interaction/main/skills/codex/proof-of-interaction/SKILL.md) | [folder](https://github.com/cyberphysicsai/proof-of-interaction/tree/main/skills/codex/proof-of-interaction) |
| OpenClaw | [OpenClaw SKILL.md](https://github.com/cyberphysicsai/proof-of-interaction/blob/main/skills/openclaw/proof-of-interaction/SKILL.md) | [raw](https://raw.githubusercontent.com/cyberphysicsai/proof-of-interaction/main/skills/openclaw/proof-of-interaction/SKILL.md) | [folder](https://github.com/cyberphysicsai/proof-of-interaction/tree/main/skills/openclaw/proof-of-interaction) |
| Hermes | [Hermes SKILL.md](https://github.com/cyberphysicsai/proof-of-interaction/blob/main/skills/hermes/proof-of-interaction/SKILL.md) | [raw](https://raw.githubusercontent.com/cyberphysicsai/proof-of-interaction/main/skills/hermes/proof-of-interaction/SKILL.md) | [folder](https://github.com/cyberphysicsai/proof-of-interaction/tree/main/skills/hermes/proof-of-interaction) |
| NanoClaw | [NanoClaw SKILL.md](https://github.com/cyberphysicsai/proof-of-interaction/blob/main/skills/nanoclaw/proof-of-interaction/SKILL.md) | [raw](https://raw.githubusercontent.com/cyberphysicsai/proof-of-interaction/main/skills/nanoclaw/proof-of-interaction/SKILL.md) | [folder](https://github.com/cyberphysicsai/proof-of-interaction/tree/main/skills/nanoclaw/proof-of-interaction) |

## Release downloads

| Runtime | Drag-and-drop ZIP |
|---|---|
| Claude Code | [proof-of-interaction-claude-skill-v1.0.0.zip](https://github.com/cyberphysicsai/proof-of-interaction/raw/main/downloads/proof-of-interaction-claude-skill-v1.0.0.zip) |
| Codex | [proof-of-interaction-codex-skill-v1.0.0.zip](https://github.com/cyberphysicsai/proof-of-interaction/raw/main/downloads/proof-of-interaction-codex-skill-v1.0.0.zip) |
| OpenClaw | [proof-of-interaction-openclaw-skill-v1.0.0.zip](https://github.com/cyberphysicsai/proof-of-interaction/raw/main/downloads/proof-of-interaction-openclaw-skill-v1.0.0.zip) |
| Hermes | [proof-of-interaction-hermes-skill-v1.0.0.zip](https://github.com/cyberphysicsai/proof-of-interaction/raw/main/downloads/proof-of-interaction-hermes-skill-v1.0.0.zip) |
| NanoClaw | [proof-of-interaction-nanoclaw-skill-v1.0.0.zip](https://github.com/cyberphysicsai/proof-of-interaction/raw/main/downloads/proof-of-interaction-nanoclaw-skill-v1.0.0.zip) |
| Smol LM Version (experimental) | [proof-of-interaction-smol-lm-skill-v1.0.0.zip](https://github.com/cyberphysicsai/proof-of-interaction/raw/main/downloads/proof-of-interaction-smol-lm-skill-v1.0.0.zip) |

The **Smol LM Version** is an experimental controller packet for tiny or
instruction-fragile models. It installs alongside a normal Proof of Interaction engine and
withholds model output until the draft has produced a verified, same-turn Timechain
receipt. Its procedural adherence metric is intentionally separate from semantic answer
quality so a sealed but poorly grounded answer cannot masquerade as perfect wear.

## Timechain Dashboard

The `dashboard/` folder contains the local-first Proof of Interaction Timechain
audit dashboard. Run it locally to inspect your own chain. An optional hosted
static UI can pair with the local bridge; Timechain files stay on your machine.
See [dashboard setup](dashboard/README.md) and [static hosting](site/README.md).

Downloads:

| Package | Use |
|---|---|
| [proof-of-interaction-static-site.zip](https://github.com/cyberphysicsai/proof-of-interaction/raw/main/downloads/proof-of-interaction-static-site.zip) | Static files for Hostinger `public_html` |
| [proof-of-interaction-dashboard-local-bridge.zip](https://github.com/cyberphysicsai/proof-of-interaction/raw/main/downloads/proof-of-interaction-dashboard-local-bridge.zip) | Local bridge users run to pair their own Timechain files |

(The runtime skill bundles are in [Release downloads](#release-downloads) above.)

User bridge commands:

```bash
cd ~/Downloads
curl -L -o proof-of-interaction-dashboard-local-bridge.zip https://github.com/cyberphysicsai/proof-of-interaction/raw/main/downloads/proof-of-interaction-dashboard-local-bridge.zip
unzip -o proof-of-interaction-dashboard-local-bridge.zip
cd dashboard
npm install
npm run bridge
```

For the local dashboard, run `npm run dev` and open
`http://127.0.0.1:8788`. For a separately hosted static UI, run `npm run bridge`
and pair it with the code printed in your terminal. Configure that hosted
origin as described in [static hosting](site/README.md).

## Install with Codex

Use this prompt to install the Codex bundle from the repository source ZIP:

```text
Install the Codex skill from this repository:

https://github.com/cyberphysicsai/proof-of-interaction/archive/refs/heads/main.zip

Use only this folder from the ZIP:
proof-of-interaction-main/skills/codex/proof-of-interaction

Copy that folder into my Codex skills directory as proof-of-interaction. Inside the installed folder, run python3 timechain.py init --name Codex to create a fresh chain, then python3 timechain.py verify to check it. Run python3 install_codex_hooks.py so Codex can load the lifecycle hooks from ~/.codex/hooks.json.
```

The current Codex bundle is also mirrored in `downloads/` as
`proof-of-interaction-codex-skill-v1.0.0.zip`. After installing hooks, open `/hooks`
in Codex to review and trust the new command hooks, then restart or start a
new session.

## Task Chains And Identity Links

Large audits should use a separate task root, for example
`/path/to/repo/.codex/proof-of-interaction/<task-name>`. Pass that project root to
`--root`; do **not** pass its `chain/` directory, or the tools will create a
mistaken `chain/chain` ledger.

For exhaustive audits, use the queue-aware path:

```bash
SK=~/.codex/skills/proof-of-interaction
TASK_ROOT=/path/to/repo/.codex/proof-of-interaction/<task-name>
python3 $SK/continuum.py walk --path /path/to/repo --ext .py .ts --objective "<task>" --root $TASK_ROOT
python3 $SK/audit.py open --root $TASK_ROOT --objective "<task>"
python3 $SK/audit.py next --root $TASK_ROOT --batch-size 10
python3 $SK/audit.py record --root $TASK_ROOT --block <ids> --finding "<specific review>"
python3 $SK/task.py complete --task-root $TASK_ROOT --report /path/to/report.md
```

Task chains stay readable later with `recall.py ... --root $TASK_ROOT` or
`continuum.py resume --root $TASK_ROOT`. `task.py attach` / `task.py complete`
seal a verified task-head pointer into the identity chain, so users get durable
continuity without splicing or bloating the identity chain. A loose
`recall.py turn --root audit` is not a substitute for `audit.py open` +
`audit.py record`; the Codex Stop hook now names that root mismatch explicitly.

## File labels

Every shareable file is labeled by its runtime path:

| Label | Files |
|---|---|
| Claude skill version | `skills/claude/proof-of-interaction/**` |
| Codex skill version | `skills/codex/proof-of-interaction/**` |
| OpenClaw skill version | `skills/openclaw/proof-of-interaction/**` |
| Hermes skill version | `skills/hermes/proof-of-interaction/**` |
| NanoClaw skill version | `skills/nanoclaw/proof-of-interaction/**` |
| Repository metadata | `README.md`, `LICENSE`, `.gitignore`, and `skills/README.md` |

Generated memory state — your `chain/`, task ledgers, Dream Cache
(`registry/emergent.json`), promoted faculties (`registry/grown.json`), and local
executable grown-faculty ops (`registry/grown_ops.json`) — is intentionally not
committed and never shipped in a bundle; it is created per user as the agent runs
(`python3 timechain.py init --name <AgentName>` seals your genesis). Because none of it
ships, every downloaded bundle is free of another agent's memory and learned
faculties. Initialize your own chain after installation.

## Security scanning

Scan the runtime bundles with [SkillSpector](https://github.com/NVIDIA/skillspector).
The canonical target is the bundle that users install:

```bash
bash tools/scan.sh            # static scan of all bundles; add --llm for a model pass
# or inspect one bundle directly:
skillspector scan skills/claude/proof-of-interaction --no-llm
```

Review findings for each packet before release. Scanning the repository root also
includes adversarial test fixtures, build scripts, and archive copies that do not
install as part of the engine. See [the release checklist](RELEASING.md).

## Install

- Claude Code: copy `skills/claude/proof-of-interaction` into `~/.claude/skills/`.
- Codex: copy `skills/codex/proof-of-interaction` into your Codex skills directory.
- OpenClaw: copy `skills/openclaw/proof-of-interaction` into `~/.openclaw/workspace/skills/`, or publish that folder with ClawHub. Then install the native plugin with `openclaw plugins install ~/.openclaw/workspace/skills/proof-of-interaction/openclaw-plugin`, run `openclaw config set 'plugins.entries.proof-of-interaction-enforcement.hooks.allowConversationAccess' true --strict-json`, and restart the gateway. If plugins are unavailable, use the explicit `enforce.py mark -> recall.py turn -> enforce.py stop-check` loop documented in the bundle.
- Hermes: copy `skills/hermes/proof-of-interaction` into the Hermes skills directory configured by that agent runtime.
- NanoClaw: copy `skills/nanoclaw/proof-of-interaction` into the NanoClaw skills directory configured by that agent runtime.

Quick install check: `python3 timechain.py verify` (after you `init` a chain). The full development test suite lives at `tests/selftest.py` in the repository, not in the shipped bundle.

## Start a fresh Timechain

Install a runtime bundle into its own `proof-of-interaction` folder, then initialize
it there. For example:

```bash
cd ~/.codex/skills/proof-of-interaction
python3 timechain.py init --name Codex
python3 timechain.py verify
```

Use the name and skill directory for your selected runtime. The installer does not
include or import another agent's chain. `init` refuses to overwrite an existing
genesis block.

Keep backups of your complete installed skill folder as it learns. Your `chain/`,
task ledgers, custom operations, and generated registry files are local state;
never replace them with files from a download or commit them to a public repository.


## Cypher Tempre ChainChat

[ChainChat](apps/cypher-tempre-chat) is the local OpenClaw controller for this
repository's Proof of Interaction skill. Use the full-width chat and ability bar,
equip faculties, inspect the Timechain, and manage native OpenClaw settings from
one interface. Pausing real-time memory keeps PoI review required.

OpenClaw's original npm archive keeps its official integrity digest. A narrowly
attested compatibility overlay forwards the existing native `inputProvenance`
and `currentSourceTurnId` fields to the same two early hook contexts in the
extracted runtime. The latter carries the framework's original client nonce;
exact before/after hashes
are checked during setup and doctor validation on each supported OS. Model,
action and safety logic are unchanged by this overlay. Completion text alone
grants no authority. Nonce metadata correlates queued requests without accepting
prompt text or a transport acknowledgment as proof. The separate canonical 69-file PoI skill bundle remains
byte-identical to its maintained source.

The application includes an exact, verified snapshot of the canonical OpenClaw
bundle for offline startup. Its fixed-publisher updater discovers this
repository's `main` branch, verifies Git object hashes, tests a complete candidate
in an isolated fixture and switches only between turns. User chains, registries,
credentials and local approvals stay outside the downloaded skill code. Git
hashes attest the publisher snapshot; they are not a cryptographic publisher
signature.

Choose a model configured in local OpenClaw, connect your own API, or select an
advertised free model when available. Shared access has provider limits;
OpenRouter entries require your own key. Model privacy notices explain where
selected context is sent. Keys are not published to the website.

### Install the local controller

- [Windows](https://github.com/cyberphysicsai/proof-of-interaction/releases/download/chat-beta-v0.10.2/CypherTempre-ChainChat-Setup-0.10.2-windows-x64.exe)
- [macOS](https://github.com/cyberphysicsai/proof-of-interaction/releases/download/chat-beta-v0.10.2/CypherTempre-ChainChat-Setup-0.10.2-macos.zip)
- [Linux](https://github.com/cyberphysicsai/proof-of-interaction/releases/download/chat-beta-v0.10.2/CypherTempre-ChainChat-Setup-0.10.2-linux.tar.gz)

New users follow a guided installer and local setup wizard through model selection,
a fresh or existing Timechain, and a no-inference readiness check. The guide can be
reopened from the top of the chat; existing configured users can keep chatting.

This repository is the maintained source for both the skill and controller.
[cyphertempre.ai](https://cyphertempre.ai/) serves the same reviewed frontend as
a static deployment mirror; the agent and its authenticated runtime execute
locally. See the [application README](apps/cypher-tempre-chat/README.md) for model,
native capability and installation details.
