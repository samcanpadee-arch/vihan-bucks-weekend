import Link from 'next/link';
import { useEffect, useState } from 'react';

const tabs = [
  { href: '/', isVote: true, activeHref: '/', label: 'Vote', icon: 'how_to_vote' },
  { href: '/itinerary', activeHref: '/itinerary', label: 'Itinerary', icon: 'event_note' }
];

export default function TopNav({ activeHref }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header className={`top-app-bar ${isScrolled ? 'is-scrolled' : ''}`}>
        <div className="top-app-inner">
          <h1>
            <span className="material-symbols-outlined">eco</span>
            Vihan Bucks Weekend
          </h1>
          <nav className="primary-nav desktop-nav" aria-label="Primary">
            {tabs.map((tab) => (
              tab.isVote ? (
                <a key={tab.href} href={tab.href} className={activeHref === tab.activeHref ? 'active' : ''}>
                  <span className="material-symbols-outlined">{tab.icon}</span>
                  <span>{tab.label}</span>
                </a>
              ) : (
                <Link key={tab.href} href={tab.href} className={activeHref === tab.activeHref ? 'active' : ''}>
                  <span className="material-symbols-outlined">{tab.icon}</span>
                  <span>{tab.label}</span>
                </Link>
              )
            ))}
          </nav>
        </div>
      </header>

      <nav className="mobile-bottom-nav primary-nav" aria-label="Primary">
        {tabs.map((tab) => (
          tab.isVote ? (
            <a key={tab.href} href={tab.href} className={activeHref === tab.activeHref ? 'active' : ''}>
              <span className="material-symbols-outlined">{tab.icon}</span>
              <span>{tab.label}</span>
            </a>
          ) : (
            <Link key={tab.href} href={tab.href} className={activeHref === tab.activeHref ? 'active' : ''}>
              <span className="material-symbols-outlined">{tab.icon}</span>
              <span>{tab.label}</span>
            </Link>
          )
        ))}
      </nav>
    </>
  );
}
