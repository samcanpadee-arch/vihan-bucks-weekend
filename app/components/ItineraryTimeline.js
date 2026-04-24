export default function ItineraryTimeline({ timeline }) {
  return (
    <div className="timeline-wrap">
      {timeline.map((day) => (
        <section key={day.day} className="timeline-day">
          <h3>{day.day}</h3>
          {day.entries.map((entry) => (
            <article key={`${day.day}-${entry.time}`} className={`timeline-entry ${entry.status === 'tbc' ? 'is-tbc' : 'is-confirmed'}`}>
              <div>
                <p className="time">{entry.time}</p>
                <p className="title">{entry.title}</p>
                <p className="note">{entry.note}</p>
              </div>
              <span className="timeline-status">
                {entry.status === 'tbc' ? (
                  <>
                    <span className="material-symbols-outlined">hourglass_top</span>
                    TBC
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">check_circle</span>
                    CONFIRMED
                  </>
                )}
              </span>
            </article>
          ))}
        </section>
      ))}
    </div>
  );
}
