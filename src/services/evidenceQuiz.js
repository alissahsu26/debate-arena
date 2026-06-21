import { getOpponentChallenge, getOpponentCounter } from '../data/debateRounds';

const DISTRACTORS = [
  'students enjoy it more',
  'colleges prefer it over all other models',
  'teachers find it requires no extra planning',
  'parents already understand it perfectly',
  'it works without any technology support',
  'districts avoid it because it is too popular',
  'research shows it lowers learning outcomes',
  'it only works in small private schools',
  'employers reject graduates who use it',
  'implementation costs nothing for any district',
];

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function shortenForOption(text, maxLen = 72) {
  const cleaned = text.replace(/\.$/, '').trim();
  if (cleaned.length <= maxLen) return cleaned;
  const cut = cleaned.slice(0, maxLen - 3);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trim()}...`;
}

function buildPrompt(evidence, round, playerSide, exchangePhase) {
  if (evidence.quiz?.prompt) return evidence.quiz.prompt;

  const challenge =
    exchangePhase === 'counter'
      ? getOpponentCounter(round, playerSide)
      : getOpponentChallenge(round, playerSide);

  const topic = playerSide === 'mastery' ? 'Mastery learning' : 'Carnegie Units';
  const stem = challenge.includes('?') ? challenge.replace(/\?$/, '') : topic;

  return `Complete the argument: "${stem} because ______."`;
}

function pickDistractors(correctText, count = 2) {
  const normalizedCorrect = correctText.toLowerCase();
  const pool = DISTRACTORS.filter((d) => d.toLowerCase() !== normalizedCorrect);
  return shuffle(pool).slice(0, count);
}

/**
 * Build a multiple-choice quiz for an evidence item.
 * Uses explicit quiz data when present, otherwise generates from insight.
 */
export function getEvidenceQuiz(evidence, { round, playerSide, exchangePhase }) {
  if (evidence.quiz) {
    return {
      prompt: evidence.quiz.prompt,
      options: evidence.quiz.options.map((opt, index) => ({
        id: opt.id ?? String.fromCharCode(65 + index),
        text: opt.text,
        correct: Boolean(opt.correct),
      })),
    };
  }

  const correctText = shortenForOption(evidence.insight);
  const distractors = pickDistractors(correctText, 2);
  const options = shuffle([
    { id: 'A', text: distractors[0], correct: false },
    { id: 'B', text: correctText, correct: true },
    { id: 'C', text: distractors[1], correct: false },
  ]);

  return {
    prompt: buildPrompt(evidence, round, playerSide, exchangePhase),
    options,
  };
}
