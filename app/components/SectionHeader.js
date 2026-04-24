export default function SectionHeader({ label, title, subtitle, icon, hint }) {
  return (
    <div className="section-header">
      <div className="section-header-row">
        {icon ? <span className="material-symbols-outlined section-header-icon">{icon}</span> : null}
        <div>
          {label ? <p className="section-label">{label}</p> : null}
          <h2>{title}</h2>
          {subtitle ? <p className="section-subtitle">{subtitle}</p> : null}
          {hint ? <p className="section-hint">{hint}</p> : null}
        </div>
      </div>
    </div>
  );
}
