import { METRIC_KEYS } from '../data/debateRounds';

export function buildArgumentFromEvidence(inspectedItems) {
  if (!inspectedItems.length) {
    return {
      id: 'arg-empty',
      text: 'I need more evidence to make my case.',
      metricImpact: {},
    };
  }

  const metricImpact = {};
  METRIC_KEYS.forEach((key) => {
    metricImpact[key] = 0;
  });

  inspectedItems.forEach((item) => {
    Object.entries(item.effect || {}).forEach(([key, val]) => {
      if (metricImpact[key] !== undefined) {
        metricImpact[key] += val;
      }
    });
  });

  const primaryInsight = inspectedItems[0].insight;
  const suffix =
    inspectedItems.length > 1
      ? ` — supported by ${inspectedItems.length} evidence crystals.`
      : '';
  const text =
    primaryInsight.length > 100
      ? `${primaryInsight.slice(0, 97)}...${suffix}`
      : `${primaryInsight}${suffix}`;

  return {
    id: `arg-${inspectedItems.map((i) => i.id).join('-')}`,
    text,
    metricImpact,
    sourceIds: inspectedItems.map((i) => i.id),
  };
}

export function getEvidenceMultiplier(inspectedCount) {
  if (inspectedCount >= 3) return 1;
  if (inspectedCount === 2) return 0.875;
  if (inspectedCount === 1) return 0.75;
  return 0;
}
