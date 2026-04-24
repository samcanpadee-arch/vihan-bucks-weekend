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
  saturdayMorning: '',
  saturdayLunch: '',
  saturdayDrinks: '',
  saturdayNight: '',
  sundayRecovery: ''
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
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const jumpToSection = (key) => {
    const sectionId = key === 'name' ? 'vote-form' : `section-${key}`;
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
            <p className="micro-copy">If you&apos;re reading this, Sam finished building it instead of touching grass. Respect the dedication.</p>
            <div className="hero-gallery">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBAOtbpPNDunp6x3CIsV00p0feXtMwD09UY3-DPx81Qdpj82fAx09o0q94XyDzk053sFMsJkAsY-C2hCuO8YZzwLz9fuFe1fWUta0a8d7TtLDcboKEcQwKX0GHvbB2IpONF1BIsB1RjSNYzLDaCUwq4ceyA4qb1WDAE7lkS-BG-oi_J1fhLI_ifpTFaNoBqEAaGqHIyLYSG20sm3b9j_BxKxj7vUDMc1XPUg5SKyUy0PJRfjP3Qjvk5GM2vacto0zez_k3FcCfEDf0" alt="Yarra valley estate" />
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuD6zVl9_IxBAVuPnEMbSeodLMBs-bnqy7DivYP9ssvdSwb944tFWxmbpbi27oe6NQDWtK2-3opyA5SjLETQ1KGXV0VVRkAFbBPh12OakncL62B_n51D1HsiJdY9f7bTdSlX4NpzeBmfjl4BqLxU2sDiKbyQGrjuX85xzr0F4rJJ9y3JdUhREMxR5TA1mYoYvnmfQ7Jo2GvC6bWSgr4Zye84JT6sSc2tOv5eCrdBgoOReoULEnZBQMVIweDjT_5OTPOcaCorxvLQYBw" alt="Vineyards" />
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLLpHdOLMWrQqUL_l-lL6jzKxBmolYD14UoCVc9phlOzNgSuUpjAa2meMacN46VZoS6rW2QCt-yRl31bh_EVoL8DyZ2rtQRn2OQcZyNa-Xp6t_KLroVSa_CpdQZ6CK0MruG-6O1ZiYjxwK_WsmyIe-KQ_oLmUy0GYrXMclewnNTNqPpNbrx57N86oZandc_pTvV5TfP-CeLHA_rdVvSFqm-qsJrxUqI-AnCDyj72DNdZq63FY_LBPozjFmfRr2qQ8ttLCnUB56OZQ" alt="Distillery interior" />
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
                              ? 'This is the one. The whole trip is basically this day.'
                              : 'Soft landing. Leave with your dignity mostly intact.'}
                        </p>
                      </div>
                    ) : null}

                    <section className="vote-section" id={`section-${section.key}`}>
                      <SectionHeader icon={section.icon} title={section.title} subtitle={section.subtitle} hint="Pick one. You can change it later if you have a better idea." />
                      <div className="options-grid">
                        {section.options.map((option) => (
                          <OptionCard
                            key={option.id}
                            option={option}
                            isSelected={form[section.key] === option.id}
                            onSelect={() => selectOption(section.key, option.id)}
                            disabled={disableInputs}
                          />
                        ))}
                      </div>
                    </section>
                  </div>
                ))}

                {error ? <p className="error-message">{error}</p> : null}
              </div>

              <button type="submit" className="submit-btn" disabled={status === 'loading' || disableInputs}>
                {status === 'loading' ? 'Submitting...' : isEditing ? 'Update votes' : 'Lock in my votes'}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>

              {status === 'success' && !isEditing ? (
                <section className="inline-success">
                  <h3>You&apos;re in, {form.name || 'legend'}.</h3>
                  <p>Votes saved. The group thanks you for your participation in this extremely democratic process.</p>
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
