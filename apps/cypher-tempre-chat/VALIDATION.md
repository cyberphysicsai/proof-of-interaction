# ChainChat 0.10.0 validation

This records local source checks and their coverage limits. Exact final source,
PR and merged-main CI, installer acceptance and live approval belong in the
[tagged release verification record](https://github.com/cyberphysicsai/proof-of-interaction/releases/tag/chat-beta-v0.10.0)
and [Actions runs](https://github.com/cyberphysicsai/proof-of-interaction/actions).
Successful fixtures establish mechanics and permission boundaries; they do not
establish benchmark parity, perfect security or elimination of hallucinations.

## Source and runtime identity

The packaged PoI fallback is the complete 69-file canonical OpenClaw skill bundle
at `1f3b61e8cfadf7116ecaad6c626068fbb972dbff`, with matching Git blobs, file modes
and SHA-256 manifest. The fixed-publisher skill updater verifies candidate Git
objects, tests compatibility and switches between turns while preserving user
chains, registries and approvals. Git hashes establish the publisher snapshot;
they are not a maintainer signature.

The OpenClaw runtime is pinned to **2026.10.10** and portable Node to
**26.13.0**. Its original npm archive keeps the published SRI. The extracted
runtime has the exact `early-hook-input-provenance-v2` compatibility overlay:
the same two files forward existing `inputProvenance` and `currentSourceTurnId`
fields across early context boundaries. The framework's original client nonce
correlates queued requests; text and transport acknowledgments grant no authority.
Setup and doctor require the exact pre/post commitments and refuse earlier
overlay output. The overlay
adds no model, action or safety logic; completion carrier text alone establishes
no ownership. Dependency security overlays and remaining upstream findings are
documented in [the security boundary](openclaw/SECURITY.md).

## Current observed checks

These are preparatory source checks. They are not a substitute for final-head CI.

| Check | Observed result | Qualification |
| --- | --- | --- |
| Broad Node suite, native Gateway environment unset | 696 total: 664 passed, 32 skipped, 0 failed | Current pre-freeze core snapshot, before the final heartbeat editor and later native fixes; native/OS skips remain explicit. |
| Python suite | 130 total: 126 passed, 4 skipped, 0 failed | Windows platform/privilege skips require the native OS CI cases. |
| Frontend controls and layout | 91 passed, 0 failed, 0 skipped | Real handlers with synthetic DOM/files; includes credentials, attachment history, model picker, modes, source enrollment, heartbeat notes and keyboard navigation. |
| Queue-policy disclosure and layout | 10 passed, 0 failed, 0 skipped | Native schema/command descriptions explain frontend followup and preserve Continuum block semantics; these are interface checks, not actual queued-run acceptance. |
| Heartbeat scratch/source helper checks | 13 passed, 0 failed, 0 skipped | Source ownership, actual monitor matching, revision checks, note bounds and revocation; the separate actual scheduler case is listed below. |
| PHP free-relay policy | 34 passed, 0 failed; lint passed | Synthetic upstream transports; Windows link/permission branches are qualified by platform notes. |
| Model catalogue, selection and relay transport | 26 total: 23 passed, 3 native-environment skips, 0 failed | Synthetic provider and HTTP boundaries; includes own-key OpenRouter discovery and rejection of cross-provider key reuse. |
| Anonymous live catalogue, 4 November 2026 | 16 advertised options: 2 shared and 14 requiring the user's own key | Public catalogue observation only; no inference or credentials used. Entries, zero-price eligibility, provider quotas and availability can change. |
| Model changes and private native route ownership | 17 passed, 0 failed, 0 skipped | A synthetic Gateway verifies read-only selection, await-race revocation, post-response Free/BYOK session routes, stale-native removal and other-agent/auth/history preservation; actual-SDK mixed-route acceptance is tracked separately. |
| Native session idle boundary | 7 passed, 0 failed, 0 skipped | Actual session identity/lifecycle and idle projection are required; cancellation, contradictory projections, vanished known writers and stalled status reads remain held. These helper tests do not replace actual-SDK mixed-route acceptance. |
| Runtime metadata overlay v2 guards | 6 Python and 3 Node passed, 0 failed or skipped | Exact pinned SDK chunks, only the two typed metadata values per context, old-overlay refusal, idempotence, link/corruption denial and doctor checks. This is source-attestation evidence, separate from native queued-run acceptance. |
| Queued-input nonce and actor-revision guards | 51 passed, 0 failed or skipped | `0100-source-nonce-binding-unit-r4.log` covers the focused source-nonce, broker and plugin boundaries for the `8f8f91a` queued-input fix; actual SDK acceptance is listed below. |
| Real shared free-model introduction | HTTP 200, two independent semantic approvals, native SEAL and verified fresh block; 87.6 seconds | Actual OpenClaw candidate with the full skill and zero-price shared route. An earlier same-configuration attempt was held; no gate or source change separated the attempts. |
| Explicit selection persistence and sessions | 11 focused passed; 57 existing passed, 1 Windows skip | Uses the real canonical engine and a private fake native adapter; both chain histories remain byte-identical. |
| Corrected independent reference compatibility | 2 canonical and 2 exact earlier-source cases passed | The earlier source is fetched only into runner temporary storage from a fixed public commitment and subtree; no earlier engine is vendored in this application. |

Local receipts are retained as `0100-final-node.log`, `0100-final-python.log`,
`0100-heartbeat-ui-combined.log`, `0100-native-heartbeat-scratch-unit.log`,
`0100-release-prep-free-php.log`, `0100-release-prep-model-free-tests.log`,
`0100-native-model-route-callback-tests-r2.log`, `0100-native-session-idle-tests-r2.log`,
`0100-live-anonymous-model-catalogue.log`,
`0100-runtime-overlay-v2-python-tests.log`, `0100-runtime-overlay-v2-node-tests.log`,
`0100-source-nonce-binding-unit-r4.log`,
the selected-agent sidecar logs and the
pre-freeze compatibility logs. Exact final CI run links and final artifact
digests belong in the PR/release verification record.

## Actual pinned native runtime cases

The following cases run the real pinned SDK and canonical Python engine against
disposable chains and controlled local provider responses. Native API calls and
hash/commit checks are genuine; response text and review scores are fixtures.
These cases use neither personal chains nor real provider credentials.
The source and acceptance fixtures use synthetic credential values. Source
packaging selects tracked application files and excludes local user chains,
cached runtime state and private credential files; exact archive audits are a
publication requirement. No personal key or private Timechain is needed to
reproduce these acceptance cases.

| Native boundary | Observed acceptance |
| --- | --- |
| Configured native main model/auth, isolated SDK review and utility cost defaults | 1/1 passed in `canonical-native-sdk-integration-cost-defaults-r6.log`. |
| Image input analysis from immutable local media | 1/1 passed in `canonical-native-media-integration-r2.log`. |
| Dedicated TTS credential references, WAV custody, outbound projection and portable output | 1/1 passed in `canonical-native-output-integration-r5.log`. |
| Genuine queued input with metadata overlay v2 | 1/1 passed at `8f8f91a` in `openclaw-20261010-queued-input-v2-r7.log`; 65.79 seconds. The real SDK returned a queued receipt and a distinct physical run UUID, then bound its typed original source nonce to the correct input. A revoked earlier actor could neither retry nor deliver; the queued input produced its own approved reply. Two controlled model calls were observed, one for each input. |
| Asynchronous image success and failed-task custody isolation | 1/1 passed in `canonical-native-async-media-integration-r11.log`; 116.76 seconds with the earlier provenance overlay active. A real native task delivered a reviewed portable PNG; a second HTTP 500 containing fake prior-file MEDIA text produced a reviewed failure without attaching or stealing that asset. This observation does not establish acceptance of the later v2 nonce forward. |
| Free/BYOK child transport despite a configured native paid default | 1/1 passed at `5776e2e` in `openclaw-20261010-mixed-model-route-r1.log`; 94.52 seconds, before the final continuation lookup refinement. Actual SDK subagents used only their admitted proxy endpoint during both tiers, including an explicit native-model override; a separate native-mode positive case still reached the native fixture. Endpoint costs and credentials were synthetic; final-head reruns remain a publication requirement. |
| Goals, session controls, scoped primitives and restart state | Selected actual-SDK cases passed; the precise retained runs are recorded in the native evidence index. |
| Reviewed compaction, delegated child chain, cron ownership and dispatcher target checks | Selected actual-SDK cases passed; those families do not establish every possible tool/provider combination. |
| Native channel ingress/outgoing/revocation | A registered synthetic loopback channel passed; real external connectors were not tested by that case. |
| Scheduled native heartbeat with owner notes and source admission | 1/1 passed at its scheduled first due time in `openclaw-20261010-native-heartbeat-r6.log`; 166.2 seconds. |

The native evidence index retains exact run qualification and earlier failed
diagnostics. Final-head CI must exercise the same published test cases with
the required native runtime enabled. Physical audio/video generation providers,
real channel accounts, device permissions and every provider authentication
combination have not been exercised by these local fixtures.

## Tested invariants

Every current agent answer and action requires canonical PoI enforcement.
Pausing real-time memory retains review, disables action tools and preserves
chain/history bytes. Imported authored faculties remain subject to local digest
approval. Equipment and runtime activity are distinct; a selected ability is
not evidence that it executed or improved answer quality.

Ordinary frontend messages use native followup mode with a separate original
request identity and PoI review. Commitment follows the selected Timechain block
policy. Native queue preferences continue to apply to other native events and
channel inputs; native goal operations retain their upstream RPC behavior and
typed source binding.

Native task ownership requires observed creation receipts and live native
provenance, with fresh source/parent checks. Async output custody binds the
original tool call, parent lifecycle, task IDs and exact ordered references to
an opaque receipt. Retries cannot reuse captured files under different
references. Completed media joins the original parent chain under an exclusive
lock and appears through its sealed history. Process restart, stale parent
incarnation and expired task proof intentionally hold unresolved async work.

The last explicitly selected registered Timechain is stored as an ID-only
`selected-agent.json` preference. Automatic native child creation cannot change
it. `agents.json` remains the original array format for earlier app readers;
neither provider keys nor browser tokens are added to this preference.

Browser access uses the authenticated local session with exact-origin checks.
Direct BYOK remains in process memory. Native auth and dedicated service
credentials can persist in owner-protected local files; this is not an encrypted
vault. Scheduled notes reach the configured model route when a run is admitted.
Inference sends relevant context to the selected provider, and the shared free
tier uses the hosted relay. Provider/relay privacy and availability still apply.
Selecting Free/BYOK or disconnecting the provider retires that agent's earlier
saved native route and cancels its admitted descendants while preserving native
authentication. A different native default cannot silently replace the saved
owner-selected model after the browser session closes.
The persistent-route revocation fix is committed as `1e44ddc`; the 17-case API and
private-callback regression includes unchanged-choice continuity, read-only route
selection and revocation during awaited discovery. Free/BYOK background work
requires a live authenticated owner/model session. The native idle-boundary fix,
`9d940a0`, waits for the actual session idle projection before admitting a new
writer; `5189580` also bounds a stalled status read. That commitment adds the
separate read-only model-route callback. The actual-SDK mixed-route case separately
observed zero native-endpoint calls during Free and BYOK ownership. The
`6be0e62` continuation transport lookup grants no early cognitive/action authority;
fresh canonical admission still follows transport selection.

Native metadata utilities start off. Explicit utility-model opt-in uses its own
native provider credentials, billing and privacy terms even during Free chat.
Metadata-only utility calls have no action tools. The shared key is not supplied
to unrelated providers. The relay rechecks advertised numeric zero pricing and
full-response cost/secret policy before releasing candidate bytes, with no paid
fallback. Catalogue visibility alone does not prove a real model turn succeeds.

Native plugins explicitly trusted by the owner and broad command execution run
with local OS privileges. PoI reviews model actions; arbitrary native plugin code
is outside those hooks. This is not an OS sandbox or a formal truth oracle.

## Publication requirements and coverage limits

- Scheduled/native routes and model-route cost isolation must pass against the
  release source. The observed heartbeat success covers its fixture and schedule;
  editor/get/set success alone does not establish all background execution.
- The release record must retain both real free-model observations. The
  successful second introduction does not establish universal benign-request
  acceptance or prove the earlier hold was a false positive; its draft was not
  captured for that diagnosis.
- Publication requires a frozen source and all nine required jobs on both the PR
  and merged-main head, with explicit skips and actual native/OS results retained.
- All fourteen exact final assets must be rebuilt and audited, with isolated
  fresh/repeat installation, source tamper refusal and rollback/data-preservation
  checks. Build structure and executable self-tests alone do not establish full
  installation acceptance. Final evidence is retained with the tagged release.
- Visual acceptance remains unobserved because local CUA navigation was blocked.
  Structural/keyboard checks and the installer font self-test do not establish
  rendered desktop or mobile appearance.

This validation does not claim complete one-to-one native feature parity,
universal benign-request acceptance or zero residual risk. Benchmark parity and
model-quality uplift were not measured by this release validation.
