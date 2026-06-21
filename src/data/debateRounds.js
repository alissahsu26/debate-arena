// TODO: load debate content from RAG API or CMS

export const INITIAL_AUDIENCE_SCORE = 0;

export const CHARACTERS = {
  carnegie: {
    id: 'carnegie',
    label: 'Cat Scholar',
    side: 'Carnegie Units',
    color: '#0080ff',
    description: 'Students progress through structured courses and seat-time requirements.',
  },
  mastery: {
    id: 'mastery',
    label: 'Mastery Lizard Wizard',
    side: 'Mastery Learning',
    color: '#ff0000',
    description: 'Students progress after demonstrating understanding.',
  },
};

export const FINAL_CHOICES = {
  carnegie: 'Carnegie Units',
  mastery: 'Mastery Learning',
  hybrid: 'Hybrid Model',
};

export const HYBRID_MESSAGE =
  'You noticed the core tension: Carnegie Units are scalable and recognizable, while Mastery Learning better supports demonstrated understanding. A hybrid model tries to combine structure with deeper evidence of learning.';

export const SUGGESTED_SEARCHES = ['District Data', 'Teacher Perspectives', 'Academic Research'];

function poolItem(id, category, label, insight, effect, keywords, sides, quiz = null) {
  return { id, category, label, insight, effect, keywords, sides, quiz };
}

