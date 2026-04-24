'use client';

import { useEffect, useMemo, useState } from 'react';
import { accommodation, votingSections } from './siteData';
import AccommodationCard from './components/AccommodationCard';
import OptionCard from './components/OptionCard';
import ProgressCard from './components/ProgressCard';
import ResultsCard from './components/ResultsCard';
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
  sundayRecovery: '',
  finalComments: ''
};

export default function HomePage() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState('idle');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [resultsData, setResultsData] = useState(null);
  const [resultsLoading, setResultsLoading] = useState(true);

  const requiredKeys = useMemo(
    () => ['name', 'fridayNight', 'saturdayMorning', 'saturdayLunch', 'saturdayDrinks', 'saturdayNight', 'sundayRecovery'],
    []
  );

  const optionLookup = useMemo(() => {
    const lookup = {};

    for (const section of votingSections) {
      for (const option of section.options) {
        lookup[option.id] = option.title;
      }
    }

    return lookup;
  }, []);

  const disableInputs = status === 'success' && !isEditing;

  const selectOption = (key, value) => {
    if (disableInputs) return;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const jumpToSection = (key) => {
    const el = document.getElementById(`section-${key}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const fetchResults = async () => {
    try {
      const response = await fetch('/api/results', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Failed to load results');
      }

      const data = await response.json();
      setResultsData(data);
    } catch (resultsError) {
      console.error(resultsError);
    } finally {
      setResultsLoading(false);
    }
  };

  useEffect(() => {
    const votedName = localStorage.getItem('bucks-voted');
    if (votedName) {
      setStatus('success');
      setIsEditing(false);
      const savedVote = localStorage.getItem('bucks-vote-data');
      if (savedVote) {
        try {
          setForm(JSON.parse(savedVote));
        } catch {
          // ignore parse errors
        }
      }
    }

    fetchResults();
    const interval = setInterval(fetchResults, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitAttempted(true);

    const missing = requiredKeys.filter((key) => !form[key]);
    if (missing.length > 0) {
      setError('Add your name and vote across each core section before submitting.');
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
      localStorage.setItem('bucks-voted', form.name.trim().toLowerCase());
      localStorage.setItem('bucks-vote-data', JSON.stringify(form));
      fetchResults();
    } catch (submitError) {
      console.error(submitError);
      setStatus('idle');
      setError('Could not submit right now. Try again in a minute.');
    }
  };

  return (
    <main className="page-shell">
      <TopNav activeHref="/" />

      <div className="layout-grid">
        <div className="content-col">
          <section className="hero-block">
            <p className="section-label">Trip hub + voting</p>
            <h2>Vihan&apos;s Yarra Valley Bucks Weekend</h2>
            <p>26-28 June 2026 · Yarra Glen · A very serious planning website for a deeply unserious weekend.</p>
            <p>Vote on the rough plan now. Once things are locked in, this becomes the trip hub with the final itinerary, accommodation details, booking links, times and notes.</p>
            <p className="micro-copy">Built because planning manually is painful and procrastination is a powerful drug.</p>
            <div className="hero-gallery">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBAOtbpPNDunp6x3CIsV00p0feXtMwD09UY3-DPx81Qdpj82fAx09o0q94XyDzk053sFMsJkAsY-C2hCuO8YZzwLz9fuFe1fWUta0a8d7TtLDcboKEcQwKX0GHvbB2IpONF1BIsB1RjSNYzLDaCUwq4ceyA4qb1WDAE7lkS-BG-oi_J1fhLI_ifpTFaNoBqEAaGqHIyLYSG20sm3b9j_BxKxj7vUDMc1XPUg5SKyUy0PJRfjP3Qjvk5GM2vacto0zez_k3FcCfEDf0" alt="Yarra valley estate" />
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuD6zVl9_IxBAVuPnEMbSeodLMBs-bnqy7DivYP9ssvdSwb944tFWxmbpbi27oe6NQDWtK2-3opyA5SjLETQ1KGXV0VVRkAFbBPh12OakncL62B_n51D1HsiJdY9f7bTdSlX4NpzeBmfjl4BqLxU2sDiKbyQGrjuX85xzr0F4rJJ9y3JdUhREMxR5TA1mYoYvnmfQ7Jo2GvC6bWSgr4Zye84JT6sSc2tOv5eCrdBgoOReoULEnZBQMVIweDjT_5OTPOcaCorxvLQYBw" alt="Vineyards" />
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLLpHdOLMWrQqUL_l-lL6jzKxBmolYD14UoCVc9phlOzNgSuUpjAa2meMacN46VZoS6rW2QCt-yRl31bh_EVoL8DyZ2rtQRn2OQcZyNa-Xp6t_KLroVSa_CpdQZ6CK0MruG-6O1ZiYjxwK_WsmyIe-KQ_oLmUy0GYrXMclewnNTNqPpNbrx57N86oZandc_pTvV5TfP-CeLHA_rdVvSFqm-qsJrxUqI-AnCDyj72DNdZq63FY_LBPozjFmfRr2qQ8ttLCnUB56OZQ" alt="Distillery interior" />
            </div>
          </section>

          <AccommodationCard accommodation={accommodation} />

          {status === 'success' ? (
            <section className="success-card">
              <h3>Votes submitted.</h3>
              <p>
                Legend. Once everyone has voted, the plan will get locked in and this site becomes the final itinerary
                hub.
              </p>
              <button
                type="button"
                className="revote-link"
                onClick={() => {
                  setIsEditing(true);
                  setStatus('idle');
                  setSubmitAttempted(false);
                }}
              >
                Edit your votes
              </button>
            </section>
          ) : null}

          {status === 'success' ? (
            <section className="mobile-results-wrap">
              <ResultsCard data={resultsData} loading={resultsLoading} optionLookup={optionLookup} />
            </section>
          ) : null}

          <form id="vote" onSubmit={handleSubmit} className="vote-form">
            <section className="name-section" id="section-name">
              <SectionHeader
                title="Who are you?"
                subtitle="So we know whose questionable opinions these are."
              />
              <div className="field-grid">
                <label>
                  Name
                  <input
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Dave"
                    disabled={disableInputs}
                  />
                </label>
                <label>
                  Anything we should actually know?
                  <input
                    value={form.hardConstraints}
                    onChange={(e) => setForm((prev) => ({ ...prev, hardConstraints: e.target.value }))}
                    placeholder="No mushrooms, terrified of heights, etc."
                    disabled={disableInputs}
                  />
                </label>
              </div>
            </section>

            {votingSections.map((section, index) => (
              <div key={section.key}>
                {index === 0 || votingSections[index - 1].day !== section.day ? (
                  <div className="day-divider" aria-hidden="true">
                    <h3>{section.day}</h3>
                    <p>
                      {section.day === 'Friday'
                        ? 'The arrival. People will trickle in after work.'
                        : section.day === 'Saturday'
                          ? "The main event. This is why we're here."
                          : 'The soft landing. Optional but recommended.'}
                    </p>
                  </div>
                ) : null}

                <section className="vote-section" id={`section-${section.key}`}>
                  <SectionHeader icon={section.icon} title={section.title} subtitle={section.subtitle} hint="Pick one" />
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

            <section className="vote-section" id="section-finalComments">
              <SectionHeader title="Anything else?" label="✍️" subtitle="Last words before we lock this in." />
              <textarea
                rows={3}
                value={form.finalComments}
                onChange={(e) => setForm((prev) => ({ ...prev, finalComments: e.target.value }))}
                placeholder="Strong opinions, bad ideas, dietary stuff, whatever."
                disabled={disableInputs}
              />
            </section>

            {error ? <p className="error-message">{error}</p> : null}

            <button type="submit" className="submit-btn" disabled={status === 'loading' || disableInputs}>
              {status === 'loading' ? 'Submitting...' : isEditing ? 'Update votes' : 'Submit votes'}
              {status !== 'loading' ? <span className="material-symbols-outlined">arrow_forward</span> : null}
            </button>
          </form>

          {status !== 'success' ? (
            <section className="mobile-results-wrap">
              <ResultsCard data={resultsData} loading={resultsLoading} optionLookup={optionLookup} />
            </section>
          ) : null}
        </div>

        <div className="sticky-col">
          {status === 'success' || (resultsData?.voterCount ?? 0) > 0 ? (
            <ResultsCard data={resultsData} loading={resultsLoading} optionLookup={optionLookup} />
          ) : (
            <ProgressCard
              form={form}
              submitAttempted={submitAttempted}
              requiredKeys={requiredKeys}
              onJumpToSection={jumpToSection}
            />
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
