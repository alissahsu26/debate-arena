import { useFollowUp } from '../context/FollowUpContext';

export default function FollowUpTab() {
  const { openFollowUp } = useFollowUp();

  return (
    <button type="button" className="followup-tab" onClick={() => openFollowUp()}>
      Questions?
    </button>
  );
}
