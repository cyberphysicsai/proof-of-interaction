import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { modelChoiceAction } from '../public/model-catalogue.js';
import { modelCatalogueView } from '../public/chainchat-display.js';

const row = patch => ({ id: 'vendor/model:free', available: true, access: 'byok', service: 'openrouter', ...patch });
test('free choices distinguish shared selection, own-key selection and a fixed new provider connection', () => {
  assert.deepEqual(modelChoiceAction(row({ connectionReady: false, apiKey: 'must-never-copy', baseUrl: 'https://attacker.invalid' }), 'free'),
    { kind: 'connect', preset: { provider: 'compatible', baseUrl: 'https://openrouter.ai/api/v1', model: 'vendor/model:free', reasoningCapable: false } });
  assert.deepEqual(modelChoiceAction(row({ connectionReady: true }), 'free'), { kind: 'switch', tier: 'byok', model: 'vendor/model:free' });
  assert.deepEqual(modelChoiceAction(row({ access: 'shared', service: 'opencode' }), 'free'), { kind: 'switch', tier: 'free', model: 'vendor/model:free' });
  for (const model of [row({ available: false }), row({ service: 'unknown' }), row({ id: 'bad\nmodel' })]) assert.throws(() => modelChoiceAction(model, 'free'));
  const view = modelCatalogueView({ tiers: [{ id: 'free', available: true, models: [row({ connectionReady: true, apiKey: 'must-never-copy', baseUrl: 'https://attacker.invalid' })] }] });
  assert.equal(view.tiers[1].models[0].service, 'openrouter');
  assert.equal(JSON.stringify(view).includes('must-never-copy'), false); assert.equal(JSON.stringify(view).includes('attacker.invalid'), false);
});

test('choosing a new free provider clears the old input and prepares an explicit own-key form without any model/API request', async () => {
  const app = await readFile(new URL('../public/app.js', import.meta.url), 'utf8');
  const start = app.indexOf('async function chooseCatalogueModel('), end = app.indexOf('async function refreshModelCatalogue(', start);
  assert.ok(start >= 0 && end > start);
  const nodes = new Map(), switches = [];
  const $ = id => {
    if (!nodes.has(id)) nodes.set(id, { value: 'synthetic-old-input', focus() {}, querySelector() { return this; } });
    return nodes.get(id);
  };
  const context = { $, modelChoiceAction, modelSwitchBusy: false, requestBusy: false, selectedModelTier: 'free',
    switchModel: async (...args) => switches.push(args), updateProviderPlaceholder() {}, renderModelCatalogue() {} };
  vm.createContext(context); vm.runInContext(app.slice(start, end), context);
  await context.chooseCatalogueModel(row({}), 'free');
  assert.equal(switches.length, 0);
  assert.equal($('apiKey').value, ''); assert.equal($('apiKey').required, true);
  assert.equal($('baseUrl').value, 'https://openrouter.ai/api/v1');
  assert.equal($('provider').value, 'compatible'); assert.equal($('modelId').value, 'vendor/model:free');
  assert.equal(context.selectedModelTier, 'byok'); assert.equal($('byokManualDetails').open, true);
  await context.chooseCatalogueModel(row({ connectionReady: true }), 'free');
  assert.deepEqual(switches, [['byok', 'vendor/model:free']]);
});


test('native model metadata exposes only actual catalogue rows and preserves native active state without any credential fields', async () => {
  const { nativeModelCatalogueView, nativeModelSelection } = await import('../public/model-catalogue.js');
  const raw = { configured: true, current: 'vendor/model', apiKey: 'synthetic-private-value', models: [
    { id: 'vendor/model', name: 'Configured model', available: true, apiKey: 'synthetic-private-value' },
    { id: 'vendor/needs-auth', available: false, reason: 'Configure authentication locally.' }, { id: 'vendor/model', available: true },
    { id: 'bad\nmodel', available: true },
  ] };
  const view = nativeModelCatalogueView(raw);
  assert.equal(view.models.length, 2); assert.equal(view.models[1].available, false);
  assert.equal(JSON.stringify(view).includes('synthetic-private-value'), false);
  const selected = nativeModelSelection({ provider: { provider: 'native', tier: 'native', configured: true,
    model: 'vendor/model', apiKey: 'synthetic-private-value' } }, 'vendor/model');
  assert.deepEqual(selected, { provider: 'native', tier: 'native', configured: true, model: 'vendor/model' });
  assert.throws(() => nativeModelSelection({ provider: { ...selected, provider: 'compatible' } }, selected.model));
  assert.throws(() => nativeModelSelection({ provider: selected }, 'other/model'));
  assert.deepEqual(modelCatalogueView({ active: { tier: 'native', provider: 'native', model: selected.model } }).active,
    { tier: 'native', provider: 'native', model: selected.model });
});

