const sectionOrder = [
  ['name', 'Name', 'person'],
  ['fridayNight', 'Friday night', 'nightlife'],
  ['saturdayMorning', 'Saturday morning', 'wb_sunny'],
  ['saturdayLunch', 'Saturday lunch', 'restaurant'],
  ['saturdayDrinks', 'Saturday drinks', 'liquor'],
  ['saturdayNight', 'Saturday night', 'local_bar'],
  ['sundayRecovery', 'Sunday', 'coffee']
];

const avatar =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD3f4LbRPoFAx-yQgAMfeIZ3wIR5tR_OXhMsZwg0Jvl78UjKv5_U9TZ02NpoeLC-CWrmmugsyfb8cbOdLPkVYZbOvTNO10m0r6AZJoKgXbJ-_oBpdwquAbV3n9gQSoWAYbUSewRs3VMLfZTbISLmaT5nlUiPNQuckylv47jpJUNllNmPiGOiQeEHWJ_wzo1i1UOTQzkBh9YTzPd6ab8QABjaKxup2UZYcrEVvncsOEmAM0CBi5LLRstQFYwuRaZnIoFuiPOTnTKwSE';

export default function ProgressCard({ form, submitAttempted, requiredKeys = [], onJumpToSection }) {
  const missingSet = new Set(requiredKeys.filter((key) => !form[key]));

  const checks = sectionOrder.map(([key, label, icon]) => ({
    key,
    label,
    icon,
    done: Boolean(form[key]),
    isMissing: submitAttempted && missingSet.has(key)
  }));

  return (
    <>
      <aside className="progress-card">
        <div className="profile-row">
          <img src={avatar} alt="Vihan" className="profile-avatar" />
          <div>
            <h3>Voting progress</h3>
            <p>Finalize the scheme</p>
          </div>
        </div>

        <ul>
          {checks.map((item) => (
            <li
              key={item.key}
              className={`${item.done ? 'is-done' : ''} ${item.isMissing ? 'is-missing' : ''}`.trim()}
              onClick={() => onJumpToSection?.(item.key)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onJumpToSection?.(item.key);
                }
              }}
            >
              <span className="progress-label">
                <span className="material-symbols-outlined">{item.icon}</span>
                {item.label}
              </span>
              <strong>
                <span className="material-symbols-outlined">{item.done ? 'check_circle' : 'remove'}</span>
              </strong>
            </li>
          ))}
        </ul>

        <button type="button" className="progress-submit-btn" onClick={() => onJumpToSection?.('name')}>
          Jump to vote form
        </button>
        <p className="fine-print">Costs are indicative only. This is not a checkout.</p>
      </aside>

      <aside className="cheeky-tooltip">
        <p>“Choosing nothing? That&apos;s how we end up eating lukewarm Maccas in the car park.”</p>
      </aside>
    </>
  );
}
