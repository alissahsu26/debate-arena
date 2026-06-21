export default function BattleStage({
  inspectedCount,
  inventoryCount,
  activeQuiz,
  onAdvance,
}) {
  const canLaunch = inspectedCount >= 1 && !activeQuiz;

  return (
    <div className="battle-stage">
      <div className="rpg-box battle-stage-box">
        <p className="rpg-heading">Battle</p>
        <p className="rpg-body">
          Select evidence from your inventory — a crystal materializes and you must complete the argument.
        </p>
        <p className="rpg-hint">
          {activeQuiz
            ? 'Answer the quiz to confirm your crystal.'
            : inspectedCount > 0
              ? `${inspectedCount} crystal${inspectedCount === 1 ? '' : 's'} ready — launch your attack or deploy more.`
              : inventoryCount > 0
                ? 'Click an inventory slot below to deploy a crystal and take the quiz.'
                : 'No evidence in inventory.'}
        </p>
        {canLaunch && (
          <button type="button" className="rpg-suggest-btn build-launch-btn" onClick={onAdvance}>
            Launch Attack ▶
          </button>
        )}
      </div>
    </div>
  );
}
