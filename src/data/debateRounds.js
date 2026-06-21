// TODO: load debate content from RAG API or CMS
// TODO: dynamic evidence generation based on user side / prior answers

export const METRIC_KEYS = ['learning', 'equity', 'scalability', 'engagement'];

export const METRIC_LABELS = {
  learning: 'Learning',
  equity: 'Equity',
  scalability: 'Scalability',
  engagement: 'Engagement',
};

export const INITIAL_METRICS = {
  learning: 50,
  equity: 50,
  scalability: 50,
  engagement: 50,
};

export const CHARACTERS = {
  carnegie: {
    id: 'carnegie',
    label: 'Carnegie Nerd',
    side: 'Carnegie Units',
    color: '#4A90D9',
  },
  mastery: {
    id: 'mastery',
    label: 'Mastery Wizard',
    side: 'Mastery Learning',
    color: '#9B59B6',
  },
};

export const FINAL_CHOICES = {
  carnegie: 'Carnegie Units',
  mastery: 'Mastery Learning',
  hybrid: 'Hybrid Model',
};

export const HYBRID_MESSAGE =
  'You noticed the core tension: Carnegie Units are scalable and recognizable, while Mastery Learning better supports demonstrated understanding. A hybrid model tries to combine structure with deeper evidence of learning.';

export const debateRounds = [
  {
    round: 1,
    opponentChallenge: 'Does mastery learning actually improve understanding?',
    evidence: [
      {
        id: 'r1-e1',
        text: "Bloom's mastery learning research suggests students can perform better when given feedback and corrective instruction.",
        unlocksCardIds: ['r1-card-main'],
      },
      {
        id: 'r1-e2',
        text: 'Mastery learning lets students move on after demonstrating understanding, not just after spending time in class.',
        unlocksCardIds: ['r1-card-main'],
      },
      {
        id: 'r1-e3',
        text: 'A potential issue is that implementation can require more teacher planning and support.',
        unlocksCardIds: ['r1-card-main'],
      },
    ],
    argumentCards: [
      {
        id: 'r1-card-main',
        text: 'Students should progress based on demonstrated mastery.',
        requiresEvidenceIds: ['r1-e1', 'r1-e2', 'r1-e3'],
        metricImpact: { learning: 25, equity: 10, engagement: 10, scalability: -10 },
      },
    ],
    opponentCounter:
      'Counter: seat-time guarantees exposure even when mastery pacing is uneven across a classroom.',
    rebuttals: [
      {
        id: 'r1-rb1',
        text: 'Time in class is the only fair way to measure learning progress.',
        isBest: false,
        metricImpact: {},
      },
      {
        id: 'r1-rb2',
        text: 'Feedback and corrective instruction help students actually reach understanding, not just sit through lessons.',
        isBest: true,
        metricImpact: { learning: 10, equity: 5, engagement: 5 },
      },
      {
        id: 'r1-rb3',
        text: 'Mastery learning sounds good but is too hard for teachers to implement.',
        isBest: false,
        metricImpact: { scalability: -5 },
      },
    ],
  },
  {
    round: 2,
    opponentChallenge: 'How would this scale to a large school with hundreds of students?',
    evidence: [
      {
        id: 'r2-e1',
        text: 'Carnegie Units are easier to schedule because time is standardized.',
        unlocksCardIds: [],
      },
      {
        id: 'r2-e2',
        text: 'Mastery systems can become complex when students move at different paces.',
        unlocksCardIds: [],
      },
      {
        id: 'r2-e3',
        text: 'Technology and clear rubrics can help manage competency-based progression.',
        unlocksCardIds: [],
      },
    ],
    argumentCards: [],
    opponentCounter:
      'Counter: without standardized pacing, large schools struggle to staff rooms, schedule buses, and report progress consistently.',
    rebuttals: [
      {
        id: 'r2-rb1',
        text: 'Mastery cannot work in large schools, so we should stick to seat-time credits only.',
        isBest: false,
        metricImpact: {},
      },
      {
        id: 'r2-rb2',
        text: 'Mastery can scale when competencies, assessments, and feedback systems are clearly structured.',
        isBest: true,
        metricImpact: { learning: 10, equity: 10, scalability: 15 },
      },
      {
        id: 'r2-rb3',
        text: 'Just add more teachers until every student has a personal tutor.',
        isBest: false,
        metricImpact: { scalability: -10 },
      },
    ],
  },
  {
    round: 3,
    opponentChallenge: 'How do colleges and transcripts understand mastery-based progress?',
    evidence: [
      {
        id: 'r3-e1',
        text: 'Carnegie Units are widely recognized by colleges and school systems.',
        unlocksCardIds: [],
      },
      {
        id: 'r3-e2',
        text: 'Mastery learning may require new transcript models or competency records.',
        unlocksCardIds: [],
      },
      {
        id: 'r3-e3',
        text: 'Hybrid systems can preserve credits while adding competency evidence.',
        unlocksCardIds: [],
      },
    ],
    argumentCards: [],
    opponentCounter:
      'Counter: admissions offices expect familiar credit hours — unfamiliar transcripts create friction for students.',
    rebuttals: [
      {
        id: 'r3-rb1',
        text: 'Colleges will never accept anything except traditional Carnegie credits.',
        isBest: false,
        metricImpact: {},
      },
      {
        id: 'r3-rb2',
        text: 'A hybrid model can keep recognizable credits while showing deeper evidence of learning.',
        isBest: true,
        metricImpact: { learning: 15, equity: 10, scalability: 20, engagement: 5 },
      },
      {
        id: 'r3-rb3',
        text: 'Students should skip transcripts entirely and just explain their learning in interviews.',
        isBest: false,
        metricImpact: { scalability: -5 },
      },
    ],
  },
];
