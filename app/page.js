'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { accommodation, votingSections } from './siteData';
import AccommodationCard from './components/AccommodationCard';
import OptionCard from './components/OptionCard';
import ProgressCard from './components/ProgressCard';
import SectionHeader from './components/SectionHeader';
import TopNav from './components/TopNav';
import Footer from './components/Footer';

const initialForm = {
  name: '',
  hardConstraints: '',
  fridayNight: '',
  fridayNightOther: '',
  saturdayMorning: '',
  saturdayMorningOther: '',
  saturdayLunch: '',
  saturdayLunchOther: '',
  saturdayDrinks: '',
  saturdayDrinksOther: '',
  saturdayNight: '',
  saturdayNightOther: '',
  sundayRecovery: '',
  sundayRecoveryOther: ''
};

const howItWorksSteps = [
  {
    number: '01',
    icon: 'how_to_vote',
    heading: 'Vote on the plan',
    body: "Pick your preferences for each part of the weekend. Friday night, Saturday activities, the winery situation. All of it. Takes about two minutes if you're decisive. Longer if you're not."
  },
  {
    number: '02',
    icon: 'check_circle',
    heading: 'Submit once',
    body: 'Hit the button at the bottom. Your vote is saved. You can come back and change it if you have a crisis of confidence, which is expected.'
  },
  {
    number: '03',
    icon: 'event_note',
    heading: 'Check the itinerary page',
    body: "Once the plan is locked in, the itinerary page becomes the one link for the whole weekend. Timings, addresses, what to bring, who owes who. Bookmark it. Or just ask someone in the group chat and waste everyone's time."
  }
];

