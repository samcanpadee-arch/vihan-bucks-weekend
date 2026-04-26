'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { votingSections } from '../siteData';

const categoryKeys = votingSections.map((section) => section.key);

function AdminPageContent() {
  const searchParams = useSearchParams();
  const providedSecret = searchParams.get('secret');
  const expectedSecret = process.env.NEXT_PUBLIC_ADMIN_SECRET;
  const isAuthorized = Boolean(providedSecret) && Boolean(expectedSecret) && providedSecret === expectedSecret;
  const [results, setResults] = useState(null);
  const [config, setConfig] = useState({ votingLocked: false, finalResults: null });
  const [finalSelections, setFinalSelections] = useState({});
  const [adminMessage, setAdminMessage] = useState('');

  const adminHeaders = useMemo(() => ({ 'x-admin-secret': providedSecret || '' }), [providedSecret]);

  const loadResults = async () => {
    const response = await fetch('/api/results', { cache: 'no-store', headers: adminHeaders });
    const data = await response.json();
    setResults(data);
  };

  const loadConfig = async () => {
    const response = await fetch('/api/admin/config', { cache: 'no-store', headers: adminHeaders });
    const data = await response.json();
    setConfig(data);
  };

  useEffect(() => {
    if (!isAuthorized) return;

    const initialize = async () => {
      await Promise.all([loadResults(), loadConfig()]);
    };
    initialize();
  }, [isAuthorized]);

  useEffect(() => {
    if (!results) return;

    const derived = {};
    for (const section of votingSections) {
      const entries = Object.entries(results.tally?.[section.key] || {}).sort((a, b) => b[1] - a[1]);
      derived[section.key] = config.finalResults?.[section.key] || entries[0]?.[0] || section.options[0]?.id || '';
    }
    setFinalSelections(derived);
  }, [results, config.finalResults]);

  if (!isAuthorized) {
    return <p>Not found.</p>;
  }

  const deleteVote = async (name) => {
    const normalizedName = name.trim().toLowerCase();
    const res = await fetch(`/api/admin/vote?name=${encodeURIComponent(normalizedName)}`, { method: 'DELETE', headers: adminHeaders });
    if (!res.ok) {
      setAdminMessage(`Failed to delete ${name}.`);
      return;
    }
    window.location.reload();
  };

  const clearAllVotes = async () => {
    if (!window.confirm('Delete every single vote? This cannot be undone.')) return;
    const res = await fetch('/api/admin/vote?all=true', { method: 'DELETE', headers: adminHeaders });
    if (!res.ok) {
      setAdminMessage('Failed to clear votes.');
      return;
    }
    window.location.reload();
  };

  const toggleVotingLock = async () => {
    await fetch('/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...adminHeaders },
      body: JSON.stringify({ votingLocked: !config.votingLocked })
    });
    await loadConfig();
  };

  const saveFinalResults = async () => {
    await fetch('/api/admin/finalise', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...adminHeaders },
      body: JSON.stringify({ finalSelections })
    });
    await loadConfig();
    await loadResults();
    setAdminMessage('Saved final results snapshot.');
  };

  const clearSavedResults = async () => {
    await fetch('/api/admin/finalise', {
      method: 'DELETE',
      headers: adminHeaders
    });
    setAdminMessage('Cleared saved results snapshot.');
  };

  const optionTitle = (sectionKey, optionId) => {
    const section = votingSections.find((item) => item.key === sectionKey);
    return section?.options.find((option) => option.id === optionId)?.title || optionId || '-';
  };

  return (
    <main className="page-shell">
      <section className="vote-section standings-card">
        <h2>Votes</h2>
        <button type="button" className="manage-add-btn" onClick={clearAllVotes}>
          Clear all
        </button>
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                {votingSections.map((section) => (
                  <th key={section.key}>{section.title}</th>
                ))}
                <th>Anything to share</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {(results?.votes || []).map((vote) => (
                <tr key={vote.name}>
                  <td>{vote.name}</td>
                  {categoryKeys.map((key) => (
                    <td key={`${vote.name}-${key}`}>{optionTitle(key, vote[key])}</td>
                  ))}
                  <td>{vote.hardConstraints || '-'}</td>
                  <td>
                    <button type="button" className="expense-action-btn danger" onClick={() => deleteVote(vote.name)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="vote-section standings-card">
        <h2>Lock voting</h2>
        <button type="button" className="manage-add-btn" onClick={toggleVotingLock}>
          {config.votingLocked ? 'Voting is locked -- click to reopen' : 'Voting is open -- click to lock'}
        </button>
      </section>

      <section className="vote-section standings-card">
        <h2>Finalise results</h2>
        <div className="field-grid">
          {votingSections.map((section) => (
            <label key={section.key}>
              {section.title}
              <select
                value={finalSelections[section.key] || ''}
                onChange={(event) =>
                  setFinalSelections((prev) => ({
                    ...prev,
                    [section.key]: event.target.value
                  }))
                }
              >
                {section.options.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.title}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
        <div className="split-toggle">
          <button type="button" className="manage-add-btn" onClick={saveFinalResults}>
            Save final results
          </button>
          <button type="button" className="pill" onClick={clearSavedResults}>
            Clear saved results
          </button>
        </div>
        {adminMessage ? <p className="field-note">{adminMessage}</p> : null}
      </section>
    </main>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<p>Not found.</p>}>
      <AdminPageContent />
    </Suspense>
  );
}
