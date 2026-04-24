'use client';

import { useMemo, useState } from 'react';
import {
  accommodation,
  budgetOptions,
  costGuide,
  hardNoOptions,
  votingSections
} from './siteData';
import AccommodationCard from './components/AccommodationCard';
import CostGuideTable from './components/CostGuideTable';
import OptionCard from './components/OptionCard';
import ProgressCard from './components/ProgressCard';
import SectionHeader from './components/SectionHeader';
import TopNav from './components/TopNav';
import Footer from './components/Footer';

const initialForm = {
  name: '',
  travelNotes: '',
  hardConstraints: '',
  fridayNight: '',
  saturdayMorning: '',
  saturdayLunch: '',
  saturdayDrinks: '',
  saturdayNight: '',
  sundayRecovery: '',
  budgetComfort: '',
  hardNos: [],
  finalComments: ''
};

export default function HomePage() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const requiredKeys = useMemo(
    () => ['name', 'fridayNight', 'saturdayMorning', 'saturdayLunch', 'saturdayDrinks', 'saturdayNight', 'sundayRecovery', 'budgetComfort'],
    []
  );

  const selectOption = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleHardNo = (value) => {
    setForm((prev) => ({
      ...prev,
      hardNos: prev.hardNos.includes(value) ? prev.hardNos.filter((item) => item !== value) : [...prev.hardNos, value]
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitAttempted(true);

    const missing = requiredKeys.filter((key) => !form[key]);
    if (missing.length > 0) {
      setError('Add your name and vote across each core section before submitting.');
      const firstMissing = missing[0];
      const el = document.getElementById(`section-${firstMissing}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }

    const payload = {
      name: form.name,
      travelNotes: form.travelNotes,
      hardConstraints: form.hardConstraints,
      fridayNight: form.fridayNight,
      saturdayMorning: form.saturdayMorning,
      saturdayLunch: form.saturdayLunch,
      saturdayDrinks: form.saturdayDrinks,
      saturdayNight: form.saturdayNight,
      sundayRecovery: form.sundayRecovery,
      budgetComfort: form.budgetComfort,
      hardNos: form.hardNos,
      finalComments: form.finalComments,
      submittedAt: new Date().toISOString()
    };

    const endpoint = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT;

    setStatus('loading');
    try {
      if (endpoint) {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error('Submission failed');
        }
      } else {
        console.log('Mock submit payload:', payload);
      }

      setStatus('success');
      setForm(initialForm);
      setSubmitAttempted(false);
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
            </section>
          ) : null}

          <form id="vote" onSubmit={handleSubmit} className="vote-form">
            <section className="field-grid" id="section-name">
              <label>
                Name (identity for public shaming)
                <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="e.g. Dave" />
              </label>
              <label>
                Travel notes (who are you carpooling with?)
                <input
                  value={form.travelNotes}
                  onChange={(e) => setForm((prev) => ({ ...prev, travelNotes: e.target.value }))}
                  placeholder="Driving from Northcote..."
                />
              </label>
              <label>
                Hard constraints (allergies/anxieties)
                <input
                  value={form.hardConstraints}
                  onChange={(e) => setForm((prev) => ({ ...prev, hardConstraints: e.target.value }))}
                  placeholder="No mushrooms, terrified of goats"
                />
              </label>
            </section>

            {votingSections.map((section) => (
              <section key={section.key} className="vote-section" id={`section-${section.key}`}>
                <SectionHeader icon={section.icon} title={section.title} subtitle={section.subtitle} />
                <div className="options-grid">
                  {section.options.map((option) => (
                    <OptionCard
                      key={option.id}
                      option={option}
                      isSelected={form[section.key] === option.id}
                      onSelect={() => selectOption(section.key, option.id)}
                    />
                  ))}
                </div>
              </section>
            ))}

            <section className="vote-section" id="section-budgetComfort">
              <SectionHeader title="Budget comfort" label="💸" subtitle="Pick your comfort zone" />
              <div className="pill-grid">
                {budgetOptions.map((option) => (
                  <button
                    type="button"
                    key={option.id}
                    className={`pill ${form.budgetComfort === option.id ? 'selected' : ''}`}
                    onClick={() => selectOption('budgetComfort', option.id)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="vote-section">
              <SectionHeader title="Hard no list" label="🚫" subtitle="Checkbox the things that are absolutely off limits" />
              <div className="pill-grid">
                {hardNoOptions.map((option) => (
                  <button
                    type="button"
                    key={option}
                    className={`pill ${form.hardNos.includes(option) ? 'selected danger' : ''}`}
                    onClick={() => toggleHardNo(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </section>

            <section className="vote-section">
              <SectionHeader title="Final comments" label="✍️" subtitle="Last notes before lock-in" />
              <textarea
                rows={4}
                value={form.finalComments}
                onChange={(e) => setForm((prev) => ({ ...prev, finalComments: e.target.value }))}
                placeholder="Anything else the group should know..."
              />
            </section>

            {error ? <p className="error-message">{error}</p> : null}

            <button type="submit" className="submit-btn" disabled={status === 'loading'}>
              {status === 'loading' ? 'Submitting...' : 'Submit votes'}
              {status !== 'loading' ? <span className="material-symbols-outlined">arrow_forward</span> : null}
            </button>
          </form>

          <section className="vote-section">
            <SectionHeader label="Cost" title="Cost guide" subtitle="Indicative only. Not a checkout... Please do not invoice Sam." />
            <CostGuideTable rows={costGuide} />
          </section>
        </div>

        <div className="sticky-col">
          <ProgressCard form={form} submitAttempted={submitAttempted} requiredKeys={requiredKeys} />
        </div>
      </div>

      <Footer />
    </main>
  );
}