export const debateRounds = [
  {
    round: 1,
    opponentChallengeBySide: {
      mastery:
        "Mastery learning sounds great, but how would it scale to a school with 2,000 students?",
      carnegie:
        "Carnegie Units feel rigid, but don't they at least guarantee every student gets equal exposure to instruction?",
    },
    opponentCounterBySide: {
      mastery: 'What about teacher workload? Mastery systems demand constant feedback and re-teaching.',
      carnegie:
        'Seat-time credits let students coast. How do you know they actually learned anything?',
    },
    opponentCounterStrength: 15,
    suggestedSearches: SUGGESTED_SEARCHES,
    attackEvidencePool: [
      poolItem(
        'r1a-dd1',
        'District Data',
        'District Data Crystal',
        'Several districts have successfully implemented competency-based systems using shared rubrics and technology.',
        { scalability: 20 },
        ['scale', 'district', '2000', 'students'],
        ['mastery'],
        {
          prompt: 'Complete the argument: "Mastery can scale because ______."',
          options: [
            { id: 'A', text: 'students enjoy it more' },
            {
              id: 'B',
              text: 'districts have implemented it using technology and shared rubrics',
              correct: true,
            },
            { id: 'C', text: 'colleges prefer it' },
          ],
        }
      ),
      poolItem(
        'r1a-tp1',
        'Teacher Perspectives',
        'Teacher Perspectives Crystal',
        'Teachers report that clear competency rubrics reduce guesswork about what "mastery" looks like in the classroom.',
        { learning: 15, engagement: 10 },
        ['teacher', 'rubric', 'feedback'],
        ['mastery']
      ),
      poolItem(
        'r1a-ar1',
        'Academic Research',
        'Academic Research Crystal',
        "Bloom's mastery learning research shows students perform better with feedback and corrective instruction.",
        { learning: 20, equity: 10 },
        ['bloom', 'research', 'mastery', 'understanding'],
        ['mastery']
      ),
      poolItem(
        'r1a-dd2',
        'District Data',
        'District Data Crystal',
        'Large urban districts using modular pacing calendars have scaled mastery models without hiring one tutor per student.',
        { scalability: 15, equity: 5 },
        ['urban', 'large', 'scale', 'district'],
        ['mastery']
      ),
      poolItem(
        'r1a-tp2',
        'Teacher Perspectives',
        'Teacher Perspectives Crystal',
        'Veteran teachers note that mastery pacing actually reduces re-teaching once foundational gaps are closed.',
        { learning: 10, scalability: 10 },
        ['workload', 'teacher', 're-teach'],
        ['mastery']
      ),
      poolItem(
        'r1a-ar2',
        'Academic Research',
        'Academic Research Crystal',
        'Meta-analyses find competency-based progression correlates with higher engagement when students see clear paths forward.',
        { engagement: 15, learning: 10 },
        ['engagement', 'competency', 'progress'],
        ['mastery']
      ),
      poolItem(
        'r1a-dd3',
        'District Data',
        'District Data Crystal',
        'State reporting systems now accept competency-based transcripts from over 40 pilot districts nationwide.',
        { scalability: 10, equity: 10 },
        ['transcript', 'reporting', 'district'],
        ['carnegie']
      ),
      poolItem(
        'r1a-tp3',
        'Teacher Perspectives',
        'Teacher Perspectives Crystal',
        'Teachers say standardized Carnegie schedules make it easier to plan lessons across grade teams.',
        { scalability: 15 },
        ['schedule', 'planning', 'carnegie', 'seat-time'],
        ['carnegie']
      ),
      poolItem(
        'r1a-ar3',
        'Academic Research',
        'Academic Research Crystal',
        'Research on instructional time shows consistent exposure matters — especially for students with interrupted schooling.',
        { equity: 20, learning: 10 },
        ['seat-time', 'exposure', 'equal', 'instruction'],
        ['carnegie']
      ),
    ],
    counterEvidencePool: [
      poolItem(
        'r1c-dd1',
        'District Data',
        'District Data Crystal',
        'Districts that phased in mastery models over 3 years saw manageable workload shifts rather than overnight overload.',
        { scalability: 15 },
        ['workload', 'phase', 'district'],
        ['mastery']
      ),
      poolItem(
        'r1c-tp1',
        'Teacher Perspectives',
        'Teacher Perspectives Crystal',
        'Teachers using mastery frameworks report peer collaboration on rubrics cuts individual planning burden.',
        { engagement: 10, scalability: 10 },
        ['workload', 'teacher', 'collaboration'],
        ['mastery']
      ),
      poolItem(
        'r1c-ar1',
        'Academic Research',
        'Academic Research Crystal',
        'Studies show technology-assisted formative assessment can automate routine feedback, freeing teacher time.',
        { scalability: 20, learning: 5 },
        ['technology', 'feedback', 'assessment'],
        ['mastery']
      ),
      poolItem(
        'r1c-dd2',
        'District Data',
        'District Data Crystal',
        'Schools combining seat-time credits with competency portfolios maintain college-ready transcripts.',
        { learning: 15, equity: 10 },
        ['credit', 'portfolio', 'transcript'],
        ['carnegie']
      ),
      poolItem(
        'r1c-tp2',
        'Teacher Perspectives',
        'Teacher Perspectives Crystal',
        'Teachers argue that exit tickets and unit assessments within Carnegie blocks still verify learning.',
        { learning: 15 },
        ['assessment', 'learning', 'verify'],
        ['carnegie']
      ),
      poolItem(
        'r1c-ar2',
        'Academic Research',
        'Academic Research Crystal',
        'Cognitive science supports spaced practice within fixed course structures — seat-time can still be rigorous.',
        { learning: 20, engagement: 5 },
        ['rigor', 'practice', 'learning'],
        ['carnegie']
      ),
    ],
  },
  {
    round: 2,
    opponentChallengeBySide: {
      mastery:
        'Even if it works in pilots, how do you schedule buses, staff rooms, and report grades when every student moves at a different pace?',
      carnegie:
        'Carnegie Units are a century old. Shouldn\'t we evolve beyond counting hours instead of measuring real skills?',
    },
    opponentCounterBySide: {
      mastery:
        'Colleges and employers still expect traditional transcripts. Your model creates friction for students.',
      carnegie:
        'Without pacing guardrails, struggling students fall further behind while advanced students wait.',
    },
    opponentCounterStrength: 15,
    suggestedSearches: SUGGESTED_SEARCHES,
    attackEvidencePool: [
      poolItem(
        'r2a-dd1',
        'District Data',
        'District Data Crystal',
        'Flexible "competency windows" let students progress within semester bands while keeping master schedules intact.',
        { scalability: 20 },
        ['schedule', 'bus', 'staff', 'pace'],
        ['mastery']
      ),
      poolItem(
        'r2a-tp1',
        'Teacher Perspectives',
        'Teacher Perspectives Crystal',
        'Advisory periods and learning labs give teachers structured time for mastery check-ins without endless overtime.',
        { scalability: 15, engagement: 10 },
        ['advisory', 'lab', 'schedule'],
        ['mastery']
      ),
      poolItem(
        'r2a-ar1',
        'Academic Research',
        'Academic Research Crystal',
        'Research on modular learning shows staggered progression can coexist with fixed period schedules.',
        { scalability: 15, learning: 10 },
        ['modular', 'schedule', 'research'],
        ['mastery']
      ),
      poolItem(
        'r2a-dd2',
        'District Data',
        'District Data Crystal',
        'SIS vendors now support competency gradebooks alongside traditional credit tracking.',
        { scalability: 20 },
        ['gradebook', 'sis', 'reporting'],
        ['mastery']
      ),
      poolItem(
        'r2a-tp2',
        'Teacher Perspectives',
        'Teacher Perspectives Crystal',
        'Teachers in pilot schools say shared pacing guides prevent chaos even when students move at different speeds.',
        { equity: 10, scalability: 10 },
        ['pacing', 'guide', 'teacher'],
        ['mastery']
      ),
      poolItem(
        'r2a-ar2',
        'Academic Research',
        'Academic Research Crystal',
        'Workforce trends emphasize demonstrated skills — seat-time alone is a weak signal for career readiness.',
        { learning: 20, engagement: 15 },
        ['skills', 'career', 'evolve', 'hours'],
        ['carnegie']
      ),
      poolItem(
        'r2a-dd3',
        'District Data',
        'District Data Crystal',
        'Hybrid transcript models in 12 states show colleges accept competency supplements alongside Carnegie credits.',
        { equity: 15, learning: 10 },
        ['hybrid', 'transcript', 'college'],
        ['carnegie']
      ),
      poolItem(
        'r2a-tp3',
        'Teacher Perspectives',
        'Teacher Perspectives Crystal',
        'Teachers want clearer competency targets but appreciate Carnegie structure for scope-and-sequence planning.',
        { learning: 10, scalability: 10 },
        ['structure', 'scope', 'competency'],
        ['carnegie']
      ),
      poolItem(
        'r2a-ar3',
        'Academic Research',
        'Academic Research Crystal',
        'Studies comparing CBE and traditional models find the largest gains when competencies are explicitly defined.',
        { learning: 15, equity: 10 },
        ['cbe', 'competency', 'defined'],
        ['carnegie']
      ),
    ],
    counterEvidencePool: [
      poolItem(
        'r2c-dd1',
        'District Data',
        'District Data Crystal',
        'Universities increasingly accept proficiency-based transcripts with supplementary competency records.',
        { equity: 15, scalability: 10 },
        ['college', 'transcript', 'employer'],
        ['mastery']
      ),
      poolItem(
        'r2c-tp1',
        'Teacher Perspectives',
        'Teacher Perspectives Crystal',
        'Counselors report hybrid transcripts reduce admissions friction while showcasing deeper learning evidence.',
        { learning: 15, equity: 10 },
        ['counselor', 'admissions', 'transcript'],
        ['mastery']
      ),
      poolItem(
        'r2c-ar1',
        'Academic Research',
        'Academic Research Crystal',
        'Admissions research shows holistic review weights demonstrated competencies when clearly documented.',
        { equity: 20 },
        ['admissions', 'holistic', 'competency'],
        ['mastery']
      ),
      poolItem(
        'r2c-dd2',
        'District Data',
        'District Data Crystal',
        'Tiered support blocks within Carnegie schedules catch struggling students before they fall a full year behind.',
        { equity: 20, learning: 10 },
        ['struggling', 'behind', 'support', 'pacing'],
        ['carnegie']
      ),
      poolItem(
        'r2c-tp2',
        'Teacher Perspectives',
        'Teacher Perspectives Crystal',
        'Teachers use within-unit differentiation so advanced students deepen while others master foundations.',
        { learning: 15, equity: 15 },
        ['differentiation', 'advanced', 'pace'],
        ['carnegie']
      ),
      poolItem(
        'r2c-ar2',
        'Academic Research',
        'Academic Research Crystal',
        'Mastery learning within fixed courses (unit recovery) prevents unlimited pacing drift.',
        { scalability: 15, learning: 10 },
        ['unit', 'recovery', 'guardrail'],
        ['carnegie']
      ),
    ],
  },
  {
    round: 3,
    opponentChallengeBySide: {
      mastery:
        'Parents and colleges don\'t understand competency transcripts. You\'re setting students up for confusion.',
      carnegie:
        'Pure seat-time rewards attendance over achievement. Gifted students are bored; struggling students are passed along.',
    },
    opponentCounterBySide: {
      mastery:
        'Implementation costs — new platforms, training, rubrics — are prohibitive for under-resourced schools.',
      carnegie:
        'Carnegie Units are the lingua franca of American education. Replacing them isolates your students.',
    },
    opponentCounterStrength: 15,
    suggestedSearches: SUGGESTED_SEARCHES,
    attackEvidencePool: [
      poolItem(
        'r3a-dd1',
        'District Data',
        'District Data Crystal',
        'Parent communication portals with plain-language competency progress reports improved buy-in in pilot districts.',
        { equity: 15, engagement: 15 },
        ['parent', 'transcript', 'confusion', 'college'],
        ['mastery']
      ),
      poolItem(
        'r3a-tp1',
        'Teacher Perspectives',
        'Teacher Perspectives Crystal',
        'Teachers find that student-led conferences with competency portfolios help families understand progress.',
        { engagement: 20, equity: 10 },
        ['portfolio', 'conference', 'parent'],
        ['mastery']
      ),
      poolItem(
        'r3a-ar1',
        'Academic Research',
        'Academic Research Crystal',
        'Studies show competency records improve clarity about what students actually know versus grades alone.',
        { learning: 20, equity: 10 },
        ['competency', 'clarity', 'achievement'],
        ['mastery']
      ),
      poolItem(
        'r3a-dd2',
        'District Data',
        'District Data Crystal',
        'Dual-reporting (credits + competencies) satisfies both college admissions and state accountability systems.',
        { scalability: 15, equity: 10 },
        ['dual', 'reporting', 'admissions'],
        ['mastery']
      ),
      poolItem(
        'r3a-tp2',
        'Teacher Perspectives',
        'Teacher Perspectives Crystal',
        'Teachers observe that pure seat-time pacing leaves advanced students disengaged without enrichment paths.',
        { engagement: 20, learning: 10 },
        ['bored', 'gifted', 'attendance', 'achievement'],
        ['carnegie']
      ),
      poolItem(
        'r3a-ar2',
        'Academic Research',
        'Academic Research Crystal',
        'Research on social promotion shows seat-time advancement without demonstrated skills harms long-term outcomes.',
        { learning: 20, equity: 15 },
        ['social promotion', 'seat-time', 'passed'],
        ['carnegie']
      ),
      poolItem(
        'r3a-dd3',
        'District Data',
        'District Data Crystal',
        'States with longstanding Carnegie frameworks show consistent college enrollment — familiarity has value.',
        { scalability: 20 },
        ['lingua franca', 'american', 'enrollment'],
        ['carnegie']
      ),
      poolItem(
        'r3a-tp3',
        'Teacher Perspectives',
        'Teacher Perspectives Crystal',
        'Teachers value Carnegie clarity for transfer students — credits move cleanly between schools.',
        { equity: 15, scalability: 15 },
        ['transfer', 'credit', 'familiar'],
        ['carnegie']
      ),
      poolItem(
        'r3a-ar3',
        'Academic Research',
        'Academic Research Crystal',
        'Comparative studies suggest hybrid models capture benefits of both structure and demonstrated mastery.',
        { learning: 15, scalability: 15, equity: 10 },
        ['hybrid', 'structure', 'mastery'],
        ['carnegie']
      ),
    ],
    counterEvidencePool: [
      poolItem(
        'r3c-dd1',
        'District Data',
        'District Data Crystal',
        'Phased rollouts using open-source rubric libraries reduced implementation costs for rural districts.',
        { scalability: 20, equity: 10 },
        ['cost', 'platform', 'training', 'under-resourced'],
        ['mastery']
      ),
      poolItem(
        'r3c-tp1',
        'Teacher Perspectives',
        'Teacher Perspectives Crystal',
        'Teachers in under-resourced schools report that shared district rubric banks minimize redundant work.',
        { scalability: 15 },
        ['rubric', 'resource', 'training'],
        ['mastery']
      ),
      poolItem(
        'r3c-ar1',
        'Academic Research',
        'Academic Research Crystal',
        'Cost-benefit analyses show mastery systems pay off when they reduce remediation and course repeats.',
        { learning: 15, scalability: 15 },
        ['cost', 'benefit', 'remediation'],
        ['mastery']
      ),
      poolItem(
        'r3c-dd2',
        'District Data',
        'District Data Crystal',
        'Interstate compacts on credit recognition keep Carnegie students mobile across state lines.',
        { scalability: 20, equity: 10 },
        ['interstate', 'credit', 'recognition', 'isolates'],
        ['carnegie']
      ),
      poolItem(
        'r3c-tp2',
        'Teacher Perspectives',
        'Teacher Perspectives Crystal',
        'Teachers note that adding competency badges to existing transcripts preserves familiarity while showing depth.',
        { learning: 15, equity: 10 },
        ['badge', 'transcript', 'familiar'],
        ['carnegie']
      ),
      poolItem(
        'r3c-ar2',
        'Academic Research',
        'Academic Research Crystal',
        'Policy research advocates evolutionary reform — layering competencies onto Carnegie rather than replacing overnight.',
        { scalability: 15, learning: 15, equity: 10 },
        ['reform', 'layer', 'evolutionary'],
        ['carnegie']
      ),
    ],
  },
];

