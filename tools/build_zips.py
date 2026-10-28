#!/usr/bin/env python3
"""Build deterministic, state-free Proof of Interaction release archives.

Stage release source with git add before running. Runtime packets are selected
from the Git index, while the small controller packet uses a fixed allowlist.
Every archive member is checked against its source bytes before publication.
"""

from __future__ import annotations

import argparse
import hashlib
import re
import subprocess
import zipfile
from pathlib import Path, PurePosixPath

ROOT = Path(__file__).resolve().parent.parent
DEST = ROOT / "downloads"
RUNTIMES = ("claude", "codex", "hermes", "nanoclaw", "openclaw")
SKILL = "proof-of-interaction"
SMOL = "proof-of-interaction-smol-lm"
FORBIDDEN_STATE = re.compile(
    r"(?:^|/)(?:chain|tasks|__pycache__|node_modules)(?:/|$)"
    r"|(?:^|/)registry/(?:policy|scorer|labeler|grown|grown_ops|emergent)\.json$"
    r"|(?:^|/)registry/lens(?:/|$)"
    r"|(?:^|/)(?:active_ops\.py|\.active_audit|\.DS_Store)$"
    r"|\.py[co]$"
)
SMOL_FILES = (
    "SKILL.md", "VERSION", "LICENSE", "agents/openai.yaml",
    "references/controller-contract.md", "scripts/strict_turn.py",
)


def tracked_files() -> dict[str, int]:
    result = subprocess.run(
        ["git", "-C", str(ROOT), "ls-files", "--stage", "-z"],
        check=True, capture_output=True,
    )
    tracked = {}
    for entry in result.stdout.split(b"\0"):
        if not entry:
            continue
        meta, raw_path = entry.split(b"\t", 1)
        mode, _digest, stage = meta.decode("ascii").split()
        if stage != "0":
            raise RuntimeError("Resolve merge conflicts before packaging")
        if mode not in ("100644", "100755"):
            raise RuntimeError("Only regular tracked files may be packaged")
        tracked[raw_path.decode("utf-8")] = int(mode, 8)
    if not tracked:
        raise RuntimeError("No tracked files: stage release source with git add first")
    return tracked


def version(path: Path) -> str:
    value = path.read_text(encoding="utf-8").strip()
    if not re.fullmatch(r"[0-9]+\.[0-9]+\.[0-9]+", value):
        raise RuntimeError(f"Invalid release version in {path.relative_to(ROOT)}")
    return value


def packet_members(prefix: str, tracked: dict[str, int]) -> list[tuple[str, Path, int]]:
    base = PurePosixPath(prefix)
    parent = base.parent
    members = []
    for rel, mode in tracked.items():
        if rel.startswith(prefix + "/"):
            arcname = str(PurePosixPath(rel).relative_to(parent))
            members.append((arcname, ROOT / rel, mode))
    if not members:
        raise RuntimeError(f"No tracked release files in {prefix}")
    return members


def build_archive(name: str, members: list[tuple[str, Path, int]]) -> Path:
    target = DEST / name
    ordered = sorted(members, key=lambda member: member[0])
    paths = [member[0] for member in ordered]
    if len(paths) != len(set(paths)):
        raise RuntimeError(f"Duplicate archive member in {name}")
    for arcname, path, _mode in ordered:
        posix = PurePosixPath(arcname)
        if posix.is_absolute() or ".." in posix.parts or FORBIDDEN_STATE.search(arcname):
            raise RuntimeError(f"Refusing runtime state or unsafe archive path: {arcname}")
        if not path.is_file() or path.is_symlink():
            raise RuntimeError(f"Missing or non-regular release source: {path}")
    with zipfile.ZipFile(target, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for arcname, path, mode in ordered:
            info = zipfile.ZipInfo(arcname, date_time=(2026, 1, 1, 0, 0, 0))
            info.create_system = 3
            info.external_attr = mode << 16
            info.compress_type = zipfile.ZIP_DEFLATED
            archive.writestr(info, path.read_bytes(), compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)
    with zipfile.ZipFile(target) as archive:
        if archive.testzip() is not None or archive.namelist() != paths:
            raise RuntimeError(f"Archive integrity failure: {name}")
        for arcname, path, _mode in ordered:
            if archive.read(arcname) != path.read_bytes():
                raise RuntimeError(f"Archive differs from source: {name}:{arcname}")
    digest = hashlib.sha256(target.read_bytes()).hexdigest()
    print(f"built downloads/{name}: {len(ordered)} files; source parity PASS; sha256 {digest}")
    return target


def write_checksums() -> None:
    """Refresh the manifest for every currently available release archive."""
    archives = sorted(DEST.glob("proof-of-interaction-*.zip"), key=lambda path: path.name)
    lines = [f"{hashlib.sha256(path.read_bytes()).hexdigest()}  {path.name}\n" for path in archives]
    temporary = DEST / "SHA256SUMS.tmp"
    with temporary.open("w", encoding="utf-8", newline="\n") as stream:
        stream.writelines(lines)
    temporary.replace(DEST / "SHA256SUMS")
    print(f"wrote downloads/SHA256SUMS: {len(archives)} archives")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--all", action="store_true", help="build every release archive (default)")
    mode.add_argument("--smol-only", action="store_true", help="build only the experimental controller packet")
    args = parser.parse_args()
    tracked = tracked_files()
    DEST.mkdir(exist_ok=True)
    release = version(ROOT / "skills" / "claude" / SKILL / "VERSION")
    smol_release = version(ROOT / "skills" / "smol-lm" / SMOL / "VERSION")
    for runtime in RUNTIMES:
        if version(ROOT / "skills" / runtime / SKILL / "VERSION") != release:
            raise RuntimeError("Runtime bundle versions must match")
    if not args.smol_only:
        for stale in DEST.glob("proof-of-interaction-*-skill-v*.zip"):
            stale.unlink()
        for runtime in RUNTIMES:
            members = packet_members(f"skills/{runtime}/{SKILL}", tracked)
            names = {arcname for arcname, _path, _mode in members}
            for required in ("PoI.py", "timechain.py", "registry_store.py", "SKILL.md", "VERSION"):
                if f"{SKILL}/{required}" not in names:
                    raise RuntimeError(f"Runtime packet missing {runtime}/{required}")
            build_archive(f"proof-of-interaction-{runtime}-skill-v{release}.zip", members)
    else:
        for stale in DEST.glob("proof-of-interaction-smol-lm-skill-v*.zip"):
            stale.unlink()
    smol_members = []
    for rel in SMOL_FILES:
        source_rel = f"skills/smol-lm/{SMOL}/{rel}"
        if source_rel not in tracked:
            raise RuntimeError(f"Controller source must be tracked: {source_rel}")
        smol_members.append((f"{SMOL}/{rel}", ROOT / source_rel, tracked[source_rel]))
    build_archive(f"proof-of-interaction-smol-lm-skill-v{smol_release}.zip", smol_members)
    if not args.smol_only:
        dashboard = [(rel, ROOT / rel, mode) for rel, mode in tracked.items() if rel.startswith("dashboard/")]
        if not dashboard:
            raise RuntimeError("No tracked dashboard source")
        build_archive("proof-of-interaction-dashboard-local-bridge.zip", dashboard)
        static = [(rel[len("dashboard/public/"):], ROOT / rel, mode)
                  for rel, mode in tracked.items() if rel.startswith("dashboard/public/")]
        if not static:
            raise RuntimeError("No tracked static dashboard source")
        build_archive("proof-of-interaction-static-site.zip", static)
    write_checksums()


if __name__ == "__main__":
    main()