export default function HomePage() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState('idle');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [votingLocked, setVotingLocked] = useState(false);
  const [voteSummary, setVoteSummary] = useState({ voterCount: 0, voterNames: [] });
  const [shareLabel, setShareLabel] = useState('Share this page');

  const requiredKeys = useMemo(
    () => ['name', 'fridayNight', 'saturdayMorning', 'saturdayLunch', 'saturdayDrinks', 'saturdayNight', 'sundayRecovery'],
    []
  );

  const disableInputs = status === 'success' && !isEditing;

  const selectOption = (key, value) => {
    if (disableInputs) return;
    setForm((prev) => ({ ...prev, [key]: prev[key] === value ? '' : value }));
  };

  const jumpToSection = (key) => {
    const sectionId = key === 'name' ? 'vote-form' : `section-${key}`;
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/admin/config', { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      setVotingLocked(Boolean(data?.votingLocked));
    } catch (configError) {}
  };

  const fetchResults = async () => {
    try {
      const response = await fetch('/api/results', { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      setVoteSummary({
        voterCount: Number(data?.voterCount || 0),
        voterNames: Array.isArray(data?.voterNames) ? data.voterNames : []
      });
    } catch (resultsError) {}
  };

  useEffect(() => {
    const savedVote = localStorage.getItem('bucks-vote-data');
    if (savedVote) {
      try {
        setForm(JSON.parse(savedVote));
      } catch {
        // ignore parse errors
      }
    }

    fetchConfig();
    fetchResults();
  }, []);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Vihan's Yarra Valley Bucks Weekend",
          url: window.location.href
        });
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(window.location.href);
        setShareLabel('Link copied');
        window.setTimeout(() => setShareLabel('Share this page'), 2000);
      }
    } catch (shareError) {}
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitAttempted(true);

    const missing = requiredKeys.filter((key) => !form[key]);
    if (missing.length > 0) {
      setError("You've left some sections blank. We need all of them, even the ones you feel strongly about.");
      jumpToSection(missing[0]);
      return;
    }

    const payload = {
      ...form,
      submittedAt: new Date().toISOString()
    };

    setStatus('loading');
    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Submission failed');
      }

      setStatus('success');
      setIsEditing(false);
      localStorage.setItem('bucks-vote-data', JSON.stringify(form));
    } catch (submitError) {
      console.error(submitError);
      setStatus('idle');
      setError('Something broke. Refresh and try again. Sorry.');
    }
  };

  return (
    <main className="page-shell">
      <TopNav activeHref="/" />

      <div className="layout-grid">
        <div className="content-col">
          <section className="hero-block">
            <p className="section-label">The planning website nobody asked for</p>
            <h2>Vihan&apos;s Yarra Valley Bucks Weekend</h2>
            <p>26–28 June 2026 · Yarra Glen · A very serious planning website for a deeply unserious weekend.</p>
            <p>Vote on the rough plan now. Once things are locked in, this becomes the one link for the whole trip. Itinerary, address, timings, all of it.</p>
            <p className="micro-copy">Sam built this instead of using a group chat like a normal person.</p>
            <button type="button" className="hero-share-btn" onClick={handleShare}>
              <span className="material-symbols-outlined">share</span>
              {shareLabel}
            </button>
            <div className="hero-gallery">
              <img
                src="https://raw.githubusercontent.com/samcanpadee-arch/vihan-bucks-weekend/refs/heads/main/assets/images/vihan-therewillbeblood.webp"
                alt="Vihan bucks weekend hero"
              />
            </div>
          </section>

          <section className="how-it-works" aria-label="How this works">
            <p className="section-label">HOW THIS WORKS</p>
            <div className="how-it-works-grid">
              {howItWorksSteps.map((step) => (
                <article key={step.number} className="how-step">
                  <span className="material-symbols-outlined how-step-icon">{step.icon}</span>
                  <p className="how-step-number">{step.number}</p>
                  <h3>{step.heading}</h3>
                  <p>{step.body}</p>
                </article>
              ))}
            </div>
          </section>

          {voteSummary.voterCount > 0 ? (
            <p className="votes-in-pill">
              {voteSummary.voterCount} {voteSummary.voterCount === 1 ? 'vote' : 'votes'} in: {voteSummary.voterNames.join(', ')}
            </p>
          ) : null}

          <AccommodationCard accommodation={accommodation} />

          {votingLocked ? (
            <section className="vote-form">
              <p>Voting is closed. Check the itinerary for the final plan.</p>
              <Link href="/itinerary">Go to itinerary</Link>
            </section>
          ) : (
            <form id="vote" onSubmit={handleSubmit} className="vote-form">
              <div className={`vote-form-content ${disableInputs ? 'is-locked' : ''}`}>
                {error ? <p className="error-message">{error}</p> : null}

                <section className="name-section" id="vote-form">
                  <SectionHeader
                    title="Who are you?"
                    subtitle="Your name. Your one job."
                  />
                  <div className="field-grid">
                    <label>
                      Name
                      <input
                        value={form.name}
                        onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="First name is fine, Dave"
                        disabled={disableInputs}
                      />
                    </label>
                    <label>
                      Anything to share with the group?
                      <input
                        value={form.hardConstraints}
                        onChange={(e) => setForm((prev) => ({ ...prev, hardConstraints: e.target.value }))}
                        placeholder="e.g. bad back, arrives at midnight, will cry at clay shooting"
                        disabled={disableInputs}
                      />
                    </label>
                    <p className="field-hint">Visible to everyone on the itinerary page. Choose your words accordingly.</p>
                  </div>
                </section>

                {votingSections.map((section, index) => (
                  <div key={section.key}>
                    {index === 0 || votingSections[index - 1].day !== section.day ? (
                      <div className="day-divider" aria-hidden="true">
                        <h3>{section.day}</h3>
                      </div>
                    ) : null}

                    <section className="vote-section" id={`section-${section.key}`}>
                      <SectionHeader icon={section.icon} title={section.title} subtitle={section.subtitle} hint="Pick one." />
                      <div className="options-grid">
                        {section.options.map((option) => (
                          <div key={option.id} className="option-choice">
                            <OptionCard
                              option={option}
                              isSelected={form[section.key] === option.id}
                              onSelect={() => selectOption(section.key, option.id)}
                              disabled={disableInputs}
                            />
                            {option.id === 'other' && form[section.key] === 'other' ? (
                              <input
                                className="other-option-input"
                                value={form[`${section.key}Other`] || ''}
                                onChange={(event) =>
                                  setForm((prev) => ({ ...prev, [`${section.key}Other`]: event.target.value }))
                                }
                                placeholder="What are you thinking?"
                                disabled={disableInputs}
                              />
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                ))}
              </div>

              <button type="submit" className="submit-btn" disabled={status === 'loading' || disableInputs}>
                {status === 'loading' ? 'Submitting...' : isEditing ? 'Update votes' : 'Lock in my votes'}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>

              {status === 'success' && !isEditing ? (
                <section className="inline-success">
                  <h3>{form.name}, you&apos;re locked in.</h3>
                  <p>Votes saved. Vihan doesn&apos;t know it yet but his weekend is being democratically decided right now.</p>
                  <button
                    type="button"
                    className="revote-link"
                    onClick={() => {
                      setIsEditing(true);
                      setStatus('idle');
                      setSubmitAttempted(false);
                    }}
                  >
                    Actually, change something
                  </button>
                </section>
              ) : null}
            </form>
          )}
        </div>

        <div className="sticky-col">
          <ProgressCard
            form={form}
            votingSections={votingSections}
            submitAttempted={submitAttempted}
            requiredKeys={requiredKeys}
            onJumpToSection={jumpToSection}
          />
        </div>
      </div>

      <Footer />
    </main>
  );
}
