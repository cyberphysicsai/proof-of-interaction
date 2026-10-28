import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dashboardRoot = path.resolve(__dirname, '..');

const hasPython = (() => {
  try { return spawnSync('python3', ['--version']).status === 0; } catch { return false; }
})();

// The CPHY observatory contract: the token-metaprogramming lanes are readable
// from the on-disk artifacts alone (ledger, weights, onchain config, pending
// queue, telemetry offers), remote origins still must pair before reading
// them, and every mutation route refuses an unpaired remote outright.
//
// The fixture is deliberately adversarial to the fold semantics:
// - an etch TOP-UP on the same ring (cumulative snapshots — last wins, never sum)
// - two onchain-observe events (last observation set wins) whose RECORDED
//   density_per_token (0.5) differs from onchain.json's current rate (2.0) —
//   the weight the agent experiences uses the event-frozen rate
// - two kind-shadowed faculty-unlock events for the SAME faculty (cphy.py's
//   append_event lets data.kind shadow the event kind, so they read
//   kind='sense'; tokens are the cumulative deposit balance — last wins)
// - a bridge lock carrying a_indices/b_indices instead of indices
// - a shadow-heavy exponent to pin the 0.25x clamp floor
// - a recovery ring so quarantine branches link to their scar
async function createCphyRoot() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'ctdash-cphy-'));
  await fs.mkdir(path.join(root, 'registry', 'cphy'), { recursive: true });
  await fs.mkdir(path.join(root, 'chain', 'cphy'), { recursive: true });
  await fs.mkdir(path.join(root, 'chain', 'blockspace', 'blobs'), { recursive: true });
  await fs.writeFile(path.join(root, 'SKILL.md'), '# Test Skill\n');
  await fs.writeFile(path.join(root, 'timechain.py'), '# test placeholder\n');
  await fs.writeFile(path.join(root, 'registry', 'modalities.json'), JSON.stringify({ modalities: [{ id: 1, name: 'Base Modality' }] }));
  await fs.writeFile(path.join(root, 'registry', 'senses.json'), JSON.stringify({ senses: [{ id: 1, name: 'Base Sense A' }, { id: 2, name: 'Base Sense B' }] }));
  await fs.writeFile(path.join(root, 'registry', 'grown.json'), JSON.stringify({ modalities: [{ id: 9, name: 'Fixture-Done Reasoning' }], senses: [] }));
  // The Dream Cache, exercising every lifecycle status the wild uses:
  // 'emergent' (sprouted), 'proposal' (old spelling of a model-authored
  // proposal, with inert op code), and 'promoted' (recurrence path — already
  // part of the active self, so the nursery must not offer to activate it).
  await fs.writeFile(path.join(root, 'registry', 'emergent.json'), JSON.stringify({
    registry: 'emergent',
    faculties: [
      { eid: 'E1', kind: 'sense', name: 'Fixture-Drift Sensing', function: 'Detect fixture drift early.', category: 'structural', origin: 'sprout', seed_terms: ['fixture', 'drift'], status: 'emergent', recurrence: 2, born_at: '2026-07-01T00:00:00+00:00', promoted_to_id: null },
      { eid: 'E2', kind: 'modality', name: 'Fixture-Splice Reasoning', function: 'Reason about pack splices.', category: 'knowledge', origin: 'model-authored proposal', seed_terms: ['splice'], status: 'proposal', op_code: 'def op(text):\n    return "inert"', recurrence: 1, born_at: '2026-07-02T00:00:00+00:00', promoted_to_id: null },
      { eid: 'E3', kind: 'modality', name: 'Fixture-Done Reasoning', function: 'Already promoted by recurrence.', category: 'knowledge', origin: 'sprout', seed_terms: [], status: 'promoted', recurrence: 3, born_at: '2026-07-03T00:00:00+00:00', promoted_to_id: 9 },
    ],
  }));
  await fs.writeFile(path.join(root, 'chain', 'blockspace', 'index.json'), '{}');

  const rings = [
    { index: 0, ring_type: 'genesis', prev_hash: '0'.repeat(64), payload: { name: 'fixture' }, blockspace_refs: [], poi: {}, ring_hash: 'a'.repeat(64) },
    { index: 1, ring_type: 'turn', prev_hash: 'a'.repeat(64), payload: { summary: 'first work' }, blockspace_refs: [], poi: { brightness: 200 }, ring_hash: 'b'.repeat(64) },
    { index: 2, ring_type: 'imported', prev_hash: 'b'.repeat(64), payload: { summary: '[foreign:Demo] graft', foreign: true, origin_author: 'Demo', origin_index: 5, origin_pack: 'deadbeef' }, blockspace_refs: [], poi: {}, ring_hash: 'c'.repeat(64) },
    { index: 3, ring_type: 'synthesis', prev_hash: 'c'.repeat(64), payload: { summary: 'collapsed', considered_forks: [{ perspective: 'Lens A', kind: 'sense', visits: 3, value: 150 }] }, blockspace_refs: [], poi: {}, ring_hash: 'd'.repeat(64) },
    { index: 4, ring_type: 'recovery', prev_hash: 'd'.repeat(64), payload: { summary: 'recovered from drift', resumed_from_height: 2, quarantined: [3], scar: { id: 'scar1' } }, blockspace_refs: [], poi: {}, ring_hash: 'e'.repeat(64) },
  ];
  await fs.writeFile(path.join(root, 'chain', 'rings.jsonl'), rings.map((r) => JSON.stringify(r)).join('\n') + '\n');

  await fs.writeFile(path.join(root, 'registry', 'cphy', 'weights.json'), JSON.stringify({
    ledger_head: 'f'.repeat(64),
    events: 7,
    minted: 10.5,
    locked: 6.0,
    balance: 4.5,
    active_locks: [
      { ts: '2026-07-01T00:00:00+00:00', lock_id: 'abc123def456', op: 'basin', amount: 4.0, indices: [1, 2], memo: 'test basin' },
      { ts: '2026-07-01T00:02:00+00:00', lock_id: 'b1b2b3c4d5e6', op: 'bridge', amount: 2.0, a_indices: [0], b_indices: [3], memo: 'bridge endpoints' },
    ],
    exponents: { 1: 2.0, 2: 5.0, 3: -5.0 },
  }));
  await fs.writeFile(path.join(root, 'registry', 'cphy', 'onchain.json'), JSON.stringify({
    token: '0x08Df470d41C11Ba5Cb60242747D76C65Ca52c94c',
    chain: 'base',
    density_per_token: 2.0, // CURRENT config rate — must NOT be applied to old observations
    etch_recall_n: 3,
    targets: { 1: { address: '0x' + '1'.repeat(40), ring_hash: 'b'.repeat(16) } },
    faculty_targets: {},
  }));
  await fs.writeFile(path.join(root, 'registry', 'cphy', 'pending.json'), JSON.stringify([
    { id: 'aabbccdd11', status: 'pending', type: 'etch', ring: 1, tokens: 2.0, address: '0x' + '1'.repeat(40), detected: '2026-07-05T00:00:00+00:00' },
    { id: 'ee11223344', status: 'pending', type: 'unlock', faculty_key: 'sense:9', name: 'Trap-Premise Sensing', tokens: 1.0, address: '0x' + '3'.repeat(40), detected: '2026-07-05T00:10:00+00:00' },
  ]));
  await fs.writeFile(path.join(root, 'chain', 'cphy', 'ledger.jsonl'), [
    JSON.stringify({ seq: 0, ts: '2026-07-01T00:00:00+00:00', kind: 'mint', amount: 10.5, prev: 'genesis', event_hash: 'e0'.padEnd(64, '0') }),
    JSON.stringify({ seq: 1, ts: '2026-07-01T00:01:00+00:00', kind: 'etch', ring: 2, tokens: 5.0, address: '0x' + '2'.repeat(40), prev: 'e0'.padEnd(64, '0'), event_hash: 'e1'.padEnd(64, '0') }),
    // Deepening top-up: cumulative 7 CPHY total on ring 2 — replaces, never adds.
    JSON.stringify({ seq: 2, ts: '2026-07-01T00:02:00+00:00', kind: 'etch', ring: 2, tokens: 7.0, address: '0x' + '2'.repeat(40), prev: 'e1'.padEnd(64, '0'), event_hash: 'e2'.padEnd(64, '0') }),
    // Superseded observation set (last-wins).
    JSON.stringify({ seq: 3, ts: '2026-07-01T00:03:00+00:00', kind: 'onchain-observe', observations: { 0: 1.0 }, density_per_token: 0.5, prev: 'e2'.padEnd(64, '0'), event_hash: 'e3'.padEnd(64, '0') }),
    JSON.stringify({ seq: 4, ts: '2026-07-01T00:04:00+00:00', kind: 'onchain-observe', observations: { 0: 3.0 }, density_per_token: 0.5, prev: 'e3'.padEnd(64, '0'), event_hash: 'e4'.padEnd(64, '0') }),
    // Faculty unlock whose kind was shadowed to 'sense' on disk; tokens are the
    // deposit address's CUMULATIVE balance, so the second event replaces the first.
    JSON.stringify({ seq: 5, ts: '2026-07-01T00:05:00+00:00', kind: 'sense', faculty_key: 'sense:7', id: 7, name: 'Fixture Sensing', tokens: 1.0, prev: 'e4'.padEnd(64, '0'), event_hash: 'e5'.padEnd(64, '0') }),
    JSON.stringify({ seq: 6, ts: '2026-07-01T00:06:00+00:00', kind: 'sense', faculty_key: 'sense:7', id: 7, name: 'Fixture Sensing', tokens: 2.0, prev: 'e5'.padEnd(64, '0'), event_hash: 'e6'.padEnd(64, '0') }),
  ].join('\n') + '\n');

  const filler = Array.from({ length: 15 }, (_, k) => (
    { i: 10 + k, rank: 2 + k, score: 0.2 - k * 0.01, parts: { semantic: 0.1 }, salience: 50, chosen: false }
  ));
  await fs.writeFile(path.join(root, 'chain', 'telemetry.jsonl'), [
    JSON.stringify({
      schema: 1, event: 'offer', ts: '2026-07-05T01:00:00+00:00', head_index: 3,
      data: {
        query_keywords: ['cphy', 'weights'], dissonance: 120, appetite: 2, threshold: 0.18, considered: 3, returned: 2,
        candidates: [
          { i: 1, rank: 0, score: 0.5, parts: { semantic: 0.4, cphy: 4.0 }, salience: 200, chosen: true },
          { i: 2, rank: 1, score: 0.3, parts: { semantic: 0.3, etched: 5 }, salience: 150, chosen: true },
          { i: 3, rank: 2, score: 0.1, parts: { semantic: 0.1 }, salience: 90, chosen: false },
        ],
      },
    }),
    // A wide offer: 18 candidates, with a CHOSEN ε-exploration pick past the
    // 16-candidate display cut — it must survive the truncation.
    JSON.stringify({
      schema: 1, event: 'offer', ts: '2026-07-05T02:00:00+00:00', head_index: 4,
      data: {
        query_keywords: ['fork', 'lineage'], dissonance: 90, appetite: 2, threshold: 0.18, considered: 18, returned: 2,
        candidates: [
          { i: 1, rank: 0, score: 0.6, parts: { semantic: 0.5, cphy: 4.0 }, salience: 210, chosen: true },
          { i: 2, rank: 1, score: 0.25, parts: { semantic: 0.25 }, salience: 140, chosen: false },
          ...filler,
          { i: 5, rank: 17, score: 0.05, parts: { semantic: 0.05 }, salience: 40, chosen: true, explore: true },
        ],
      },
    }),
  ].join('\n') + '\n');

  await fs.writeFile(path.join(root, 'chain', 'immune.json'), JSON.stringify({
    locked: false, safe_height: 1, quarantine: [3], scars: [{ id: 'scar1', blocks: [3], lesson: 'fixture lesson' }],
  }));
  return root;
}

