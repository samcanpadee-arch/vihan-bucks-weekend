'use client';

import { useEffect, useState } from 'react';
import { accommodation, bookingStatus, essentialsChecklist, itineraryTimeline, votingSections } from '../siteData';
import AccommodationCard from '../components/AccommodationCard';
import ItineraryTimeline from '../components/ItineraryTimeline';
import SectionHeader from '../components/SectionHeader';
import TopNav from '../components/TopNav';
import Footer from '../components/Footer';

export default function ItineraryPage() {
  const [results, setResults] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [expensesLoading, setExpensesLoading] = useState(true);
  const [expenseError, setExpenseError] = useState('');
  const [expenseForm, setExpenseForm] = useState({
    id: '',
    description: '',
    amount: '',
    paidBy: '',
    splitAmong: [],
    splitType: 'equal'
  });

  const participantNames = Array.from(
    new Set([
      ...(results?.voterNames || []),
      ...expenses.flatMap((expense) => [expense.paidBy, ...(expense.splitAmong || [])].filter(Boolean))
    ])
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
        setExpenseError('Could not load expenses right now.');
      } finally {
        setExpensesLoading(false);
      }
    };

    loadResults();
    loadExpenses();
  }, []);

  useEffect(() => {
    if (!participantNames.length) return;
    setExpenseForm((prev) => {
      if (prev.splitAmong.length > 0) return prev;
      return {
        ...prev,
        splitAmong: participantNames
      };
    });
  }, [participantNames]);

  const toggleSplitMember = (name) => {
    setExpenseForm((prev) => ({
      ...prev,
      splitAmong: prev.splitAmong.includes(name)
        ? prev.splitAmong.filter((member) => member !== name)
        : [...prev.splitAmong, name]
    }));
  };

  const submitExpense = async (event) => {
    event.preventDefault();
    setExpenseError('');
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
          splitAmong: expenseForm.splitAmong
        })
      });

      if (!response.ok) throw new Error('Expense save failed');
      const data = await response.json();

      setExpenses((prev) => {
        const withoutCurrent = prev.filter((item) => item.id !== data.expense.id);
        return [data.expense, ...withoutCurrent];
      });
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
      setExpenseError('Could not save expense right now.');
    }
  };

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

      <section className="vote-section standings-card">
        <SectionHeader title="Voting standings" label="Live" icon="leaderboard" subtitle="Quick snapshot of what's leading right now" />
        {results?.voterCount ? (
          <div className="standings-mini-grid">
            {votingSections.slice(0, 3).map((section) => {
              const entries = Object.entries(results.tally?.[section.key] || {});
              const [winner, count] = entries.sort((a, b) => b[1] - a[1])[0] || [];
              const winnerLabel = section.options.find((option) => option.id === winner)?.title || winner;

              return (
                <article key={section.key} className="standings-mini-item">
                  <p>{section.title}</p>
                  <strong>{winnerLabel || 'No picks yet'}</strong>
                  <small>{count ? `${count} votes` : '0 votes'}</small>
                </article>
              );
            })}
          </div>
        ) : (
          <p>No votes yet. Standings will show once submissions start rolling in.</p>
        )}
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

      <section className="vote-section expenses-card">
        <SectionHeader
          title="Shared expenses"
          label="Splitwise-ish"
          icon="receipt_long"
          subtitle="Track who paid and who owes what."
        />

        <form className="expense-form" onSubmit={submitExpense}>
          <div className="expense-grid">
            <label>
              Description
              <input
                value={expenseForm.description}
                onChange={(event) => setExpenseForm((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Grocery run"
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
                placeholder="Sam"
                required
              />
              <datalist id="participants">
                {participantNames.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </label>
          </div>

          <div className="split-members">
            <p className="section-label">Split among</p>
            {participantNames.length ? (
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
            ) : (
              <p>Add votes first so participant names are available for equal split.</p>
            )}
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
              <p>Loading expenses...</p>
            ) : expenses.length ? (
              <ul className="expense-list">
                {expenses.map((expense) => (
                  <li key={expense.id}>
                    <div>
                      <p>{expense.description}</p>
                      <small>
                        {expense.paidBy} paid ${expense.amount.toFixed(2)} · split {expense.splitAmong.join(', ')}
                      </small>
                    </div>
                    <button
                      type="button"
                      className="option-link"
                      onClick={() =>
                        setExpenseForm({
                          id: expense.id,
                          description: expense.description,
                          amount: String(expense.amount),
                          paidBy: expense.paidBy,
                          splitAmong: expense.splitAmong,
                          splitType: 'equal'
                        })
                      }
                    >
                      Edit
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No expenses yet. Add the first one above.</p>
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
            ) : (
              <p>Settlements will appear once expenses are added.</p>
            )}
          </article>
        </div>
      </section>

      <Footer />
    </main>
  );
}
