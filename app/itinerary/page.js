import Link from 'next/link';
import { accommodation, finalItinerary, checklist, importantNotes } from '../siteData';

export default function ItineraryPage() {
  return (
    <main className="container">
      <header className="hero card">
        <p className="badge">Draft — not final yet</p>
        <h1>Final itinerary</h1>
        <p className="subtitle">Once votes are in and bookings are locked, this becomes the one link for the weekend.</p>
        <div className="hero-actions">
          <Link href="/" className="btn btn-primary">
            Back to trip hub
          </Link>
        </div>
      </header>

      <section className="section">
        <div className="section-heading">
          <h2>Base camp accommodation</h2>
        </div>
        <article className="card base-camp">
          <h3>{accommodation.name}</h3>
          <ul>
            <li>
              <strong>Status:</strong> {accommodation.status}
            </li>
            <li>
              <strong>Dates:</strong> {accommodation.dates}
            </li>
            <li>
              <strong>Check-in:</strong> {accommodation.checkIn}
            </li>
            <li>
              <strong>Checkout:</strong> {accommodation.checkout}
            </li>
            <li>
              <strong>Address:</strong> {accommodation.address}
            </li>
          </ul>
          <a href={accommodation.link} target="_blank" rel="noreferrer" className="btn btn-primary">
            Open Airbnb
          </a>
        </article>
      </section>

      <section className="section">
        <div className="section-heading">
          <h2>Weekend timeline</h2>
        </div>
        <div className="grid three">
          {finalItinerary.map((day) => (
            <article key={day.day} className="card">
              <h3>{day.day}</h3>
              <ul>
                {day.items.map((item) => (
                  <li key={item} className="timeline-item">
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="grid two">
          <article className="card">
            <h3>Things to bring</h3>
            <ul>
              {checklist.map((item) => (
                <li key={item}>☐ {item}</li>
              ))}
            </ul>
          </article>

          <article className="card">
            <h3>Important notes</h3>
            <ul>
              {importantNotes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>
    </main>
  );
}
