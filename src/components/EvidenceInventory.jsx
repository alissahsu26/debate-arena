import { CATEGORY_COLORS, CATEGORY_SHORT } from '../data/crystalStyles';

export default function EvidenceInventory({
  inventory,
  materializedIds,
  inspectedIds,
  failedIds = [],
  onMaterialize,
  canMaterialize = true,
  quizLocked = false,
}) {
  if (inventory.length === 0) return null;

  const hint = !canMaterialize
    ? 'Evidence collected — press Begin Fight when you are set.'
    : quizLocked
      ? 'Finish the quiz before deploying another crystal.'
      : materializedIds.length === 0
        ? 'Choose an item to deploy a crystal and complete the argument.'
        : `${inspectedIds.length} confirmed — deploy more or launch your argument.`;

  return (
    <div className="evidence-inventory">
      <div className="rpg-box evidence-inventory-box">
        <div className="evidence-inventory-header">
          <span className="rpg-heading evidence-inventory-title">Items</span>
          <span className="evidence-inventory-count">×{inventory.length}</span>
        </div>
        <div className="evidence-inventory-slots">
          {inventory.map((item) => {
            const materialized = materializedIds.includes(item.id);
            const confirmed = inspectedIds.includes(item.id);
            const failed = failedIds.includes(item.id);
            const color = CATEGORY_COLORS[item.category] || '#58D8F8';
            const disabled =
              !canMaterialize || materialized || failed || (quizLocked && !materialized);

            return (
              <button
                key={item.id}
                type="button"
                className={`inventory-slot ${materialized ? 'materialized' : ''} ${confirmed ? 'inspected' : ''} ${failed ? 'failed' : ''} ${!canMaterialize ? 'locked' : ''}`}
                style={{ '--slot-color': color }}
                disabled={disabled}
                onClick={() => onMaterialize(item.id)}
                title={
                  failed
                    ? `${item.label} — crystal shattered`
                    : !canMaterialize
                      ? `${item.label} — deploy in battle`
                      : confirmed
                        ? `${item.label} — confirmed`
                        : materialized
                          ? `${item.label} — quiz in progress`
                          : `Click to deploy ${item.label}`
                }
              >
                {!disabled && canMaterialize && (
                  <span className="inventory-slot-cursor" aria-hidden="true">▶</span>
                )}
                <span className="inventory-slot-icon">
                  <span className="inventory-slot-gem" />
                  <span className="inventory-slot-shine" aria-hidden="true" />
                </span>
                <span className="inventory-slot-label">
                  {CATEGORY_SHORT[item.category] || item.category}
                </span>
                {canMaterialize && materialized && !confirmed && !failed && (
                  <span className="inventory-slot-badge">?</span>
                )}
                {confirmed && <span className="inventory-slot-badge inspected">OK</span>}
                {failed && <span className="inventory-slot-badge failed">X</span>}
              </button>
            );
          })}
        </div>
        <p className="rpg-hint evidence-inventory-hint">{hint}</p>
      </div>
    </div>
  );
}