function request(port, pathname, { method = 'GET', headers = {}, body = null } = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port, path: pathname, method, headers }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf8');
        let json = null;
        try { json = JSON.parse(raw); } catch { json = null; }
        resolve({ status: res.statusCode, raw, json });
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

// 9500+: disjoint from bridge-security (8867-9366) and learning-overview
// (8917-9416) — the three files run concurrently under one `node --test`.
// A striding counter (not random) keeps servers WITHIN this file collision-free
// too: some tests run three roots at once.
let portCursor = 9500 + Math.floor(Math.random() * 200);

async function startServer(root) {
  portCursor += 7;
  const port = portCursor;
  const child = spawn(process.execPath, [path.join(dashboardRoot, 'server.mjs')], {
    env: { ...process.env, CT_DASHBOARD_ROOT: root, CT_DASHBOARD_PORT: String(port), CT_DASHBOARD_PUBLIC_ORIGINS: 'https://dashboard.example.test' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  for (let i = 0; i < 80; i += 1) {
    try {
      await request(port, '/api/bridge/status');
      return { child, port };
    } catch {
      await new Promise((r) => setTimeout(r, 125));
    }
  }
  child.kill();
  throw new Error('server did not start');
}

test('cphy overview folds ledger snapshots last-wins and dedupes unlock burns', async (t) => {
  const root = await createCphyRoot();
  const { child, port } = await startServer(root);
  t.after(() => child.kill());

  const { status, json } = await request(port, '/api/cphy/overview');
  assert.equal(status, 200);
  assert.equal(json.present, true);
  assert.equal(json.supply.minted, 10.5);
  assert.equal(json.onchain.approval, 'require');
  assert.equal(json.onchain.etchRecallN, 3);
  assert.equal(json.pending.length, 2);
  assert.equal(json.pending[0].status, 'pending');
  assert.equal(json.pending[1].type, 'unlock', 'pending faculty burns are staged as type unlock');
  // last etch (7) + last unlock (2): cumulative snapshots are replaced, never summed.
  assert.equal(json.burnedTotal, 9);
  assert.equal(json.etches['2'].tokens, 7, 'etch top-up replaces the earlier cumulative snapshot');
  assert.equal(json.etches['2'].echelon, 7);
  assert.equal(json.unlocks.length, 1, 'repeated unlock events for one faculty fold to one');
  assert.equal(json.unlocks[0].tokens, 2);
  assert.deepEqual(json.observed, { 0: 3 }, 'later observation set replaces the earlier one');
  assert.equal(json.observedRate, 0.5, 'the rate frozen into the observe event, not the config rate');
  assert.equal(json.locks[0].op, 'basin');
  assert.deepEqual(json.locks[1].indices, [0, 3], 'bridge locks expose a+b endpoints as indices');
});

test('cphy blocks apply the event-frozen on-chain rate and both clamp bounds', async (t) => {
  const root = await createCphyRoot();
  const { child, port } = await startServer(root);
  t.after(() => child.kill());

  const blocks = await request(port, '/api/cphy/blocks');
  assert.equal(blocks.status, 200);
  const byIndex = new Map(blocks.json.blocks.map((b) => [b.index, b]));
  assert.equal(byIndex.get(1).multiplier, 4, 'exponent 2.0 → 4x');
  assert.equal(byIndex.get(2).multiplier, 4, 'exponent 5.0 clamps to 4x (I2 ceiling)');
  assert.equal(byIndex.get(3).multiplier, 0.25, 'exponent -5.0 clamps to 0.25x (I2 floor)');
  assert.equal(byIndex.get(0).observedTokens, 3);
  // 3 tokens × event rate 0.5 = exponent 1.5 → 2^1.5; the config rate (2.0)
  // must NOT be used, or this would clamp to 4x.
  assert.equal(byIndex.get(0).multiplier, 2.8284);
  assert.equal(byIndex.get(2).etch.echelon, 7);
  assert.equal(byIndex.get(1).depositAddress, '0x' + '1'.repeat(40));
  assert.ok(byIndex.get(0).locks.includes('b1b2b3c4d5e6'), 'bridge lock covers endpoint a');
  assert.ok(byIndex.get(3).locks.includes('b1b2b3c4d5e6'), 'bridge lock covers endpoint b');
  // The landscape's retrieval-activity lane: chosen counts from the offer log.
  assert.deepEqual(blocks.json.recallHits, { 1: 2, 2: 1, 5: 1 });
});

test('ledger audit maps PASS to ok, tamper-FAIL to false, absence to null', { skip: !hasPython && 'python3 unavailable' }, async (t) => {
  // The fixture root has no cphy.py — audit is inconclusive (null).
  const bare = await createCphyRoot();
  const bareSrv = await startServer(bare);
  t.after(() => bareSrv.child.kill());
  const absent = await request(bareSrv.port, '/api/cphy/overview');
  assert.equal(absent.json.audit.ok, null);

  // cmd_audit's contract: exit 0 ending "AUDIT: PASS", or exit 1 printing "FAIL ...".
  const passing = await createCphyRoot();
  await fs.writeFile(path.join(passing, 'cphy.py'), 'import sys\nprint("7 event(s), hash chain intact")\nprint("AUDIT: PASS")\n');
  const passSrv = await startServer(passing);
  t.after(() => passSrv.child.kill());
  const ok = await request(passSrv.port, '/api/cphy/overview');
  assert.equal(ok.json.audit.ok, true);

  const failing = await createCphyRoot();
  await fs.writeFile(path.join(failing, 'cphy.py'), 'import sys\nprint("FAIL  event 1: hash mismatch (tampered or torn)")\nsys.exit(1)\n');
  const failSrv = await startServer(failing);
  t.after(() => failSrv.child.kill());
  const bad = await request(failSrv.port, '/api/cphy/overview');
  assert.equal(bad.json.audit.ok, false, 'a tampered ledger must read AUDIT: FAIL, not "unavailable"');
  assert.match(bad.json.audit.line, /FAIL/);
});

test('retrieval history: rank order, leaderboard fold, recency, kept chosen picks', async (t) => {
  const root = await createCphyRoot();
  const { child, port } = await startServer(root);
  t.after(() => child.kill());

  const { status, json } = await request(port, '/api/retrieval/history?limit=5');
  assert.equal(status, 200);
  assert.equal(json.totalOffers, 2);
  // Latest offer first.
  assert.equal(json.offers[0].ts, '2026-07-05T02:00:00+00:00');
  assert.equal(json.offers[0].candidates[0].rank, 0);
  assert.equal(json.offers[0].candidates[0].parts.cphy, 4.0);
  // The chosen ε-exploration pick past the 16-candidate cut survives truncation.
  assert.equal(json.offers[0].candidates.length, 17);
  const explorePick = json.offers[0].candidates.find((c) => c.index === 5);
  assert.ok(explorePick?.chosen && explorePick?.explore, 'chosen explore pick at rank 17 is kept');
  // Leaderboard: chosen desc, considered as tiebreak; bestRank folds the minimum.
  assert.equal(json.rings[0].index, 1);
  assert.equal(json.rings[0].chosen, 2);
  assert.equal(json.rings[0].bestRank, 0);
  assert.equal(json.rings[1].index, 2, 'chosen tie resolves by considered count');
  assert.equal(json.rings[0].cphy, 4.0);

  // The limit clamps to at least 1.
  const clamped = await request(port, '/api/retrieval/history?limit=0');
  assert.equal(clamped.json.offers.length, 1);
  assert.equal(clamped.json.offers[0].ts, '2026-07-05T02:00:00+00:00');
});

test('immune and forks views link scars, recoveries, grafts and perspective forks', async (t) => {
  const root = await createCphyRoot();
  const { child, port } = await startServer(root);
  t.after(() => child.kill());

  const immune = await request(port, '/api/immune');
  assert.equal(immune.status, 200);
  assert.equal(immune.json.scars[0].id, 'scar1');
  assert.deepEqual(immune.json.quarantine, [3]);

  const forks = await request(port, '/api/forks');
  assert.equal(forks.status, 200);
  assert.equal(forks.json.head.index, 4);
  // The quarantine branch resolves through the recovery ring to its scar.
  assert.deepEqual(forks.json.quarantineBranches[0], { from: 3, to: 3, scarId: 'scar1', recoveryRing: 4, resumedFromHeight: 2 });
  assert.equal(forks.json.recoveries[0].index, 4);
  assert.equal(forks.json.grafts[0].originAuthor, 'Demo');
  assert.equal(forks.json.synthesisForks[0].forks[0].perspective, 'Lens A');
});

test('emergent nursery folds the Dream Cache with lifecycle-aware counts', async (t) => {
  const root = await createCphyRoot();
  const { child, port } = await startServer(root);
  t.after(() => child.kill());

  const { status, json } = await request(port, '/api/registry/emergent');
  assert.equal(status, 200);
  assert.equal(json.faculties.length, 3);
  assert.deepEqual(json.counts, {
    emergent: 1,
    proposed: 1, // the old 'proposal' spelling counts as proposed
    inSelf: 1,   // 'promoted' via recurrence is already part of the self
    activeModalities: 2, // base 1 + grown 1
    activeSenses: 2,     // base 2 + grown 0
  });
  const proposal = json.faculties.find((f) => f.eid === 'E2');
  assert.match(proposal.opCode, /def op/, 'inert op code rides along for review and copy');
  assert.equal(proposal.opCodeChars, 'def op(text):\n    return "inert"'.length);
  const promoted = json.faculties.find((f) => f.eid === 'E3');
  assert.equal(promoted.promotedToId, 9);
  assert.deepEqual(json.faculties.find((f) => f.eid === 'E1').seedTerms, ['fixture', 'drift']);
});

test('nursery paste surfaces a skill decline as an error, never as success', { skip: !hasPython && 'python3 unavailable' }, async (t) => {
  // cambium.py grow/propose-op/activate DECLINE with exit 0 (they print a
  // "->" hint and write nothing) — the bridge must read the words, not the
  // exit code, or a silent no-op reports as success.
  const root = await createCphyRoot();
  await fs.writeFile(path.join(root, 'cambium.py'), 'import sys\nprint("  -> dissonance 8 <= floor 40: existing faculties already cover this input; no growth.")\n');
  const { child, port } = await startServer(root);
  t.after(() => child.kill());

  const paste = await request(port, '/api/registry/propose', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ kind: 'sense', name: 'Covered Vocabulary Sensing', function: 'x', seedTerms: ['fixture'] }),
  });
  assert.equal(paste.status, 422, 'a grow decline must not read as success');
  assert.match(paste.json.error, /no growth/);

  await fs.writeFile(path.join(root, 'cambium.py'), 'import sys\nprint("  -> no emergent proposal matched \'E9\'")\n');
  const act = await request(port, '/api/registry/activate', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ selector: 'E9' }),
  });
  assert.equal(act.status, 422, 'an activate decline must not read as success');
});

