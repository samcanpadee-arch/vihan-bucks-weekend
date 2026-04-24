import Link from 'next/link';

const tabs = [
  { href: '/', label: 'Vote', icon: 'how_to_vote' },
  { href: '/itinerary', label: 'Itinerary', icon: 'event_note' }
];

export default function TopNav({ activeHref }) {
  return (
    <>
      <header className="top-app-bar">
        <div className="top-app-inner">
          <h1>Bucks '26</h1>
          <nav>
            {tabs.map((tab) => (
              <Link key={tab.href} href={tab.href} className={activeHref === tab.href ? 'active' : ''}>
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <nav className="mobile-bottom-nav" aria-label="Primary">
        {tabs.map((tab) => (
          <Link key={tab.href} href={tab.href} className={activeHref === tab.href ? 'active' : ''}>
            <span className="material-symbols-outlined">{tab.icon}</span>
            <span>{tab.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
