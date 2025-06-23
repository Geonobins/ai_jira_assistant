import React, { useEffect, useState } from 'react';
import { events, invoke } from '@forge/bridge';

function App() {
  const [data, setData] = useState(null);
  const [fixPlan, setFixPlan] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFetchError = () => {
    console.error('Failed to fetch issue');
  };

  useEffect(() => {
    const fetchIssueData = async () => invoke('fetchIssueData');
    fetchIssueData().then(setData).catch(handleFetchError);

    const subscription = events.on('JIRA_ISSUE_CHANGED', () => {
      fetchIssueData().then(setData).catch(handleFetchError);
    });

    return () => subscription.then((sub) => sub.unsubscribe());
  }, []);

  const generateFixPlan = async () => {
    if (!data) return;
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      setFixPlan(result.fix_plan);
    } catch (error) {
      console.error('Error generating fix plan:', error);
      setFixPlan('❌ Failed to get fix plan.');
    }
    setLoading(false);
  };

  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <h2>🧠 AI Bug Context</h2>
      <p><strong>Issue Key:</strong> {data.key}</p>
      <p><strong>Summary:</strong> {data.summary}</p>
      <p><strong>Description:</strong> {data.description}</p>
      <p><strong>Labels:</strong> {data.labels.join(', ')}</p>
      <p><strong>Components:</strong> {data.components.join(', ')}</p>
      <p><strong>Reporter:</strong> {data.reporter}</p>

      <hr />

      <button onClick={generateFixPlan} disabled={loading}>
        {loading ? '🔍 Analyzing...' : '💡 Generate Fix Plan'}
      </button>

      {fixPlan && (
        <div style={{ marginTop: '1rem', backgroundColor: '#f4f4f4', padding: '10px', borderRadius: '4px' }}>
          <strong>Fix Plan:</strong>
          <p>{fixPlan}</p>
        </div>
      )}
    </div>
  );
}

export default App;