export function getOpponentChallenge(round, playerSide) {
  return round.opponentChallengeBySide[playerSide] || round.opponentChallengeBySide.mastery;
}

export function getOpponentCounter(round, playerSide) {
  return round.opponentCounterBySide[playerSide] || round.opponentCounterBySide.mastery;
}

export function getEvidencePool(round, exchangePhase) {
  return exchangePhase === 'counter' ? round.counterEvidencePool : round.attackEvidencePool;
}

const SEARCH_PROMPT_TOPICS = {
  0: {
    attack: {
      mastery: 'mastery learning scalability in large school districts',
      carnegie: 'Carnegie Units ensuring equal instructional exposure for all students',
    },
    counter: {
      mastery: 'managing teacher workload in mastery learning systems',
      carnegie: 'verifying real learning within seat-time credit structures',
    },
  },
  1: {
    attack: {
      mastery: 'scheduling and scaling mastery learning when students move at different paces',
      carnegie: 'evolving beyond seat-time toward demonstrated skills',
    },
    counter: {
      mastery: 'college and employer acceptance of competency-based transcripts',
      carnegie: 'preventing struggling students from falling behind with pacing guardrails',
    },
  },
  2: {
    attack: {
      mastery: 'helping parents and colleges understand competency-based progress',
      carnegie: 'addressing boredom and social promotion under pure seat-time models',
    },
    counter: {
      mastery: 'implementation costs of mastery systems in under-resourced schools',
      carnegie: 'preserving Carnegie Units as a recognized standard while adding depth',
    },
  },
};

const CATEGORY_PROMPT_PREFIX = {
  'District Data': 'What district data supports',
  'Teacher Perspectives': 'What do teachers say about',
  'Academic Research': 'What academic research supports',
};

export function getSuggestedSearchPrompt(roundIndex, playerSide, category, exchangePhase = 'attack') {
  const topic =
    SEARCH_PROMPT_TOPICS[roundIndex]?.[exchangePhase]?.[playerSide] ?? 'your position';
  const prefix = CATEGORY_PROMPT_PREFIX[category] ?? 'What evidence supports';
  return `${prefix} ${topic}?`;
}
