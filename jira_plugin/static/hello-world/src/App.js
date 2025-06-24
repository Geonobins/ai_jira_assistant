import React, { useEffect, useState } from 'react';
import { events, invoke } from '@forge/bridge';

function App() {
  const [data, setData] = useState(null);
  const [fixPlan, setFixPlan] = useState('');
  const [loading, setLoading] = useState(false);

  const [repoUrl, setRepoUrl] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [connectStatus, setConnectStatus] = useState('');

  useEffect(() => {
    const fetchIssueData = async () => invoke('fetchIssueData');
    fetchIssueData().then(setData).catch(() => console.error('Failed to fetch issue'));
    const subscription = events.on('JIRA_ISSUE_CHANGED', () => {
      fetchIssueData().then(setData).catch(() => console.error('Failed to fetch issue'));
    });
    return () => subscription.then((sub) => sub.unsubscribe());
  }, []);

  const generateFixPlan = async () => {
    if (!data) return;
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      setFixPlan(result.fix_plan);
    } catch (error) {
      console.error('Fix plan error:', error);
      setFixPlan('❌ Failed to get fix plan.');
    }
    setLoading(false);
  };

  const connectGithub = async () => {
    setConnectStatus('🔄 Connecting...');
    try {
      const result = await invoke('connectGithubRepo', { repoUrl, githubToken });
      setConnectStatus(`✅ ${result.message}`);
    } catch (error) {
      console.error('GitHub connect error:', error);
      setConnectStatus('❌ Invalid repo or token');
    }
  };

  if (!data) return <div style={{ padding: 20 }}>Loading Jira issue details...</div>;

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '1rem', maxWidth: 700, margin: 'auto' }}>
      <h2 style={{ marginBottom: '0.5rem' }}>🧠 AI Bug Context</h2>
      <div style={{ marginBottom: '1rem', lineHeight: 1.5 }}>
        <p><strong>Issue Key:</strong> {data.key}</p>
        <p><strong>Summary:</strong> {data.summary}</p>
        <p><strong>Description:</strong> {data.description}</p>
        <p><strong>Labels:</strong> {data.labels.join(', ')}</p>
        <p><strong>Components:</strong> {data.components.join(', ')}</p>
        <p><strong>Reporter:</strong> {data.reporter}</p>
      </div>

      <hr style={{ margin: '1.5rem 0' }} />

      <h3>🔗 Connect GitHub Repository</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <input
          type="text"
          placeholder="GitHub Repo URL (e.g., https://github.com/user/repo)"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input
          type="password"
          placeholder="GitHub PAT (scopes: repo, read:user)"
          value={githubToken}
          onChange={(e) => setGithubToken(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button
          onClick={connectGithub}
          style={{
            padding: '0.6rem',
            backgroundColor: '#24292e',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🔐 Connect GitHub Repo
        </button>
        {connectStatus && <p style={{ fontStyle: 'italic' }}>{connectStatus}</p>}
      </div>

      <hr style={{ margin: '1.5rem 0' }} />

      <button
        onClick={generateFixPlan}
        disabled={loading}
        style={{
          padding: '0.75rem',
          fontSize: '1rem',
          backgroundColor: loading ? '#ddd' : '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? '🔍 Analyzing...' : '💡 Generate Fix Plan'}
      </button>

      {fixPlan && (
        <div style={{ marginTop: '1.5rem', backgroundColor: '#f0f0f0', padding: '1rem', borderRadius: '6px' }}>
          <strong>🛠️ Fix Plan:</strong>
          <p>{fixPlan}</p>
        </div>
      )}
    </div>
  );
}

export default App;
