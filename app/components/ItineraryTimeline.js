export default function ItineraryTimeline({ timeline }) {
  return (
    <div className="timeline-wrap">
      {timeline.map((day) => (
        <section key={day.day} className="timeline-day">
          <h3>{day.day}</h3>
          {day.entries.map((entry) => (
            <article
              key={`${day.day}-${entry.time}`}
              className={`timeline-entry ${entry.status === 'pending' ? 'is-tbc' : 'is-set'}`}
            >
              <div>
                <p className="time">{entry.time}</p>
                <p className="title">{entry.title}</p>
                <p className="note">{entry.note}</p>
              </div>
              <span className="timeline-status">
                {entry.status === 'set' ? (
                  <>
                    <span className="material-symbols-outlined">check_circle</span>
                    Confirmed
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">schedule</span>
                    Pending votes
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
