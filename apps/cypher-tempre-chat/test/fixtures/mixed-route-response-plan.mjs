/** Test-only local provider script, bound to the current host turn directive. */
export const parentDirective = tier => {
  if (!['free', 'byok'].includes(tier)) throw new Error('Unknown synthetic route tier.');
  return 'CT_ROUTE_FIXTURE_PARENT_' + tier;
};

export function createMixedRouteResponsePlan() {
  const issued = new Set();
  return { next(messages, {native = false} = {}) {
    if (native) return null;
    const matches = (messages || []).filter(row => ['system', 'developer'].includes(row.role)).flatMap(row => {
      const content = typeof row.content === 'string' ? row.content : Array.isArray(row.content)
        ? row.content.filter(block => block.type === 'text').map(block => block.text || '').join('\n') : '';
      return [...content.matchAll(/(?:^|\n)HOST-SUPPLIED CHAINCHAT TURN DIRECTIVE\nCT_ROUTE_FIXTURE_PARENT_(free|byok)\nEND HOST-SUPPLIED TURN DIRECTIVE(?:\n|$)/g)].map(match => match[1]);
    });
    if (matches.length !== 1 || issued.has(matches[0])) return null;
    issued.add(matches[0]);
    return matches[0];
  }};
}
