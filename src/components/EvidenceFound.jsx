import { CATEGORY_COLORS } from '../data/crystalStyles';

export default function EvidenceFound({ evidence, searchNumber, maxSearches, onDismiss }) {
  if (!evidence) return null;

  const crystalColor = CATEGORY_COLORS[evidence.category] || '#58D8F8';

  return (
    <div className="evidence-found-overlay">
      <div className="rpg-box evidence-found-box">
        <p className="rpg-heading">Item found!</p>
        <p className="evidence-found-label">
          <span className="crystal-ui-gem" style={{ background: crystalColor }} aria-hidden="true">
            <span className="crystal-ui-shine" />
          </span>
          {evidence.label}
        </p>
        <p className="evidence-found-category">{evidence.category}</p>
        <p className="evidence-found-insight">{evidence.insight}</p>
        <p className="rpg-hint">
          Added to your inventory ({searchNumber}/{maxSearches} searches used).
        </p>
        <button type="button" className="rpg-suggest-btn build-ready-btn" onClick={onDismiss}>
          Continue
        </button>
      </div>
    </div>
  );
}
