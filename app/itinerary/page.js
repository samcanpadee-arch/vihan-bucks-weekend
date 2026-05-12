'use client';

import { useEffect, useState } from 'react';
import { accommodation, essentialsChecklist, itineraryTimeline, votingSections } from '../siteData';
import AccommodationCard from '../components/AccommodationCard';
import ItineraryTimeline from '../components/ItineraryTimeline';
import SectionHeader from '../components/SectionHeader';
import TopNav from '../components/TopNav';
import Footer from '../components/Footer';

const AIRBNB_ADDRESS = '13 Symonds Street, Yarra Glen VIC 3775';
const AIRBNB_LINK = 'https://www.airbnb.com.au/rooms/1561866387856977252?source_impression_id=p3_1776992856_P3BRBi61hmW3JbmH';
const AIRBNB_IMAGE = accommodation.image;

const confirmedActivityOverrides = {
  fridayNight: {
    title: 'Pizza Oven Night',
    time: 'From 7:00pm',
    description: "Sam's bringing his portable pizza oven. He'll sort the dough, run the process, and turn out genuinely good pizzas without making it a whole personality. Help is welcome if you want in. Standing around with a beer doing fake supervision is also fine.",
    cost: null,
    bookingNote: ''
  },
  saturdayMorning: {
    time: '10:00am',
    description: 'A proper rainforest walk through fern gullies and tall eucalypts. Takes about an hour, easy underfoot, and genuinely looks like a nature documentary. Good reset after Friday night.',
    address: 'Badger Weir Road, Badger Creek VIC 3777',
    mapsLink: 'https://maps.google.com/?q=Badger+Weir+Road+Badger+Creek+VIC+3777',
    externalLinkLabel: 'Parks Victoria',
    cost: null,
    bookingNote: ''
  },
  saturdayLunch: {
    time: '1pm',
    description: "Cellar door tasting followed by a proper sit-down lunch with meadow views and live music on weekends. It's a winery lunch, so yes it's a bit fancy, and yes that's the point.",
    bookingNote: ''
  },
  saturdayDrinks: {
    time: '3pm',
    description: "Local craft brewery in Healesville. Booked out for the group so there's actually somewhere to sit. Good beer, relaxed vibe, no agenda beyond that.",
    cost: null,
    bookingNote: ''
  },
  saturdayNight: {
    title: 'BBQ at The Meadow',
    time: 'From 7:00pm',
    description: 'Back at base. Fire up the BBQ, grill things, eat things, sit outside if the weather holds. No logistics, no bookings, no one in charge.',
    cost: null,
    bookingNote: ''
  },
  sundayRecovery: {
    description: "Walk around, eat chocolate, make questionable decisions at the fudge counter. Genuinely one of the better ways to end a weekend away.",
    cost: null
  }
};

const dayDates = {
  Friday: '26 June',
  Saturday: '27 June',
  Sunday: '28 June'
};

const fixedPlanCards = {
  Friday: [
    {
      id: 'friday-airbnb-check-in',
      sectionTitle: 'Friday arrival',
      title: 'The Meadow',
      time: 'From 3:00pm',
      description: "Six bedrooms, a spa, a sauna, a barrel sauna, a fire pit, a pool table, a wood heater, and views over rolling fields with actual cows. From the team behind Bella's Cottage. This is not a standard Airbnb. Pick a room, get in the spa, and try not to feel smug about it.",
      address: AIRBNB_ADDRESS,
      mapsLink: 'https://maps.google.com/?q=13+Symonds+Street+Yarra+Glen+VIC+3775',
      externalLinkLabel: 'View on Airbnb',
      link: AIRBNB_LINK,
      thumbnail: AIRBNB_IMAGE,
      icon: 'house'
    }
  ],
  Saturday: [
    {
      id: 'saturday-airbnb-brekkie',
      sectionTitle: 'Saturday morning',
      title: 'The Meadow - Morning',
      time: "Whenever you're up",
      description: 'Coffee, something to eat, and absolutely no pressure to be functional. Use the time.',
      address: AIRBNB_ADDRESS,
      mapsLink: 'https://maps.google.com/?q=13+Symonds+Street+Yarra+Glen+VIC+3775',
      externalLinkLabel: 'View on Airbnb',
      link: AIRBNB_LINK,
      thumbnail: AIRBNB_IMAGE,
      icon: 'coffee'
    }
  ],
  Sunday: [
    {
      id: 'sunday-airbnb-brekkie',
      sectionTitle: 'Sunday morning',
      title: 'The Meadow - Morning',
      time: "Whenever you're up",
      description: "Slower morning. Make coffee, eat whatever's left, sit by the fire if it's still going. No rush.",
      address: AIRBNB_ADDRESS,
      mapsLink: 'https://maps.google.com/?q=13+Symonds+Street+Yarra+Glen+VIC+3775',
      externalLinkLabel: 'View on Airbnb',
      link: AIRBNB_LINK,
      thumbnail: AIRBNB_IMAGE,
      icon: 'coffee'
    }
  ]
};

