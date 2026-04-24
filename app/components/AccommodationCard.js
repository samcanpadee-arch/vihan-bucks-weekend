export default function AccommodationCard({ accommodation }) {
  return (
    <article className="accommodation-card">
      {accommodation.image ? (
        <div className="accommodation-image-wrap">
          <img src={accommodation.image} alt={accommodation.imageAlt || accommodation.name} className="accommodation-image" />
        </div>
      ) : null}
      <p className="section-label">{accommodation.label}</p>
      <div className="accommodation-row">
        <h3>{accommodation.name}</h3>
        <a href={accommodation.link} target="_blank" rel="noreferrer">
          {accommodation.linkLabel}
        </a>
      </div>
      <p className="status">{accommodation.status}</p>
      {accommodation.description ? <p className="accommodation-description">{accommodation.description}</p> : null}
      <div className="meta-grid">
        <div>
          <p>Dates</p>
          <strong>{accommodation.dates}</strong>
        </div>
        <div>
          <p>Address</p>
          <strong>{accommodation.address}</strong>
        </div>
      </div>
      <p className="hint">{accommodation.note}</p>
    </article>
  );
}