test('organ panel computes census and fails soft on absent organs', async (t) => {
  const root = await createCphyRoot();
  const { child, port } = await startServer(root);
  t.after(() => child.kill());

  const { status, json } = await request(port, '/api/organs');
  assert.equal(status, 200);
  // Census from the 5 fixture rings.
  assert.equal(json.census.total, 5);
  assert.equal(json.census.genesis.name, 'fixture');
  assert.equal(json.census.byType.genesis, 1);
  // Absent organs render as honest zero-states, never errors.
  assert.equal(json.vitals.doctor, null, 'no doctor.py in the fixture root');
  assert.equal(json.vitals.consensus.configured, false);
  assert.equal(json.continuum.totals.roots, 0, 'no per-task chain roots in the fixture');
  // Only synthesis rings carrying a chronosynaptic_* event are collapses —
  // other organs seal ring_type synthesis too, and must not be counted.
  assert.equal(json.chronosynaptic.collapses, 0);
  assert.equal(json.conscience.conjectures.scored, 0);
  // Token-lane fields for the two-lane CPHY band.
  const overview = await request(port, '/api/cphy/overview');
  assert.equal(overview.json.onchain.targets[0].burnedTotal, 0);
  assert.equal(overview.json.onchain.targets[0].rotation, 0);
});

