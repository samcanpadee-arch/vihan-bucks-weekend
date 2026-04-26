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

export default function HomePage() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState('idle');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [votingLocked, setVotingLocked] = useState(false);

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
    } catch (configError) {
      console.error(configError);
    }
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
  }, []);

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
            <p>Vote on the rough plan. Once things are confirmed, this becomes the one link for the whole weekend.</p>
            <p className="micro-copy">Sam built this instead of using a group chat like a normal person.</p>
            <div className="hero-gallery">
              <img
                src="https://raw.githubusercontent.com/samcanpadee-arch/vihan-bucks-weekend/refs/heads/main/vihan-therewillbeblood.webp"
                alt="Vihan bucks weekend hero"
              />
            </div>
          </section>

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
                        placeholder="Allergies, bad ideas, activity suggestions, standing grievances"
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
                        <p>
                          {section.day === 'Friday'
                            ? 'People are coming from work. Manage expectations. Bring snacks.'
                            : section.day === 'Saturday'
                              ? "The reason we're all here. Don't blow it before midday."
                              : 'Soft landing. Leave with your dignity mostly intact.'}
                        </p>
                      </div>
                    ) : null}

                    <section className="vote-section" id={`section-${section.key}`}>
                      <SectionHeader icon={section.icon} title={section.title} subtitle={section.subtitle} hint="Pick one. You can change it later if you have a better idea." />
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
