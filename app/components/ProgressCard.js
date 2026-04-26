const sectionOrder = [
  ['name', 'Name', 'person'],
  ['fridayNight', 'Friday night', 'nightlife'],
  ['saturdayMorning', 'Saturday morning', 'wb_sunny'],
  ['saturdayLunch', 'Saturday lunch', 'restaurant'],
  ['saturdayDrinks', 'Saturday drinks', 'liquor'],
  ['saturdayNight', 'Saturday night', 'local_bar'],
  ['sundayRecovery', 'Sunday', 'coffee']
];

export default function ProgressCard({ form, votingSections = [], submitAttempted, requiredKeys = [], onJumpToSection }) {
  const missingSet = new Set(requiredKeys.filter((key) => !form[key]));
  const trimLabel = (text = '') => {
    const clean = text.trim();
    if (!clean) return '';
    return clean.length > 20 ? `${clean.slice(0, 20)}…` : clean;
  };

  const getSelectionLabel = (key) => {
    if (key === 'name') return trimLabel(form.name || '');

    const selectedId = form[key];
    if (!selectedId) return '';

    if (selectedId === 'other') {
      const otherValue = form[`${key}Other`] || '';
      return trimLabel(otherValue) || 'Something else';
    }

    const section = votingSections.find((item) => item.key === key);
    const optionTitle = section?.options?.find((option) => option.id === selectedId)?.title || selectedId;
    return trimLabel(optionTitle);
  };

  const checks = sectionOrder.map(([key, label, icon]) => ({
    key,
    label,
    icon,
    done: Boolean(form[key]),
    selectionLabel: getSelectionLabel(key),
    isMissing: submitAttempted && missingSet.has(key)
  }));

  return (
    <>
      <aside className="progress-card">
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
              <span className={`progress-selection ${item.done ? 'is-done' : 'is-empty'}`}>
                <span className="material-symbols-outlined">{item.done ? 'check_circle' : 'remove'}</span>
                <small>{item.done ? item.selectionLabel : 'not picked yet'}</small>
              </span>
            </li>
          ))}
        </ul>
      </aside>

      <aside className="cheeky-tooltip">
        <p>&ldquo;No vote means no complaints rights. Those are the terms.&rdquo;</p>
      </aside>
    </>
  );
}
