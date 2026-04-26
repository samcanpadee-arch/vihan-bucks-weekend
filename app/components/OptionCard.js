export default function OptionCard({ option, isSelected, onSelect, disabled }) {
  const handleKeyDown = (event) => {
    if (disabled) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect();
    }
  };

  return (
    <div
      className={`option-card ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`.trim()}
      onClick={disabled ? undefined : onSelect}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-pressed={isSelected}
    >
      {isSelected ? (
        <div className="option-selected-check" aria-hidden="true">
          <span className="material-symbols-outlined">check_circle</span>
        </div>
      ) : null}

      {option.thumbnail ? (
        <div className="option-thumb">
          <img src={option.thumbnail} alt="" loading="lazy" />
        </div>
      ) : null}

      <div className="option-copy">
        <h3>{option.title}</h3>
        <p>{option.description}</p>
      </div>

      <div className="option-chip-row">
        {option.timeConstraint ? <span className="chip chip-time">{option.timeConstraint}</span> : null}
        {option.cost ? <span className="option-cost-chip">{option.cost}</span> : null}
      </div>

      {option.link ? (
        <a
          className="option-link"
          href={option.link}
          target="_blank"
          rel="noreferrer"
          onClick={(event) => event.stopPropagation()}
        >
          View details <span className="material-symbols-outlined">open_in_new</span>
        </a>
      ) : null}
    </div>
  );
}
