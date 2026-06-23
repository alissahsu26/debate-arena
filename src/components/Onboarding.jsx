import { useEffect, useRef, useState } from 'react';
import { CHARACTERS } from '../data/debateRounds';
import { QUIZ_QUESTIONS } from '../data/onboardingQuiz';
import { fetchOnboardingQuestion } from '../services/onboardingQuestion';

const CHAMPIONS = {
  mastery: {
    ...CHARACTERS.mastery,
    title: 'Mastery Lizard Wizard',
    art: '/images/onboarding/wizard-art.png',
    theme: 'mastery',
  },
  carnegie: {
    ...CHARACTERS.carnegie,
    title: 'Cat Scholar',
    art: '/images/onboarding/scholar-art.png',
    theme: 'carnegie',
  },
};

const TOTAL_QUESTIONS = QUIZ_QUESTIONS.length;

function ChampionCard({ champion, side, selected, onSelect }) {
  const isSelected = selected === side;

  return (
    <button
      type="button"
      className={`champion-card champion-card--${champion.theme} ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(side)}
      aria-pressed={isSelected}
    >
      <h2 className="champion-card-title">{champion.title}</h2>
      <div className="champion-card-art">
        <img src={champion.art} alt="" draggable={false} />
      </div>
      <div className="champion-card-info">
        <h3 className="champion-card-side">{champion.side}</h3>
        <p className="champion-card-desc">{champion.description}</p>
      </div>
    </button>
  );
}

function priorAnswersUpTo(answers, uptoStep) {
  const list = [];
  for (let s = 1; s <= uptoStep; s += 1) {
    const a = answers[s];
    if (a) list.push({ question: a.question, optionLabel: a.optionLabel });
  }
  return list;
}

export default function Onboarding({ onSelectSide }) {
  const [selected, setSelected] = useState(null);
  const [step, setStep] = useState(0); // 0 = champion select; 1..TOTAL_QUESTIONS = quiz
  const [answers, setAnswers] = useState({}); // step -> {question, optionId, optionLabel}
  const [questions, setQuestions] = useState({}); // step -> {question, options} (fetched or fallback)
  const inFlightRef = useRef(new Set());
  // Question 1 doesn't depend on any answer, so both sides' versions can be
  // requested the instant this screen mounts — long before the player has
  // picked a champion and clicked "Continue" — so it's ready with no wait.
  const question1PreloadRef = useRef({ mastery: null, carnegie: null });

  useEffect(() => {
    for (const side of ['mastery', 'carnegie']) {
      question1PreloadRef.current[side] = fetchOnboardingQuestion({
        side,
        questionNumber: 1,
        priorAnswers: [],
      }).then((result) => result ?? QUIZ_QUESTIONS[0]);
    }
  }, []);

  const ensureQuestionLoaded = (stepNum, priorAnswers) => {
    if (stepNum < 1 || stepNum > TOTAL_QUESTIONS) return;
    if (questions[stepNum] || inFlightRef.current.has(stepNum)) return;
    inFlightRef.current.add(stepNum);

    const pending =
      stepNum === 1 && question1PreloadRef.current[selected]
        ? question1PreloadRef.current[selected]
        : fetchOnboardingQuestion({ side: selected, questionNumber: stepNum, priorAnswers });

    pending.then((result) => {
      inFlightRef.current.delete(stepNum);
      setQuestions((prev) =>
        prev[stepNum] ? prev : { ...prev, [stepNum]: result ?? QUIZ_QUESTIONS[stepNum - 1] }
      );
    });
  };

  useEffect(() => {
    if (step < 1 || step > TOTAL_QUESTIONS) return;
    ensureQuestionLoaded(step, priorAnswersUpTo(answers, step - 1));
    // Forward-only flow: only re-run when the displayed step changes. `answers`
    // up to step-1 are already final by the time `step` advances, and
    // ensureQuestionLoaded's own cached/in-flight checks make this idempotent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const currentQuestion = step >= 1 ? questions[step] : null;
  const currentAnswer = step >= 1 ? answers[step] : null;

  const handleSelectOption = (optionId) => {
    const option = currentQuestion.options.find((o) => o.id === optionId);
    const finalized = { question: currentQuestion.question, optionId, optionLabel: option?.label };
    const updatedAnswers = { ...answers, [step]: finalized };
    setAnswers(updatedAnswers);

    if (step < TOTAL_QUESTIONS) {
      ensureQuestionLoaded(step + 1, priorAnswersUpTo(updatedAnswers, step));
    }
  };

  const handleContinue = () => {
    if (step === 0) {
      if (!selected) return;
      setStep(1);
      return;
    }

    if (step < TOTAL_QUESTIONS) {
      setStep(step + 1);
      return;
    }

    const finalAnswers = priorAnswersUpTo(answers, TOTAL_QUESTIONS);
    onSelectSide(selected, { answers: finalAnswers });
  };

  if (step === 0) {
    return (
      <div className="onboarding">
        <header className="onboarding-header">
          <h1 className="onboarding-title">Choose Your Side</h1>
          <p className="onboarding-subtitle">Pick a side to defend</p>
        </header>

        <div className="onboarding-arena">
          <div className="champion-cards">
            <ChampionCard
              champion={CHAMPIONS.mastery}
              side="mastery"
              selected={selected}
              onSelect={setSelected}
            />
            <ChampionCard
              champion={CHAMPIONS.carnegie}
              side="carnegie"
              selected={selected}
              onSelect={setSelected}
            />
          </div>
        </div>

        <footer className="onboarding-footer">
          <button
            type="button"
            className="onboarding-confirm"
            disabled={!selected}
            onClick={handleContinue}
          >
            <span className="onboarding-arrow onboarding-arrow--left" aria-hidden="true">
              ◀
            </span>
            <span>{selected ? 'Continue' : 'Select Your Champion'}</span>
            <span className="onboarding-arrow onboarding-arrow--right" aria-hidden="true">
              ▶
            </span>
          </button>
        </footer>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="onboarding">
        <header className="onboarding-header">
          <p className="quiz-progress">
            Question {step} of {TOTAL_QUESTIONS}
          </p>
        </header>
        <p className="rpg-hint">Preparing your next question...</p>
      </div>
    );
  }

  return (
    <div className="onboarding">
      <header className="onboarding-header">
        <p className="quiz-progress">
          Question {step} of {TOTAL_QUESTIONS}
        </p>
        <h1 className="onboarding-title quiz-question-title">{currentQuestion.question}</h1>
      </header>

      <div className="quiz-options">
        {currentQuestion.options.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`quiz-option ${currentAnswer?.optionId === option.id ? 'selected' : ''}`}
            aria-pressed={currentAnswer?.optionId === option.id}
            onClick={() => handleSelectOption(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <footer className="onboarding-footer">
        <button
          type="button"
          className="onboarding-confirm"
          disabled={!currentAnswer}
          onClick={handleContinue}
        >
          <span className="onboarding-arrow onboarding-arrow--left" aria-hidden="true">
            ◀
          </span>
          <span>{step === TOTAL_QUESTIONS ? 'Enter the Arena' : 'Next'}</span>
          <span className="onboarding-arrow onboarding-arrow--right" aria-hidden="true">
            ▶
          </span>
        </button>
      </footer>
    </div>
  );
}
