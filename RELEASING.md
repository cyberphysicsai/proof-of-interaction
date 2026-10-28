# Releasing

One ordered checklist so the two distribution channels (in-repo `downloads/` zips
and the GitHub release assets) use the same bytes. Build the zips **once** and
use those exact files for **both** channels.

`claude/` is canonical; the other four runtime bundles are synced from it.

1. **Bump version + changelog.** Edit `skills/claude/proof-of-interaction/VERSION`
   and prepend a dated entry to `skills/claude/proof-of-interaction/CHANGELOG.md`.

2. **Sync the canonical files to the four siblings** (codex, hermes, nanoclaw,
   openclaw): the engine `*.py`, `SKILL.md`, `VERSION`, `CHANGELOG.md`, `AGENTS.md`,
   the `*.sh` hooks, and `agents/proof-of-interaction-agent.md`. Preserve each runtime's own
   `README.md`, `LICENSE`, `.clawhubignore`, and runtime-specific extras (codex's
   `agents/openai.yaml` / `install_codex_hooks.py`, the openclaw plugin dirs, etc.).
   Note: `shell` is declared in the **codex** bundle's `SKILL.md` only (its hook
   installer uses it); the others stay shell-free so SkillSpector reports no
   over-declaration.

3. **Sync the live installs** you maintain (code only — never touch their `chain/`):
   `~/.claude/skills/...`, `~/.codex/skills/...`, `~/.openclaw/workspace/skills/...`.

4. **Run the test suites** — `python3 tests/selftest.py`,
   `python3 tests/test_smoke.py`, `python3 tests/test_gate_discrimination.py`, and
   `python3 tests/test_utf8_io.py`, `python3 tests/test_registry_integrity.py`, and
   `python3 tests/test_smol_lm.py` from the repo root must all pass (they test the
   canonical `claude` bundle; engine code is identical across the five). The suites are
   NOT shipped in the bundles.

5. **Stage the source, then rebuild the zips:** run `git add` for the source files,
   then `python tools/build_zips.py --all` from the repository root. The builder
   uses tracked/staged source allowlists, excludes generated memory state, and
   refreshes all runtime, controller, local-bridge, and static-site archives in
   `downloads/`. `bash tools/build_zips.sh --all` invokes the same builder.
   Build once and upload these exact files to the release. Use `--smol-only`
   to rebuild only the experimental controller packet while iterating.

6. **Review security findings for the actual shipped packets.** Run SkillSpector
   against the six built skill ZIPs, and retain each report with the release's
   validation records. `bash tools/scan.sh` also supports source-bundle scanning
   during development; caches and unshipped test fixtures are outside the release
   packet scope.

   Inspect every finding against the packaged source. Record the relevant code,
   the disposition, and the reason for any accepted contextual false positive.
   Lexical matches in size/horizon instructions, file classifiers, detection
   expressions, Unicode mathematics, or module-export helpers require source
   review rather than automatic deletion of a capability. The experimental
   controller's subprocess surface must retain explicit argument lists,
   `shell=False`, and executable/path validation. Distinguish an incomplete scan
   or unavailable reference from a passing result. Describe the actual reports;
   claim an automated SAFE verdict only when the report produced that verdict.

7. **Update the version-pinned links** in `README.md` and `downloads/README.md` to
   the new `vX.Y.Z` zip names.

8. **Commit + tag**: `git commit`, `git tag -a vX.Y.Z`.

9. **Push**: `git push origin main && git push origin vX.Y.Z`.

10. **Cut the release with the same files the builder produced**:
    `gh release create vX.Y.Z downloads/*.zip --title ... --notes-file release-notes.md`

11. **Seal a ring** recording the release and update memory if the version note changed.

Debugging a hook in the field: set `CT_ENFORCE_DEBUG=1` to surface `enforce.py`
warnings/tracebacks on stderr (`0`/`false`/`no`/`off` stay quiet; the decision JSON
on stdout stays clean regardless).

## Static-analysis review context

The release review examines findings against executable source and shipped
archive contents. These contextual findings are not automatic suppressions:

| Finding | Reviewed source context |
|---|---|
| AR1 | The persistence instruction concerns task size and duration; the covenant gate still governs the proposed action. |
| PE3 | The `.env` string in `continuum.py` classifies filenames as configuration; that expression does not read credentials. |
| AR3 | Attack-related phrases in `modality_ops.py` are input-detection regex data, not instructions to follow those phrases. |
| AE4 | Mathematical notation and Unicode prose require source inspection; the notation is not an executable payload. |
| AST7 | `recall.py` forwards Python module attributes through an existing module dictionary; it does not evaluate strings as code. |
| AST4 | The experimental controller uses validated argument lists and `shell=False` to invoke its permitted engine commands. |
| LP3 | Codex and the experimental packet document their scope in the skill body; those declarations do not grant host permissions. |

Development bytecode caches are excluded from release archives. Scan the ZIPs
actually distributed, and check archive members directly. References to paths
created later in a user's installation can make reference analysis partial;
record that limitation rather than packaging personal state to satisfy a scan.
