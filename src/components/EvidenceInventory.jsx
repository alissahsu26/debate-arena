const CATEGORY_COLORS = {
  'District Data': '#4A90D9',
  'Teacher Perspectives': '#9B59B6',
  'Academic Research': '#FF9800',
};

export default function EvidenceInventory({
  inventory,
  materializedIds,
  inspectedIds,
  onMaterialize,
}) {
  if (inventory.length === 0) return null;

  return (
    <div className="evidence-inventory">
      <div className="evidence-inventory-header">
        <span className="evidence-inventory-title">Evidence Inventory</span>
        <span className="evidence-inventory-count">{inventory.length} found</span>
      </div>
      <div className="evidence-inventory-slots">
        {inventory.map((item) => {
          const materialized = materializedIds.includes(item.id);
          const inspected = inspectedIds.includes(item.id);
          const color = CATEGORY_COLORS[item.category] || '#00E5FF';

          return (
            <button
              key={item.id}
              type="button"
              className={`inventory-slot ${materialized ? 'materialized' : ''} ${inspected ? 'inspected' : ''}`}
              style={{ '--slot-color': color }}
              disabled={materialized}
              onClick={() => onMaterialize(item.id)}
              title={
                inspected
                  ? `${item.label} — inspected`
                  : materialized
                    ? `${item.label} — in arena`
                    : `Click to materialize ${item.label}`
              }
            >
              <span className="inventory-slot-gem" />
              <span className="inventory-slot-label">{item.category}</span>
              {materialized && !inspected && <span className="inventory-slot-badge">◇</span>}
              {inspected && <span className="inventory-slot-badge">✓</span>}
            </button>
          );
        })}
      </div>
      <p className="evidence-inventory-hint">
        {materializedIds.length === 0
          ? 'Click evidence to materialize a crystal in the arena.'
          : `${inspectedIds.length} inspected — click crystals in the arena to read them.`}
      </p>
    </div>
  );
}