test('observatory reads require pairing for remote origins; hostile origins refused', async (t) => {
  const root = await createCphyRoot();
  const { child, port } = await startServer(root);
  t.after(() => child.kill());

  for (const pathname of ['/api/cphy/overview', '/api/cphy/blocks', '/api/retrieval/history', '/api/immune', '/api/forks', '/api/registry/emergent', '/api/organs']) {
    const hostile = await request(port, pathname, { headers: { origin: 'https://evil.example' } });
    assert.equal(hostile.status, 403, `${pathname} hostile`);
    const unpaired = await request(port, pathname, { headers: { origin: 'https://dashboard.example.test' } });
    assert.equal(unpaired.status, 401, `${pathname} unpaired remote`);
    const local = await request(port, pathname);
    assert.equal(local.status, 200, `${pathname} local`);
  }

  // The live preview (POST) sits behind the same read gate.
  const body = JSON.stringify({ query: 'which blocks surface' });
  const hostilePreview = await request(port, '/api/retrieval/preview', {
    method: 'POST', headers: { origin: 'https://evil.example', 'content-type': 'application/json' }, body,
  });
  assert.equal(hostilePreview.status, 403);
  const unpairedPreview = await request(port, '/api/retrieval/preview', {
    method: 'POST', headers: { origin: 'https://dashboard.example.test', 'content-type': 'application/json' }, body,
  });
  assert.equal(unpairedPreview.status, 401);
  const emptyPreview = await request(port, '/api/retrieval/preview', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}',
  });
  assert.equal(emptyPreview.status, 400, 'a preview requires a query');
});