class NativeNode {
  constructor(tag) { this.tagName = tag; this.children = []; this.textContent = ''; this.attributes = {}; this.handlers = {};
    const names = new Set(); this.classList = { add: name => names.add(name), remove: name => names.delete(name), contains: name => names.has(name) }; }
  append(...nodes) { this.children.push(...nodes); }
  replaceChildren(...nodes) { this.children = nodes; }
  setAttribute(name, value) { this.attributes[name] = value; }
  addEventListener(name, handler) { this.handlers[name] = handler; }
  async fire(name = 'click') { await this.handlers[name]?.(); }
  set innerHTML(_value) { throw new Error('Native metadata must be text'); }
}
function nativeDescendants(node) { return [node, ...node.children.flatMap(nativeDescendants)]; }

test('native picker reads configured models and switches only through the dedicated native endpoint without API keys', async () => {
  const { mountNativeModelPicker } = await import('../public/model-catalogue.js');
  const mount = new NativeNode('section'), calls = [], selected = [], busy = [];
  const doc = { createElement: tag => new NativeNode(tag) };
  const controller = mountNativeModelPicker({ document: doc, mount, api: async (url, payload) => {
    calls.push([url, payload]);
    return payload ? { provider: { provider: 'native', tier: 'native', configured: true, model: payload.model } }
      : { configured: true, current: 'vendor/model', models: [{ id: 'vendor/model', name: '<script>literal</script>', available: true },
        { id: 'vendor/no-auth', available: false, reason: 'Missing local authentication.' }] };
  }, onSelected: provider => selected.push(provider), onBusy: value => busy.push(value) });
  await mount.children[0].fire();
  const nodes = nativeDescendants(mount), available = nodes.find(node => node.tagName === 'button' && node.children.some(child => child.children?.some(item => item.textContent === '<script>literal</script>')));
  assert.ok(available); assert.equal(nodes.some(node => node.tagName === 'script'), false);
  await available.fire();
  assert.deepEqual(calls, [['/api/openclaw/provider', undefined], ['/api/openclaw/provider', { model: 'vendor/model' }]]);
  assert.deepEqual(selected, [{ provider: 'native', tier: 'native', configured: true, model: 'vendor/model' }]);
  assert.deepEqual(busy, [true, false]);
  controller.reset(); assert.equal(selected.length, 1);
});


test('native picker ignores stale owner responses and unavailable models cannot issue selection requests', async () => {
  const { mountNativeModelPicker } = await import('../public/model-catalogue.js');
  let owner = 1, release; const selected = [], calls = [], mount = new NativeNode('section');
  const doc = { createElement: tag => new NativeNode(tag) };
  const controller = mountNativeModelPicker({ document: doc, mount, context: () => owner, onSelected: value => selected.push(value),
    api: (...args) => { calls.push(args); return new Promise(resolve => { release = resolve; }); } });
  const pending = mount.children[0].fire(); owner++; controller.sync();
  release({ configured: true, current: 'vendor/old-model', models: [{ id: 'vendor/old-model', available: true }] }); await pending;
  assert.equal(nativeDescendants(mount).some(node => node.textContent === 'vendor/old-model'), false); assert.equal(selected.length, 0);
  const again = mount.children[0].fire(); release({ models: [{ id: 'vendor/no-auth', available: false }] }); await again;
  const unavailable = nativeDescendants(mount).find(node => node.tagName === 'button' && node.children.some(child => child.children?.some(item => item.textContent === 'vendor/no-auth')));
  assert.ok(unavailable); assert.equal(unavailable.disabled, true); await unavailable.fire();
  assert.equal(calls.length, 2, 'Only the two metadata GET requests were issued.');
});

test('opening native mode keeps saved BYOK details separate and clears the secret input', async () => {
  const app = await readFile(new URL('../public/app.js', import.meta.url), 'utf8');
  const start = app.indexOf('function openModel() {'), end = app.indexOf('nativeModelPicker = mountNativeModelPicker(', start);
  const nodes = new Map(), $ = id => { if (!nodes.has(id)) nodes.set(id, { value: 'old-input' }); return nodes.get(id); };
  const context = { $, state: { provider: { provider: 'native', model: 'native/selected', tier: 'native', configured: true } },
    lastByokDetails: { provider: 'compatible', model: 'saved/byok-model', baseUrl: 'https://provider.example/v1', configured: true },
    nativeModelPicker: { reset() {} }, nativeAuthControls: { reset() {} }, rememberByokProvider() {}, updateProviderPlaceholder() {}, renderOperationControls() {}, renderModelCatalogue() {}, openDialog() {}, refreshModelCatalogue() {} };
  vm.createContext(context); vm.runInContext(app.slice(start, end), context); context.openModel();
  assert.equal($('modelId').value, 'saved/byok-model'); assert.equal($('baseUrl').value, 'https://provider.example/v1');
  assert.equal($('apiKey').value, ''); assert.equal(context.lastByokDetails.model, 'saved/byok-model');
});
