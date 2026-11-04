"""Complete lexical support, including valid opaque identity and path citations."""
from pathlib import Path
from unittest.mock import patch
import hashlib
import importlib
import shutil
import sys
import tempfile
import unittest

SKILL = Path(__file__).resolve().parents[1] / 'skills/claude/proof-of-interaction'
HASH = '99b55f8a258bc875a0d54c2bed427b8cae660242f6e19c1a67805adee92d40ae'


class EntityGroundingTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory(prefix='ct_entity_grounding_')
        cls.home = Path(cls.temp.name)
        cls.code = cls.home / 'skill'
        shutil.copytree(SKILL, cls.code, ignore=shutil.ignore_patterns('__pycache__', '*.pyc', 'chain'))
        sys.path.insert(0, str(cls.code))
        cls.poi = importlib.import_module('PoI')
        cls.timechain = importlib.import_module('timechain')

    @classmethod
    def tearDownClass(cls):
        sys.path.remove(str(cls.code))
        cls.temp.cleanup()

    def gate(self, candidate, evidence):
        return self.poi.PoIGate({'entity_grounding_enforce': True}).evaluate(
            candidate, [], context='Summarize the recorded observation.',
            external_scores={dimension: 230 for dimension in self.timechain.POI_DIMENSIONS},
            evidence_texts=[evidence])

    def test_real_identity_hash_cannot_support_an_unrelated_measurement(self):
        root = self.home / 'actual-hash-agent'
        (root / 'registry').mkdir(parents=True)
        for name in ('senses.json', 'modalities.json'):
            shutil.copyfile(self.code / 'registry' / name, root / 'registry' / name)
        tc = self.timechain.Timechain(root)
        with patch.object(self.timechain, 'now_iso', return_value='2026-11-04T00:00:00.000426+00:00'):
            genesis = tc.genesis('Test Agent', covenant=['love', 'peace', 'joy', 'kindness', 'mildness',
                'self-control', 'goodness', 'patience', 'faith'],
                params={'application': 'cypher-tempre-chat', 'schema': 1})
        self.assertEqual(genesis['ring_hash'], HASH)
        before = tc.rings_path.read_bytes()
        registry = {file.name: hashlib.sha256(file.read_bytes()).hexdigest()
                    for file in (root / 'registry').iterdir() if file.is_file()}
        identity = f'The verified genesis hash is {HASH}. Up to 21 perspectives are configured.'
        invented = 'The measurement was 875 metres in document.txt.'
        self.assertEqual(self.poi.extract_specifics(invented), ['875', 'document.txt'])
        rejected = self.gate(invented, identity)
        self.assertEqual(rejected['entity_grounding'], 0)
        self.assertEqual(rejected['specifics_total'], 2)
        self.assertEqual(set(rejected['specifics_missing']), {'875', 'document.txt'})
        self.assertEqual(rejected['decision'], 'FORCE_UNCERTAINTY')
        honest = f'The genesis hash is {HASH}; 21 perspectives are configured.'
        self.assertEqual(self.poi.extract_specifics(honest), [HASH, '21'])
        accepted = self.gate(honest, identity)
        self.assertEqual(accepted['entity_grounding'], 255)
        self.assertEqual(accepted['specifics_total'], 2)
        self.assertEqual(accepted['decision'], 'SEAL')
        self.assertTrue(tc.verify()[0])
        self.assertEqual(tc.rings_path.read_bytes(), before)
        self.assertEqual(registry, {file.name: hashlib.sha256(file.read_bytes()).hexdigest()
                                   for file in (root / 'registry').iterdir() if file.is_file()})

    def test_numbers_do_not_borrow_support_from_larger_or_different_atoms(self):
        for evidence in (HASH, '1875', '8750', '875.5', '1,875', '875%', 'v875.5',
                         'Agent875', '875agent', 'code-875', 'code.875'):
            with self.subTest(evidence=evidence):
                verdict = self.gate('The measurement was 875 in document.txt.', evidence)
                self.assertEqual(verdict['entity_grounding'], 0)
                self.assertEqual(verdict['specifics_total'], 2)
                self.assertEqual(set(verdict['specifics_missing']), {'875', 'document.txt'})
                self.assertEqual(verdict['decision'], 'FORCE_UNCERTAINTY')

    def test_complete_decimal_percent_and_version_are_not_shortened(self):
        for value, different in (('875.5', '875.50'), ('12.5%', '12.5'), ('v1.2.3', 'v1.2.30'),
                                 ('v1.2.3-alpha', 'v1.2.3-alphabet'), ('-875', '875')):
            with self.subTest(value=value):
                candidate = f'The recorded value is {value} in document.txt.'
                self.assertEqual(self.poi.extract_specifics(candidate), [value, 'document.txt'])
                score, missing, total = self.poi.entity_grounding(candidate, different)
                self.assertEqual((score, missing, total), (0, [value, 'document.txt'], 2))

    def test_exact_types_case_and_numeric_comma_folding_still_ground(self):
        pairs = [('875', '875'), ('1,234.50', '1234.50'), ('12.5%', '12.5%'),
                 ('.50', '.50'), ('-875', '-875'), ('v1.2.3', 'V1.2.3'),
                 ('v1.2.3-alpha', 'v1.2.3-ALPHA'), ('document.txt', 'DOCUMENT.TXT'),
                 ('function_ref()', 'FUNCTION_REF()'), ('CT_AUTOMAINT', 'ct_automaint'),
                 ('Agent73', 'agent73'), ('CPHY', 'cphy'), (HASH, HASH.upper())]
        for candidate, evidence in pairs:
            with self.subTest(candidate=candidate):
                self.assertEqual(self.poi.extract_specifics(candidate), [candidate])
                self.assertEqual(self.poi.entity_grounding(candidate, evidence), (255, [], 1))
        self.assertEqual(self.poi.entity_grounding('Release v1.2.3 uses 875.', 'Release v1.2.3; value 875.'),
                         (255, [], 2))

    def test_filenames_and_backup_suffixes_are_complete_claims(self):
        for candidate, evidence in (('document.txt', 'notdocument.txt'),
                                    ('document.txt', 'document.txt.bak'),
                                    ('document.txt.bak', 'document.txt'),
                                    ('main.py', '/repo/notmain.py'),
                                    ('main.py', '/repo/main.py.bak'),
                                    ('main.py', r'C:\repo\main.py.bak')):
            with self.subTest(candidate=candidate, evidence=evidence):
                self.assertEqual(self.poi.extract_specifics(candidate + ' 875'), [candidate, '875'])
                self.assertEqual(self.poi.entity_grounding(candidate + ' 875', evidence),
                                 (0, [candidate, '875'], 2))
        self.assertEqual(self.poi.entity_grounding('document.txt.bak 875', 'document.txt.bak 875'), (255, [], 2))

    def test_exact_path_and_component_basename_support_without_path_aliasing(self):
        for candidate, evidence in (('main.py', '/repo/main.py'), ('main.py', r'C:\repo\main.py'),
                                    ('/repo/main.py', '/repo/main.py'),
                                    (r'C:\repo\main.py', 'c:/REPO/MAIN.PY')):
            with self.subTest(candidate=candidate):
                self.assertEqual(self.poi.entity_grounding(candidate, evidence), (255, [], 1))
        for candidate, evidence in (('/other/main.py', '/repo/main.py'),
                                    ('dir/main.py', '/repo/main.py'),
                                    (r'D:\repo\main.py', r'C:\repo\main.py')):
            with self.subTest(candidate=candidate):
                self.assertEqual(self.poi.entity_grounding(candidate, evidence), (0, [candidate], 1))

    def test_identifiers_functions_and_legacy_extraction_keep_exact_support(self):
        for candidate, evidence in (('CT_AUTOMAINT', 'CT_AUTOMAINT_EXTRA'),
                                    ('helper()', 'otherhelper()'), ('Agent73', 'Agent730')):
            with self.subTest(candidate=candidate):
                self.assertEqual(self.poi.entity_grounding(candidate, evidence), (0, [candidate], 1))
        self.assertEqual(self.poi.extract_specifics('fixed learner.py line 365 in v1.0.0 with CT_AUTOMAINT'),
                         ['learner.py', '365', 'v1.0.0', 'CT_AUTOMAINT'])
        self.assertEqual(self.poi.entity_grounding('a plain thought with no specifics', ''), (255, [], 0))
        halfway = self.gate('The value is 875 in document.txt.', '875')
        self.assertEqual(halfway['entity_grounding'], 128)
        self.assertFalse(any('entity grounding' in reason for reason in halfway['reasons']))

    def test_all_runtime_implementations_are_identical(self):
        source = (SKILL / 'PoI.py').read_bytes()
        for runtime in ('codex', 'hermes', 'nanoclaw', 'openclaw'):
            self.assertEqual(source, (SKILL.parents[1] / runtime / 'proof-of-interaction/PoI.py').read_bytes())


if __name__ == '__main__':
    unittest.main()