const defaultFinalSelections = {
  fridayNight: 'fri-pizza',
  saturdayMorning: 'sat-am-walk',
  saturdayLunch: 'sat-lunch-rochford',
  saturdayDrinks: 'sat-arvo-watts',
  saturdayNight: 'sat-night-bbq',
  sundayRecovery: 'sun-chocolaterie'
};

function buildConfirmedActivities(finalResults = {}) {
  return votingSections
    .map((section) => {
      const selectedId = defaultFinalSelections[section.key] || finalResults[section.key];
      if (!selectedId) return null;

      const baseOption = section.options.find((opt) => opt.id === selectedId);
      if (!baseOption) return null;

      const option = section.key === 'saturdayMorning'
        ? {
            ...baseOption,
            title: 'Badger Weir Picnic Area',
            description: 'A proper rainforest walk through fern gullies and tall eucalypts. Takes about an hour, easy underfoot, and genuinely looks like a nature documentary. Good reset after Friday night.',
            cost: null,
            link: 'https://www.parks.vic.gov.au/places-to-see/parks/yarra-ranges-national-park',
            bookingNote: ''
          }
        : baseOption;

      return {
        sectionKey: section.key,
        sectionTitle: section.title,
        day: section.day,
        icon: section.icon,
        option
      };
    })
    .filter(Boolean);
}

const travelConnectors = {
  Saturday: {
    'saturday-airbnb-brekkie::saturdayMorning': { labels: ['~25-30 min drive'] },
    'saturdayMorning::saturdayLunch': {
      labels: ['~25-30 min drive', '~10-15 min drive'],
      note: 'Back to base to freshen up'
    },
    'saturdayLunch::saturdayDrinks': {
      labels: ['~7 min drive'],
      note: "Designated drivers needed, or we'll book a couple of maxi cabs."
    },
    'saturdayDrinks::saturdayNight': {
      labels: ['~15 min drive'],
      note: "Designated drivers needed, or we'll book a couple of maxi cabs."
    }
  },
  Sunday: {
    'sunday-airbnb-brekkie::sundayRecovery': { labels: ['~5 min drive'] }
  }
};

const finalTravelConnectors = {
  Sunday: { label: 'Drive back to Melbourne', showIcon: false, isFinal: true }
};

function TravelConnector({ connector }) {
  const primaryLabel = connector.label || connector.labels?.[0];

  return (
    <div className={`travel-connector ${connector.note ? 'two-part' : ''} ${connector.isFinal ? 'is-final' : ''}`} aria-label="Travel time">
      <div className="dotted-line" />
      {connector.showIcon === false ? null : <span className="travel-icon" aria-hidden="true">🚗</span>}
      <span className="travel-label">{primaryLabel}</span>
      {connector.note ? (
        <>
          <div className="dotted-line" />
          <span className="travel-note">{connector.note}</span>
          {connector.labels?.[1] ? (
            <>
              <div className="dotted-line" />
              <span className="travel-icon" aria-hidden="true">🚗</span>
              <span className="travel-label">{connector.labels[1]}</span>
            </>
          ) : null}
        </>
      ) : null}
      {connector.isFinal ? null : <div className="dotted-line" />}
    </div>
  );
}

