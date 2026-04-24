import Chip from './Chip';

export default function OptionCard({ option, isSelected, onSelect }) {
  return (
    <button type="button" className={`option-card ${isSelected ? 'selected' : ''}`} onClick={onSelect}>
      {option.image ? (
        <div className="option-image-wrap">
          <img src={option.image} alt={option.title} className="option-image" />
        </div>
      ) : null}

      <div className="option-meta">
        {option.meta?.map((item) => (
          <Chip key={item}>{item}</Chip>
        ))}
      </div>

      <div className="option-copy">
        <h3>{option.title}</h3>
        <p>{option.description}</p>
      </div>

      {option.link ? (
        <a
          className="option-link"
          href={option.link}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          View details <span className="material-symbols-outlined">open_in_new</span>
        </a>
      ) : null}

      <div className="option-vibe">{option.vibe ? <Chip tone="accent">{option.vibe}</Chip> : null}</div>
    </button>
  );
}
