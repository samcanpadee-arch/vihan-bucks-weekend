import { accommodation, bookingStatus, essentialsChecklist, itineraryTimeline } from '../siteData';
import AccommodationCard from '../components/AccommodationCard';
import ItineraryTimeline from '../components/ItineraryTimeline';
import SectionHeader from '../components/SectionHeader';
import TopNav from '../components/TopNav';
import Footer from '../components/Footer';

export default function ItineraryPage() {
  return (
    <main className="page-shell itinerary-shell">
      <TopNav activeHref="/itinerary" />

      <section className="hero-block muted-bg">
        <p className="section-label">Draft - not final yet</p>
        <h2>Final itinerary</h2>
        <p>
          Once the votes are in, this becomes the one link for the weekend. Keep it bookmarked, don&apos;t say I didn&apos;t
          tell you.
        </p>
      </section>

      <section className="itinerary-top-grid">
        <AccommodationCard accommodation={accommodation} />
        <aside className="essentials-card">
          <p className="section-label">Things to bring</p>
          <h3>Weekend essentials</h3>
          <ul>
            {essentialsChecklist.map((item) => (
              <li key={item}>
                <span className="material-symbols-outlined">check_circle</span>
                {item}
              </li>
            ))}
          </ul>
          <p className="fine-print">Pack smart now so Sunday-you doesn&apos;t spiral later.</p>
        </aside>
      </section>

      <section className="vote-section">
        <SectionHeader title="Weekend timeline" label="Timeline" icon="schedule" />
        <ItineraryTimeline timeline={itineraryTimeline} />
      </section>

      <section className="vote-section">
        <SectionHeader title="Bookings & status" label="Admin-ish" icon="event_available" />
        <div className="booking-grid">
          {bookingStatus.map((booking) => (
            <article key={booking.item} className="booking-card">
              <div className="booking-copy">
                <span className="booking-icon material-symbols-outlined">{booking.icon}</span>
                <div>
                  <p>{booking.item}</p>
                  <small>{booking.subtitle}</small>
                </div>
              </div>
              <span className={booking.status === 'Booked' ? 'ok' : 'pending'}>{booking.status}</span>
            </article>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
