import { getEvidencePersuasion } from './audienceMeter';

export function buildLaunchPayload(inspectedItems) {
  if (!inspectedItems.length) {
    return {
      id: 'launch-empty',
      text: 'No crystals ready to launch.',
      sourceIds: [],
      crystals: [],
    };
  }

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
    id: `launch-${inspectedItems.map((i) => i.id).join('-')}`,
    text,
    sourceIds: inspectedItems.map((i) => i.id),
    crystals: inspectedItems,
    totalPersuasion: inspectedItems.reduce((sum, item) => sum + getEvidencePersuasion(item), 0),
  };
}

/** @deprecated use buildLaunchPayload */
export function buildArgumentFromEvidence(inspectedItems) {
  return buildLaunchPayload(inspectedItems);
}

export function getEvidenceMultiplier(inspectedCount) {
  if (inspectedCount >= 3) return 1;
  if (inspectedCount === 2) return 0.875;
  if (inspectedCount === 1) return 0.75;
  return 0;
}
