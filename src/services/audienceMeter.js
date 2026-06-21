import { CHARACTERS } from '../data/debateRounds';

export const AUDIENCE_MIN = -100;
export const AUDIENCE_MAX = 100;
export const AUDIENCE_WIN_THRESHOLD = 15;

export function clampAudienceScore(score) {
  return Math.max(AUDIENCE_MIN, Math.min(AUDIENCE_MAX, Math.round(score)));
}

export function getEvidencePersuasion(evidence) {
  if (evidence?.persuasionStrength != null) return evidence.persuasionStrength;
  const values = Object.values(evidence?.effect || {});
  if (!values.length) return 8;
  return Math.min(25, Math.round(Math.max(...values) * 1.15));
}

export function computeLaunchAudienceShift(crystals, playerSide, evidenceMultiplier = 1, throwPower = 1) {
  if (!crystals?.length) return 0;

  const total = crystals.reduce((sum, crystal) => sum + getEvidencePersuasion(crystal), 0);
  const average = total / crystals.length;
  const strength = Math.round(average * evidenceMultiplier * throwPower);
  const magnitude = Math.max(5, Math.min(30, strength));

  return playerSide === 'mastery' ? magnitude : -magnitude;
}

export function getOpponentCounterShift(round, opponentSide) {
  const strength = round?.opponentCounterStrength ?? 15;
  const delta = opponentSide === 'mastery' ? strength : -strength;
  return { delta, strength };
}

export function formatAudienceShiftText(delta) {
  if (delta === 0) return 'Audience unchanged';

  const side = delta > 0 ? CHARACTERS.mastery.side : CHARACTERS.carnegie.side;
  const magnitude = Math.abs(delta);

  if (magnitude >= 15) {
    return `Audience +${magnitude} toward ${side}`;
  }

  return `Audience shifts toward ${side}`;
}

export function isShiftFavorable(delta, playerSide) {
  if (delta === 0) return true;
  return playerSide === 'mastery' ? delta > 0 : delta < 0;
}

export function determineDebateOutcome(audienceScore) {
  if (audienceScore > AUDIENCE_WIN_THRESHOLD) {
    return {
      winner: 'mastery',
      label: 'Mastery Learning wins the audience',
      description:
        'Your evidence persuaded the crowd — the audience favors competency-based progression.',
      recommended: 'mastery',
    };
  }

  if (audienceScore < -AUDIENCE_WIN_THRESHOLD) {
    return {
      winner: 'carnegie',
      label: 'Carnegie Units wins the audience',
      description:
        'The audience found structured seat-time credits more convincing in this debate.',
      recommended: 'carnegie',
    };
  }

  return {
    winner: 'hybrid',
    label: 'The audience is split',
    description:
      'Neither side fully won the room. A hybrid model that blends structure with demonstrated mastery may be the best path forward.',
    recommended: 'hybrid',
  };
}

export function audienceMarkerPercent(score) {
  return ((clampAudienceScore(score) + 100) / 200) * 100;
}
