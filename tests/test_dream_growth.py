#!/usr/bin/env python3
"""Dream growth consumes experience, never its own maintenance artifacts."""

from __future__ import annotations

import importlib
import json
from pathlib import Path
import shutil
import sys
import tempfile
import unittest
from unittest import mock


REPO = Path(__file__).resolve().parent.parent
RUNTIMES = ("claude", "codex", "hermes", "nanoclaw", "openclaw")
SKILL = REPO / "skills" / "claude" / "proof-of-interaction"
MAINTENANCE_TYPES = (
    "epoch", "autobiography", "calibration", "cphy-digest",
    "faculty-op-proposed", "faculty-activated", "faculty-wake",
    "faculty-unlock", "prune",
)
EXPERIENCE = "kubernetes pod crashloopbackoff oomkill replicaset kubelet eviction probe"
NEW_EXPERIENCE = "hyperledger fabric chaincode endorsement gossip ordering consensus"


class DreamGrowthTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.scratch = tempfile.TemporaryDirectory(prefix="ct-dream-growth-tests-")
        cls.directory = Path(cls.scratch.name).resolve()
        assert cls.directory.parent == Path(tempfile.gettempdir()).resolve()
        assert cls.directory.name.startswith("ct-dream-growth-tests-")
        # The whole code/registry home is disposable: even an accidental fallback
        # inside a learner cannot write to an installed or repository skill.
        cls.code = cls.directory / "skill"
        shutil.copytree(SKILL, cls.code, ignore=shutil.ignore_patterns(
            "chain", "tasks", "__pycache__", "*.pyc", "*.pyo", "active_ops.py",
            "grown.json", "grown_ops.json", "emergent.json", "policy.json",
            "scorer.json", "labeler.json", "lens"))
        sys.path.insert(0, str(cls.code))
        cls.timechain = importlib.import_module("timechain")
        cls.cambium = importlib.import_module("cambium")
        cls.dream = importlib.import_module("dream")
        for module in (cls.timechain, cls.cambium, cls.dream):
            assert Path(module.__file__).resolve().is_relative_to(cls.code)

    @classmethod
    def tearDownClass(cls):
        sys.path.remove(str(cls.code))
        assert cls.directory.parent == Path(tempfile.gettempdir()).resolve()
        assert cls.directory.name.startswith("ct-dream-growth-tests-")
        cls.scratch.cleanup()

    def new_root(self, suffix=""):
        root = self.directory / (self._testMethodName + suffix)
        (root / "registry").mkdir(parents=True)
        for name in ("modalities.json", "senses.json"):
            shutil.copyfile(self.code / "registry" / name, root / "registry" / name)
        tc = self.timechain.Timechain(root)
        tc.genesis(name="dream-growth-regression")
        (root / "registry" / "policy.json").write_text(json.dumps({"growth": {
            "window": 12, "min_cluster": 3, "min_intra_sim": 0.3,
            "max_label_agreement": 0.5, "max_proposals_per_dream": 2,
        }}), encoding="utf-8")
        return root, tc

    def append_cluster(self, tc, kind="experience", text=EXPERIENCE):
        for i in range(4):
            tc.seal(kind, {"summary": text + " " + str(i)})

    @staticmethod
    def mutations(report):
        return [p for p in report["growth"]["proposals"]
                if p.get("action") in ("born", "recurrence", "promoted")]

    @staticmethod
    def registry_bytes(root):
        return {p.name: p.read_bytes() for p in (root / "registry").iterdir() if p.is_file()}

    def test_all_five_runtime_growth_implementations_match(self):
        implementations = [(REPO / "skills" / runtime / "proof-of-interaction" / "dream.py").read_bytes()
                           for runtime in RUNTIMES]
        self.assertTrue(all(value == implementations[0] for value in implementations))

    def test_each_generated_maintenance_type_is_ineligible(self):
        for kind in MAINTENANCE_TYPES:
            with self.subTest(kind=kind):
                root, tc = self.new_root("-" + kind)
                self.append_cluster(tc, kind)
                before = self.registry_bytes(root)
                chain_before = tc.rings_path.read_bytes()
                result = self.dream.Dream(root, registry_root=root).propose_growth()
                self.assertEqual(result["examined"], 0)
                self.assertEqual(result["proposals"], [])
                self.assertEqual(self.registry_bytes(root), before)
                self.assertEqual(tc.rings_path.read_bytes(), chain_before)
                self.assertTrue(tc.verify()[0])

    def test_full_dreams_do_not_promote_their_own_epochs_or_portrait(self):
        frozen = "2026-11-04T00:00:00.000000+00:00"
        with mock.patch.object(self.timechain, "now_iso", return_value=frozen), \
                mock.patch.object(self.cambium, "now_iso", return_value=frozen):
            root, tc = self.new_root()
            self.append_cluster(tc)
            first = self.dream.Dream(root, registry_root=root).run()
            self.assertTrue(self.mutations(first), "Real new experience must still propose growth.")
            first_height = tc.height()
            watermark = self.dream.Dream(root, registry_root=root)._state()["growth_to"]
            artifacts = [r for r in tc.load() if r["index"] > watermark]
            self.assertTrue(any(r["ring_type"] == "epoch" for r in artifacts))
            self.assertTrue(any(r["ring_type"] == "autobiography" for r in artifacts))
            before = self.registry_bytes(root)
            chain_before = tc.rings_path.read_bytes()
            # Actual first-dream producers create these records; there is no new
            # user experience, mocked grow function or manually rewritten state.
            for _ in range(3):
                following = self.dream.Dream(root, registry_root=root).run()
                self.assertTrue(following["ran"])
                self.assertEqual(self.mutations(following), [])
                self.assertEqual(following["growth"]["examined"], 0)
                self.assertEqual(self.registry_bytes(root), before)
            self.assertGreater(tc.height(), first_height)
            self.assertTrue(tc.rings_path.read_bytes().startswith(chain_before))
            self.assertTrue(tc.verify()[0])

    def test_genuine_new_experience_after_maintenance_still_grows(self):
        root, tc = self.new_root()
        self.append_cluster(tc)
        first = self.dream.Dream(root, registry_root=root).run()
        self.assertTrue(self.mutations(first))
        unchanged = self.dream.Dream(root, registry_root=root).run()
        self.assertEqual(self.mutations(unchanged), [])
        self.append_cluster(tc, text=NEW_EXPERIENCE)
        renewed = self.dream.Dream(root, registry_root=root).run()
        self.assertTrue(self.mutations(renewed))
        once_more = self.dream.Dream(root, registry_root=root).run()
        self.assertEqual(self.mutations(once_more), [])
        self.assertTrue(tc.verify()[0])

    def test_custom_experience_types_remain_eligible_and_high_water_marked(self):
        for kind in ("experience", "field-observation", "continuum", "synthesis"):
            with self.subTest(kind=kind):
                root, tc = self.new_root("-" + kind)
                self.append_cluster(tc, kind)
                instance = self.dream.Dream(root, registry_root=root)
                first = instance.propose_growth()
                self.assertTrue(first["proposals"])
                self.assertEqual(first["examined"], 4)
                self.assertEqual(instance._state()["growth_to"], 4)
                second = instance.propose_growth()
                self.assertEqual(second["proposals"], [])
                self.assertEqual(second["examined"], 0)
                self.assertTrue(tc.verify()[0])


if __name__ == "__main__":
    unittest.main()
