const categoryRows = [
  { key: 'fridayNight', label: 'Friday night' },
  { key: 'saturdayMorning', label: 'Saturday morning' },
  { key: 'saturdayLunch', label: 'Saturday lunch' },
  { key: 'saturdayDrinks', label: 'Saturday drinks' },
  { key: 'saturdayNight', label: 'Saturday night' },
  { key: 'sundayRecovery', label: 'Sunday recovery' }
];

function getTopChoices(categoryTally = {}) {
  const entries = Object.entries(categoryTally);
  if (!entries.length) return [];

  const highest = Math.max(...entries.map(([, count]) => count));
  return entries.filter(([, count]) => count === highest).map(([id, count]) => ({ id, count }));
}

export default function ResultsCard({ data, loading, optionLookup = {} }) {
  if (loading) {
    return (
      <aside className="results-card loading">
        <h3>Current standings</h3>
        <p className="skeleton-line" />
        <p className="skeleton-line short" />
        <p className="skeleton-line" />
      </aside>
    );
  }

  if (!data || !data.voterCount) {
    return (
      <aside className="results-card">
        <h3>Current standings</h3>
        <p>No votes yet. Be the first to ruin the plan.</p>
      </aside>
    );
  }

  return (
    <aside className="results-card">
      <h3>{data.voterCount} votes in</h3>
      <div className="voter-chip-wrap">
        {data.voterNames?.map((name) => (
          <span key={name} className="voter-chip">
            {name}
          </span>
        ))}
      </div>

      <div className="results-list">
        {categoryRows.map((category) => {
          const winners = getTopChoices(data.tally?.[category.key]);

          return (
            <article key={category.key} className="result-row">
              <p className="result-label">{category.label}</p>
              {!winners.length ? (
                <p className="result-empty">No picks yet</p>
              ) : (
                winners.map((winner) => (
                  <p key={winner.id} className="result-item">
                    {optionLookup[winner.id] || winner.id}
                    <strong>{winner.count}</strong>
                  </p>
                ))
              )}
            </article>
          );
        })}
      </div>
    </aside>
  );
}
