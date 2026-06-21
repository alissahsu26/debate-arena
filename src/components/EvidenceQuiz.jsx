import { CATEGORY_COLORS } from '../data/crystalStyles';

export default function EvidenceQuiz({ quiz, evidenceLabel, crystalCategory, onAnswer, answered, onDismiss }) {
  if (!quiz) return null;

  const crystalColor = CATEGORY_COLORS[crystalCategory] || '#58D8F8';

  return (
    <div
      className={`evidence-quiz-overlay${answered && !answered.correct ? ' evidence-quiz-overlay--failed' : ''}`}
    >
      <div className="rpg-box evidence-quiz-box">
        <p className="rpg-heading">Complete the argument</p>
        {evidenceLabel && !answered && (
          <p className="evidence-quiz-crystal-label">
            <span className="crystal-ui-gem" style={{ background: crystalColor }} aria-hidden="true">
              <span className="crystal-ui-shine" />
            </span>
            {evidenceLabel} materialized!
          </p>
        )}
        <p className="evidence-quiz-prompt">{quiz.prompt}</p>
        <div className="evidence-quiz-options">
          {quiz.options.map((option) => {
            let className = 'evidence-quiz-option';
            if (answered) {
              if (option.correct) className += ' correct';
              else if (answered.selectedId === option.id) className += ' wrong';
              else className += ' dimmed';
            }

            return (
              <button
                key={option.id}
                type="button"
                className={className}
                disabled={Boolean(answered)}
                onClick={() => onAnswer(option.id)}
              >
                <span className="evidence-quiz-option-id">{option.id}.</span>
                <span className="evidence-quiz-option-text">{option.text}</span>
                {answered && option.correct && (
                  <span className="evidence-quiz-check" aria-hidden="true">✓</span>
                )}
              </button>
            );
          })}
        </div>
        {answered?.correct && (
          <>
            <p className="evidence-quiz-result success">
              Correct! This crystal is ready to launch.
            </p>
            <button type="button" className="rpg-suggest-btn build-ready-btn" onClick={onDismiss}>
              Continue
            </button>
          </>
        )}
      </div>

      {answered && !answered.correct && (
        <aside className="evidence-quiz-fail-popup rpg-box" role="alert" aria-live="assertive">
          <p className="evidence-quiz-fail-icon" aria-hidden="true">
            ✕
          </p>
          <p className="rpg-heading evidence-quiz-fail-title">Crystal shattered!</p>
          <p className="rpg-body evidence-quiz-fail-message">
            Wrong! The crystal shatters — you cannot use this evidence.
          </p>
          <button type="button" className="rpg-suggest-btn rpg-action-btn evidence-quiz-fail-btn" onClick={onDismiss}>
            Continue
          </button>
        </aside>
      )}
    </div>
  );
}
