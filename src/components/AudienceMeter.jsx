import { audienceMarkerPercent, clampAudienceScore } from '../services/audienceMeter';

const SEGMENT_COUNT = 20;

function getSegmentClass(index) {
  if (index < 9) return 'carnegie';
  if (index > 10) return 'mastery';
  return 'neutral';
}

export default function AudienceMeter({ score = 0 }) {
  const clamped = clampAudienceScore(score);
  const markerLeft = audienceMarkerPercent(clamped);

  return (
    <div className="rpg-box audience-meter">
      <div className="audience-meter-header">
        <span className="rpg-heading audience-meter-title">Audience</span>
        <span
          className={`audience-meter-score ${
            clamped > 0 ? 'audience-meter-score--mastery' : clamped < 0 ? 'audience-meter-score--carnegie' : ''
          }`}
        >
          {clamped > 0 ? `+${clamped}` : clamped}
        </span>
      </div>

      <div className="audience-meter-bar-row">
        <span className="audience-meter-end-label audience-meter-end-label--carnegie">◀ CU</span>
        <div className="audience-meter-track">
          <div className="audience-meter-fill" aria-hidden="true">
            {Array.from({ length: SEGMENT_COUNT }, (_, i) => (
              <span
                key={i}
                className={`audience-meter-segment audience-meter-segment--${getSegmentClass(i)}`}
              />
            ))}
          </div>
          <div className="audience-meter-center" aria-hidden="true" />
          <div
            className="audience-meter-marker"
            style={{ left: `${markerLeft}%` }}
            aria-hidden="true"
          >
            <span className="audience-meter-cursor">▼</span>
          </div>
        </div>
        <span className="audience-meter-end-label audience-meter-end-label--mastery">ML ▶</span>
      </div>
    </div>
  );
}
