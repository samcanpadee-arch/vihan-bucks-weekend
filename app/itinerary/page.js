'use client';

import { useEffect, useState } from 'react';
import { accommodation, essentialsChecklist, itineraryTimeline, votingSections } from '../siteData';
import AccommodationCard from '../components/AccommodationCard';
import ItineraryTimeline from '../components/ItineraryTimeline';
import SectionHeader from '../components/SectionHeader';
import TopNav from '../components/TopNav';
import Footer from '../components/Footer';

export default function ItineraryPage() {
  const [results, setResults] = useState(null);
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
        <p className="section-label">Work in progress</p>
        <h2>The weekend, in one place.</h2>
        <p>
          Once the votes are in, this becomes the one link for the whole weekend. Bookmark it. Stop scrolling through the chat.
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

      <section className="vote-section standings-card">
        <SectionHeader title="How the votes are looking" label="Live" icon="leaderboard" subtitle="Not live-live. Hit refresh to see the latest. Yes, you have to do it manually. It&apos;s a bucks trip not a Bloomberg terminal." />
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

      <section className="vote-section">
        <SectionHeader title="Weekend timeline" label="Timeline" icon="schedule" />
        <ItineraryTimeline timeline={itineraryTimeline} />
      </section>

      <section className="vote-section">
        <SectionHeader
          title="Admin-ish"
          label="Status"
          icon="checklist"
          subtitle="Only real things. No fake logistics theatre."
        />
        <div className="group-notes-list">
          <article className="group-note-item">
            <strong>House booking:</strong> <span>Confirmed: The Meadow, Yarra Glen.</span>
          </article>
          <article className="group-note-item">
            <strong>Saturday lunch/winery booking:</strong> <span>Pending votes.</span>
          </article>
          <article className="group-note-item">
            <strong>Sunday recovery plan:</strong> <span>Likely if morale allows.</span>
          </article>
        </div>
      </section>

      <section className="vote-section">
        <SectionHeader
          title="Important notes"
          label="TBC"
          icon="priority_high"
          subtitle="Final details go here once votes lock."
        />
        <p className="fine-print">
          Driver plans, arrival windows, house logistics, and any final confirmations will be posted here once voting closes.
        </p>
      </section>

      <section className="vote-section">
        <SectionHeader
          title="Friday full timeline"
          label="TBC"
          icon="calendar_month"
          subtitle="Detailed run sheet lands after voting."
        />
      </section>

      <section className="vote-section">
        <SectionHeader
          title="Saturday full timeline"
          label="TBC"
          icon="calendar_month"
          subtitle="Detailed run sheet lands after voting."
        />
      </section>

      <section className="vote-section">
        <SectionHeader
          title="Sunday full timeline"
          label="TBC"
          icon="calendar_month"
          subtitle="Detailed run sheet lands after voting."
        />
      </section>

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
