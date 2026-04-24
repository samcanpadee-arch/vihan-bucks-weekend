import Link from 'next/link';
import {
  budgetGuide,
  itineraryBlocks,
  optionGroups,
  overviewCards,
  accommodation
} from './siteData';

function Section({ id, title, subtitle, children }) {
  return (
    <section id={id} className="section">
      <div className="section-heading">
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

function OptionCard({ option }) {
  return (
    <article className="option-card">
      <div className="option-top">
        <h4>{option.title}</h4>
        <div className="chips">
          {option.timing ? <span className="chip">{option.timing}</span> : null}
          {option.cost ? <span className="chip chip-accent">{option.cost}</span> : null}
        </div>
      </div>
      {option.location ? <p className="muted">📍 {option.location}</p> : null}
      {option.description ? <p>{option.description}</p> : null}
      {option.notes ? <p className="notes">Watch-out: {option.notes}</p> : null}
      <div className="option-links">
        {option.link ? (
          <a href={option.link} target="_blank" rel="noreferrer" className="btn btn-ghost">
            Open link
          </a>
        ) : null}
        {option.bookingLink ? (
          <a href={option.bookingLink} target="_blank" rel="noreferrer" className="btn btn-ghost">
            Booking link
          </a>
        ) : null}
      </div>
    </article>
  );
}

export default function HomePage() {
  return (
    <main className="container">
      <header className="hero card">
        <p className="eyebrow">Yarra Valley Winter Edition</p>
        <h1>Vihan’s Yarra Valley Bucks Weekend</h1>
        <p className="subtitle">
          26–28 June 2026 · Yarra Glen · A very serious planning website for a deeply unserious weekend.
        </p>
        <p>
          Vote on the rough plan now. Once things are locked in, this becomes the trip hub with the final itinerary,
          accommodation details, booking links, times and notes.
        </p>
        <p className="small">Built because planning manually is painful and procrastination is a powerful drug.</p>
        <div className="hero-actions">
          <a href="#vote" className="btn btn-primary">
            Vote on the plan
          </a>
          <Link href="/itinerary" className="btn btn-accent">
            View itinerary
          </Link>
        </div>
      </header>

      <Section
        id="base-camp"
        title="Base camp"
        subtitle="Accommodation is already booked. This is where everyone eventually needs to end up."
      >
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
          <div className="hero-actions">
            <a href={accommodation.link} target="_blank" rel="noreferrer" className="btn btn-primary">
              Open Airbnb
            </a>
            <button className="btn" disabled>
              Copy address
            </button>
            <button className="btn" disabled>
              Add to maps
            </button>
          </div>
          <p className="small">
            Address and check-in details will be added once confirmed, so nobody has to scroll through old messages
            like an archaeologist.
          </p>
        </article>
      </Section>

      <Section id="overview" title="Overview" subtitle="The rough shape of the weekend.">
        <div className="grid three">
          {overviewCards.map((card) => (
            <article key={card.title} className="card">
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section id="vote" title="Vote on the plan" subtitle="Options are grouped by itinerary block.">
        <article className="card vote-box">
          <h3>Submit your votes</h3>
          <p>Review the options below, then submit your votes using the form. Very advanced technology.</p>
          <div className="hero-actions">
            {/* Paste your Google Form link here */}
            <a href="#" className="btn btn-accent">
              Open voting form
            </a>
          </div>
          <div className="embed-placeholder">Google Form embed goes here.</div>
        </article>

        <div className="grid three">
          {itineraryBlocks.map((block) => (
            <article key={block} className="card">
              <h4>{block}</h4>
            </article>
          ))}
        </div>
      </Section>

      <Section id="options" title="Option cards" subtitle="Review these before casting votes.">
        {optionGroups.map((group) => (
          <div key={group.title} className="group-wrap">
            <h3>{group.title}</h3>
            <div className="grid two">
              {group.options.map((option) => (
                <OptionCard key={option.title} option={option} />
              ))}
            </div>
          </div>
        ))}
      </Section>

      <Section
        id="cost"
        title="Cost guide"
        subtitle="Indicative only. Not a checkout. Not legally binding. Please do not invoice Sam."
      >
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Indicative cost</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {budgetGuide.map((item) => (
                <tr key={item.category}>
                  <td>{item.category}</td>
                  <td>{item.cost}</td>
                  <td>{item.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <footer className="footer">
        <p>Built for Vihan’s bucks weekend. Vote irresponsibly, plan responsibly.</p>
        <p className="small">No refunds because this is not a shop. Please stop clicking things.</p>
      </footer>
    </main>
  );
}
