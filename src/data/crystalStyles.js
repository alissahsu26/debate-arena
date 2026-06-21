export const CATEGORY_COLORS = {
  'District Data': '#6890F0',
  'Teacher Perspectives': '#A040A0',
  'Academic Research': '#F8A020',
};

export const CATEGORY_SHORT = {
  'District Data': 'DATA',
  'Teacher Perspectives': 'TEACH',
  'Academic Research': 'STUDY',
};

export const CRYSTAL_STATE_COLORS = {
  default: '#58D8F8',
  confirmed: '#78C850',
  exploding: '#F85838',
  failed: '#A8A878',
};

export function getCrystalColor(evidence, { confirmed = false, exploding = false } = {}) {
  if (exploding) return CRYSTAL_STATE_COLORS.exploding;
  if (confirmed) return CRYSTAL_STATE_COLORS.confirmed;
  return CATEGORY_COLORS[evidence?.category] || CRYSTAL_STATE_COLORS.default;
}