function ItineraryCard({ item }) {
  return (
    <article className="confirmed-activity-card">
      <div className="confirmed-activity-image">
        {item.thumbnail ? (
          <img src={item.thumbnail} alt={item.title} />
        ) : (
          <div className="confirmed-activity-icon-placeholder">
            <span className="material-symbols-outlined">{item.icon}</span>
          </div>
        )}
      </div>
      <div className="confirmed-activity-content">
        <div className="confirmed-card-kicker">
          <p className="section-label">{item.sectionTitle}</p>
          {item.time ? <span className="time-chip">{item.time}</span> : null}
        </div>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
        {item.address ? (
          <a
            href={item.mapsLink || `https://maps.google.com/?q=${encodeURIComponent(item.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="address-link"
          >
            <span className="material-symbols-outlined">location_on</span>
            {item.address}
          </a>
        ) : null}
        {item.bookingNote ? (
          <div className="booking-note">
            <span className="material-symbols-outlined">calendar_month</span>
            <p>{item.bookingNote}</p>
          </div>
        ) : null}
        <div className="confirmed-card-footer">
          {item.cost ? <span className="cost-chip">{item.cost}</span> : null}
          {item.link ? (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="option-link"
            >
              {item.externalLinkLabel || 'More info'}{' '}
              <span className="material-symbols-outlined">open_in_new</span>
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function ConfirmedPlanCards({ activities }) {
  const dynamicCards = activities.map((activity) => {
    const overrides = confirmedActivityOverrides[activity.sectionKey] || {};

    return {
      id: activity.sectionKey,
      sectionTitle: activity.sectionTitle,
      day: activity.day,
      title: activity.option.title,
      description: activity.option.description,
      cost: activity.option.cost,
      bookingNote: activity.option.bookingNote,
      link: activity.option.link,
      thumbnail: activity.option.thumbnail,
      icon: activity.icon,
      ...overrides
    };
  });

  const days = ['Friday', 'Saturday', 'Sunday'];

  return (
    <div className="confirmed-plan-list">
      {days.map((day) => {
        const dayCards = [
          ...(fixedPlanCards[day] || []),
          ...dynamicCards.filter((activity) => activity.day === day)
        ];

        if (!dayCards.length) return null;

        return (
          <div key={day} className="confirmed-day-group">
            <div className="confirmed-day-header">
              <span className="confirmed-day-label">{day}</span>
              <span className="confirmed-day-date">{dayDates[day]}</span>
            </div>
            {dayCards.map((item, index) => {
              const next = dayCards[index + 1];
              const connector = next
                ? travelConnectors[day]?.[`${item.id}::${next.id}`]
                : finalTravelConnectors[day];

              return (
                <div key={item.id} className="confirmed-plan-item">
                  <ItineraryCard item={item} />
                  {connector ? <TravelConnector connector={connector} /> : null}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default function ItineraryPage() {
  const [results, setResults] = useState(null);
  const [confirmedActivities, setConfirmedActivities] = useState(() => buildConfirmedActivities());
  const [votesExpanded, setVotesExpanded] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [customNames, setCustomNames] = useState([]);
  const [groupNameInput, setGroupNameInput] = useState('');
  const [showNameManager, setShowNameManager] = useState(false);
  const [expensesLoading, setExpensesLoading] = useState(true);
  const [expenseError, setExpenseError] = useState('');
  const [splitMode, setSplitMode] = useState('everyone');
  const [expenseForm, setExpenseForm] = useState({
    id: '',
    description: '',
    amount: '',
    paidBy: '',
    splitAmong: [],
    splitType: 'equal'
  });

  const participantNames = Array.from(
    new Map(
      [...(results?.voterNames || []), ...customNames, ...expenses.flatMap((expense) => [expense.paidBy, ...(expense.splitAmong || [])])]
        .filter(Boolean)
        .map((name) => [name.trim().toLowerCase(), name.trim()])
    ).values()
  );

  const settlement = (() => {
    const ledger = {};
    for (const expense of expenses) {
      const splitMembers = expense.splitAmong?.length ? expense.splitAmong : [expense.paidBy];
      const share = expense.amount / splitMembers.length;

      ledger[expense.paidBy] = (ledger[expense.paidBy] || 0) + expense.amount;
      for (const person of splitMembers) {
        ledger[person] = (ledger[person] || 0) - share;
      }
    }

    const creditors = Object.entries(ledger)
      .filter(([, balance]) => balance > 0.009)
      .map(([name, amount]) => ({ name, amount }));
    const debtors = Object.entries(ledger)
      .filter(([, balance]) => balance < -0.009)
      .map(([name, amount]) => ({ name, amount: Math.abs(amount) }));

    const rows = [];
    let creditorIndex = 0;
    let debtorIndex = 0;

    while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
      const creditor = creditors[creditorIndex];
      const debtor = debtors[debtorIndex];
      const amount = Math.min(creditor.amount, debtor.amount);

      rows.push({
        from: debtor.name,
        to: creditor.name,
        amount: Number(amount.toFixed(2))
      });

      creditor.amount -= amount;
      debtor.amount -= amount;

      if (creditor.amount < 0.01) creditorIndex += 1;
      if (debtor.amount < 0.01) debtorIndex += 1;
    }

    return rows;
  })();

  useEffect(() => {
    try {
      const saved = localStorage.getItem('expense-names');
      const parsed = saved ? JSON.parse(saved) : [];
      if (Array.isArray(parsed)) {
        const normalized = parsed
          .filter((name) => typeof name === 'string')
          .map((name) => name.trim())
          .filter(Boolean);
        setCustomNames(normalized);
      }
    } catch (error) {
      console.error('Could not parse saved expense names:', error);
      setCustomNames([]);
    }
  }, []);

  useEffect(() => {
    const loadResults = async () => {
      try {
        const response = await fetch('/api/results', { cache: 'no-store' });
        if (!response.ok) return;
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error(error);
      }
    };

    const loadConfig = async () => {
      try {
        const response = await fetch('/api/admin/config', { cache: 'no-store' });
        if (!response.ok) return;
        const configData = await response.json();

        setConfirmedActivities(buildConfirmedActivities(configData.finalResults || {}));
      } catch (error) {
        console.error(error);
      }
    };

    const loadExpenses = async () => {
      setExpensesLoading(true);
      try {
        const response = await fetch('/api/expenses', { cache: 'no-store' });
        if (!response.ok) throw new Error('Could not load expenses');
        const data = await response.json();
        setExpenses(data.expenses || []);
      } catch (error) {
        console.error(error);
        setExpenseError("Couldn't save that. Try again.");
      } finally {
        setExpensesLoading(false);
      }
    };

    loadResults();
    loadConfig();
    loadExpenses();
  }, []);

  useEffect(() => {
    if (!participantNames.length) return;

    if (splitMode === 'everyone') {
      setExpenseForm((prev) => ({
        ...prev,
        splitAmong: participantNames
      }));
      return;
    }

    setExpenseForm((prev) => {
      if (prev.splitAmong.length > 0) return prev;
      return {
        ...prev,
        splitAmong: participantNames
      };
    });
  }, [participantNames, splitMode]);

  const toggleSplitMember = (name) => {
    setExpenseForm((prev) => ({
      ...prev,
      splitAmong: prev.splitAmong.includes(name)
        ? prev.splitAmong.filter((member) => member !== name)
        : [...prev.splitAmong, name]
    }));
  };

  const addCustomName = () => {
    const trimmed = groupNameInput.trim();
    if (!trimmed) return;

    const next = Array.from(new Map([...customNames, trimmed].map((name) => [name.trim().toLowerCase(), name.trim()])).values());
    setCustomNames(next);
    localStorage.setItem('expense-names', JSON.stringify(next));
    setGroupNameInput('');
  };

  const removeCustomName = (nameToRemove) => {
    const next = customNames.filter((name) => name.trim().toLowerCase() !== nameToRemove.trim().toLowerCase());
    setCustomNames(next);
    localStorage.setItem('expense-names', JSON.stringify(next));
  };

  const submitExpense = async (event) => {
    event.preventDefault();
    setExpenseError('');

    const splitAmong = splitMode === 'everyone' ? participantNames : expenseForm.splitAmong;
    if (splitMode === 'everyone' && participantNames.length === 0) {
      setExpenseError("Couldn't save that. Try again.");
      return;
    }

    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: expenseForm.id || undefined,
          description: expenseForm.description,
          amount: Number(expenseForm.amount),
          paidBy: expenseForm.paidBy,
          splitType: 'equal',
          splitAmong
        })
      });

      if (!response.ok) throw new Error('Expense save failed');
      const data = await response.json();

      setExpenses((prev) => {
        const withoutCurrent = prev.filter((item) => item.id !== data.expense.id);
        return [data.expense, ...withoutCurrent];
      });
      setSplitMode('everyone');
      setExpenseForm({
        id: '',
        description: '',
        amount: '',
        paidBy: '',
        splitAmong: participantNames,
        splitType: 'equal'
      });
    } catch (error) {
      console.error(error);
      setExpenseError("Couldn't save that. Try again.");
    }
  };

  const deleteExpense = async (id) => {
    if (!window.confirm('Delete this expense?')) return;

    try {
      const response = await fetch(`/api/expenses?id=${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Delete failed');
      setExpenses((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error(error);
      setExpenseError("Couldn't save that. Try again.");
    }
  };

  return (
    <main className="page-shell">
      <TopNav activeHref="/itinerary" />

      <section className="hero-block muted-bg">
        <h2>The weekend, in one place.</h2>
        <p>
          Everything you need for the Yarra Valley trip. Bookmark it, share it, stop scrolling through the chat looking for the address.
        </p>
      </section>

      <section className="itinerary-top-grid">
        <AccommodationCard accommodation={accommodation} />
        <aside className="essentials-card">
          <p className="section-label">The packing list</p>
          <h3>Bring this stuff</h3>
          <ul>
            {essentialsChecklist.map((item) => (
              <li key={item}>
                <span className="material-symbols-outlined">check_circle</span>
                {item}
              </li>
            ))}
          </ul>
          <p className="fine-print">Future you will be grateful. Past you is already forgetting something.</p>
        </aside>
      </section>

      {confirmedActivities.length > 0 ? (
        <section className="vote-section confirmed-plan-section">
          <SectionHeader
            title="The plan"
            label="Confirmed"
            icon="event_available"
            subtitle="Voting is closed. This is what we're doing."
          />
          <ConfirmedPlanCards activities={confirmedActivities} />
        </section>
      ) : (
        <section className="vote-section">
          <SectionHeader title="Weekend timeline" label="Timeline" icon="schedule" />
          <ItineraryTimeline timeline={itineraryTimeline} />
        </section>
      )}

      <section className="vote-section standings-card">
        <button
          type="button"
          className="collapsible-toggle"
          onClick={() => setVotesExpanded((prev) => !prev)}
          aria-expanded={votesExpanded}
        >
          <SectionHeader
            title="How the votes looked"
            label="Closed"
            icon="leaderboard"
            subtitle="Voting is done. This is the full breakdown."
          />
          <span className="material-symbols-outlined collapsible-chevron">
            {votesExpanded ? 'expand_less' : 'expand_more'}
          </span>
        </button>
        {votesExpanded ? (
          <div className="collapsible-body">
            {results?.voterNames?.length ? (
          <div className="voter-roll">
            <p className="section-label">Voted</p>
            <div className="voter-chip-grid">
              {results.voterNames.map((name) => (
                <span key={name} className="voter-chip">
                  <span className="material-symbols-outlined">check_circle</span>
                  {name}
                </span>
              ))}
            </div>
          </div>
        ) : null}
            <div className="leaderboard-list">
              {votingSections.map((section) => {
            const sortedEntries = Object.entries(results?.tally?.[section.key] || {})
              .filter(([optionId]) => optionId !== 'other')
              .sort((a, b) => b[1] - a[1]);
            const totalVotes = sortedEntries.reduce((sum, [, count]) => sum + count, 0);
            const sectionSuggestions = results?.otherSuggestions?.[section.key] || [];

            return (
              <article key={section.key} className="leaderboard-category">
                <p className="section-label">{section.title}</p>
                {totalVotes || sectionSuggestions.length ? (
                  <>
                    {totalVotes ? (
                    <div className="leaderboard-options">
                      {sortedEntries.map(([optionId, count], index) => {
                        const optionLabel = section.options.find((option) => option.id === optionId)?.title || optionId;
                        const percentage = Math.round((count / totalVotes) * 100);
                        const isLeader = index === 0;

                        return (
                          <div key={optionId} className="leaderboard-option">
                            <div className="leaderboard-row">
                              <span>
                                {optionLabel}
                              </span>
                              <small>
                                {count} {count === 1 ? 'vote' : 'votes'}
                              </small>
                            </div>
                            <div className="leaderboard-bar-track">
                              <div className={`leaderboard-bar ${isLeader ? 'leader' : ''}`} style={{ width: `${percentage}%` }} />
                            </div>
                            {isLeader ? <span className="leaderboard-rank">🏆</span> : null}
                          </div>
                        );
                      })}
                    </div>
                    ) : (
                      <p className="result-empty">No standard option votes yet.</p>
                    )}
                    {sectionSuggestions.length ? (
                      <div className="other-suggestions-list">
                        <p className="section-label">💡 Suggested by the group</p>
                        {sectionSuggestions.map((suggestion, index) => (
                          <p key={`${suggestion.name}-${suggestion.text}-${index}`} className="other-suggestion-item">
                            {suggestion.name}: "{suggestion.text}"
                          </p>
                        ))}
                      </div>
                    ) : null}
                  </>
                ) : (
                  <p className="result-empty">Nobody has voted yet. Suspiciously quiet.</p>
                )}
              </article>
            );
          })}
            </div>
          </div>
        ) : null}
      </section>

      {results?.groupNotes?.length ? (
        <section className="vote-section standings-card">
          <SectionHeader title="From the group" label="Notes" icon="forum" subtitle="Suggestions, flags, and opinions nobody asked for but everyone submitted anyway." />
          <div className="group-notes-list">
            {results.groupNotes.map((item, index) => (
              <article key={`${item.name}-${index}`} className="group-note-item">
                <strong>{item.name}:</strong> <span>{item.note}</span>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="vote-section expenses-card">
        <SectionHeader
          title="Group expenses"
          label="Splitwise but worse"
          icon="receipt_long"
          subtitle="Who paid. Who owes. Sorted."
        />

        <form className="expense-form" onSubmit={submitExpense}>
          <div className="expense-grid stacked-fields">
            <label>
              Description
              <input
                value={expenseForm.description}
                onChange={(event) => setExpenseForm((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Grocery run, cellar door, that round nobody agreed to"
                required
              />
            </label>
            <label>
              Amount (AUD)
              <input
                type="number"
                step="0.01"
                min="0"
                value={expenseForm.amount}
                onChange={(event) => setExpenseForm((prev) => ({ ...prev, amount: event.target.value }))}
                placeholder="120"
                required
              />
            </label>
            <label>
              Paid by
              <input
                list="participants"
                value={expenseForm.paidBy}
                onChange={(event) => setExpenseForm((prev) => ({ ...prev, paidBy: event.target.value }))}
                placeholder="Name of whoever paid"
                required
              />
              <datalist id="participants">
                {participantNames.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </label>
          </div>

          <div className="split-members split-among-block">
            <p className="section-label">Split</p>
            <div className="split-toggle">
              <button
                type="button"
                className={`pill ${splitMode === 'everyone' ? 'selected' : ''}`}
                onClick={() => setSplitMode('everyone')}
              >
                Everyone
              </button>
              <button
                type="button"
                className={`pill ${splitMode === 'select' ? 'selected' : ''}`}
                onClick={() => setSplitMode('select')}
              >
                Specific people
              </button>
            </div>

            {splitMode === 'select' ? (
              participantNames.length ? (
                <div className="split-chip-grid">
                  {participantNames.map((name) => (
                    <button
                      type="button"
                      key={name}
                      className={`pill ${expenseForm.splitAmong.includes(name) ? 'selected' : ''}`}
                      onClick={() => toggleSplitMember(name)}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              ) : null
            ) : null}
          </div>

          {expenseError ? <p className="error-message">{expenseError}</p> : null}

          <button type="submit" className="submit-btn">
            {expenseForm.id ? 'Update expense' : 'Add expense'}
          </button>
        </form>

        <div className="expenses-layout">
          <article className="expense-list-card">
            <h3>Recent expenses</h3>
            {expensesLoading ? (
              <p>Loading...</p>
            ) : expenses.length ? (
              <ul className="expense-list">
                {expenses.map((expense) => {
                  const isEveryone = expense.splitAmong.length === participantNames.length;
                  const splitSummary = isEveryone ? 'Everyone' : `Split ${expense.splitAmong.length} ways`;

                  return (
                    <li key={expense.id}>
                      <div>
                        <p>{expense.description}</p>
                        <small>
                          {expense.paidBy} paid ${expense.amount.toFixed(2)} · {splitSummary}
                        </small>
                      </div>
                      <div className="expense-actions">
                        <button
                          type="button"
                          className="expense-action-btn"
                          title="Edit"
                          onClick={() => {
                            const selected = new Set(expense.splitAmong || []);
                            const allSelected =
                              participantNames.length > 0 &&
                              participantNames.every((name) => selected.has(name)) &&
                              selected.size === participantNames.length;

                            setSplitMode(allSelected ? 'everyone' : 'select');
                            setExpenseForm({
                              id: expense.id,
                              description: expense.description,
                              amount: String(expense.amount),
                              paidBy: expense.paidBy,
                              splitAmong: expense.splitAmong,
                              splitType: 'equal'
                            });
                          }}
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button
                          type="button"
                          className="expense-action-btn danger"
                          title="Delete"
                          onClick={() => deleteExpense(expense.id)}
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p>No expenses yet. Enjoy it while it lasts.</p>
            )}
          </article>

          <article className="expense-list-card">
            <h3>Who owes who</h3>
            {settlement.length ? (
              <ul className="settlement-list">
                {settlement.map((row, index) => (
                  <li key={`${row.from}-${row.to}-${index}`}>
                    <strong>{row.from}</strong> owes <strong>{row.to}</strong> ${row.amount.toFixed(2)}
                  </li>
                ))}
              </ul>
            ) : expenses.length ? (
              <p>All settled up. Suspicious.</p>
            ) : (
              <p>Everyone&apos;s square. Either nothing&apos;s been spent or someone did the maths wrong.</p>
            )}
          </article>
        </div>

        {!showNameManager ? (
          <button
            type="button"
            className="name-manager-toggle"
            onClick={() => setShowNameManager(true)}
          >
            Someone not showing up in the list?
          </button>
        ) : (
          <div className="split-members name-manager-open">
            <p className="section-label">Add someone manually</p>
            <p className="fine-print">
              Names from voters and expenses are added automatically.
              Only use this if someone is genuinely missing.
            </p>
            <div className="split-toggle">
              <input
                value={groupNameInput}
                onChange={(event) => setGroupNameInput(event.target.value)}
                placeholder="Add a name"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    addCustomName();
                  }
                }}
              />
              <button type="button" className="manage-add-btn" onClick={addCustomName}>
                Add
              </button>
            </div>
            {customNames.length ? (
              <div className="split-chip-grid">
                {customNames.map((name) => (
                  <button
                    type="button"
                    key={name}
                    className="pill removable-pill"
                    onClick={() => removeCustomName(name)}
                    title="Remove"
                  >
                    {name} ×
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