test('mutation routes refuse unpaired remotes and validate their inputs', async (t) => {
  const root = await createCphyRoot();
  const { child, port } = await startServer(root);
  t.after(() => child.kill());

  const mutations = [
    ['/api/cphy/pending/aabbccdd11/approve', '{}'],
    ['/api/cphy/lock', JSON.stringify({ op: 'basin', from: 1, to: 2, amount: 1 })],
    ['/api/cphy/release', JSON.stringify({ lockId: 'abc123def456' })],
    ['/api/cphy/etch-recall-n', JSON.stringify({ n: 3 })],
    ['/api/pack/export', JSON.stringify({ from: 1, to: 2 })],
    ['/api/pack/import', JSON.stringify({ pack: { rings: [] } })],
    ['/api/ring/seal', JSON.stringify({ summary: 'a fixture annotation' })],
    ['/api/immune/forget-scar', JSON.stringify({ id: 'scar1' })],
    ['/api/immune/rollback', JSON.stringify({ height: 1, confirm: 'QUARANTINE 1' })],
    ['/api/registry/activate', JSON.stringify({ selector: 'E1' })],
    ['/api/registry/propose', JSON.stringify({ kind: 'sense', name: 'Remote Sense', function: 'x' })],
    ['/api/cphy/sync', '{}'],
  ];
  for (const [pathname, body] of mutations) {
    const remote = await request(port, pathname, {
      method: 'POST',
      headers: { origin: 'https://dashboard.example.test', 'content-type': 'application/json' },
      body,
    });
    assert.equal(remote.status, 401, `${pathname} must refuse an unpaired remote`);
  }

  // Local validation errors come back as JSON errors, never as silent success.
  const cases = [
    ['/api/cphy/lock', { op: 'basin', from: 1, to: 2, amount: -5 }, 400, 'negative lock amount'],
    ['/api/cphy/lock', { op: 'basin', from: -1, to: 2, amount: 1 }, 400, 'negative ring index'],
    ['/api/cphy/release', { lockId: 'NOT-A-HEX-ID' }, 400, 'malformed lock id'],
    ['/api/cphy/etch-recall-n', { n: 65 }, 400, 'etch n above 64'],
    ['/api/cphy/target', { from: 0, to: 40 }, 400, 'target range above 33 rings'],
    ['/api/ring/seal', { summary: 'short' }, 400, 'seal summary under 8 chars'],
    ['/api/immune/forget-scar', { id: 'nope!' }, 400, 'malformed scar id'],
    ['/api/pack/import', { pack: {} }, 400, 'pack without rings[]'],
    ['/api/immune/rollback', { height: 1, confirm: 'nope' }, 428, 'rollback without the confirmation phrase'],
    // Nursery inputs become argparse argv — leading dashes must never parse as flags.
    ['/api/registry/activate', { selector: '--evil-flag' }, 400, 'dash-leading activate selector'],
    ['/api/registry/propose', { kind: 'organ', name: 'Valid Name', function: 'x' }, 400, 'unknown faculty kind'],
    ['/api/registry/propose', { kind: 'sense', name: '-Dashed Name', function: 'x' }, 400, 'dash-leading faculty name'],
    ['/api/registry/propose', { kind: 'sense', name: 'Valid Name', function: 'x', seedTerms: ['-evil'] }, 400, 'dash-leading seed term'],
    ['/api/registry/propose', { kind: 'sense', name: 'Valid Name', function: 'x', code: 'x'.repeat(20001) }, 400, 'op code above the 20k inert cap'],
  ];
  for (const [pathname, payload, expected, label] of cases) {
    const res = await request(port, pathname, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    assert.equal(res.status, expected, label);
  }

  // The fixture root has placeholder .py files, so a well-formed mutation
  // reaches the CLI boundary and surfaces its failure as a JSON error —
  // proving the route exists, is guarded, and never fakes success.
  const seal = await request(port, '/api/ring/seal', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ summary: 'a fixture annotation for the seal route' }),
  });
  assert.ok([422, 501].includes(seal.status), `seal surfaces CLI outcome, got ${seal.status}`);
});
