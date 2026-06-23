export const QUIZ_QUESTIONS = [
  {
    id: 'connection',
    question: "What's your connection to this topic?",
    options: [
      { id: 'teacher', label: 'Teacher' },
      { id: 'parent', label: 'Parent' },
      { id: 'student', label: 'Student' },
      { id: 'policy', label: 'Education policy / researcher' },
      { id: 'curious', label: 'Just curious' },
    ],
  },
  {
    id: 'motivation',
    question: 'Why do you care about this debate?',
    options: [
      { id: 'learning', label: 'I want students to learn better' },
      { id: 'efficiency', label: 'I want schools to run efficiently' },
      { id: 'fairness', label: 'I want fairness for all students' },
      { id: 'spectator', label: "I'm just here to see who wins" },
    ],
  },
  {
    id: 'evidence',
    question: 'What convinces you most in an argument?',
    options: [
      { id: 'data', label: 'Hard data and statistics' },
      { id: 'stories', label: 'Real stories from teachers/students' },
      { id: 'research', label: 'Expert academic research' },
      { id: 'practical', label: "Whatever's easiest to implement" },
    ],
  },
  {
    id: 'leaning',
    question: 'Before this debate, which side do you lean toward?',
    options: [
      { id: 'mastery', label: 'Mastery Learning' },
      { id: 'carnegie', label: 'Carnegie Units' },
      { id: 'undecided', label: 'Genuinely undecided' },
      { id: 'mixed', label: 'A mix of both' },
    ],
  },
  {
    id: 'worry',
    question: "What's your biggest worry about changing how schools work?",
    options: [
      { id: 'cost', label: 'Cost and logistics' },
      { id: 'equity', label: 'Fairness/equity for struggling students' },
      { id: 'workload', label: 'Teacher workload' },
      { id: 'confusion', label: 'Confusing parents/colleges' },
    ],
  },
];
