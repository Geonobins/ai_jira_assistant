import Resolver from '@forge/resolver';
import api, { route } from '@forge/api';

const resolver = new Resolver();

resolver.define('fetchIssueData', async (req) => {
  const key = req.context.extension.issue.key;

  const res = await api.asUser().requestJira(
    route`/rest/api/3/issue/${key}?fields=summary,description,labels,components,reporter`
  );

  const data = await res.json();
  const fields = data.fields;

  const summary = fields.summary;
  const description = fields.description?.content?.[0]?.content?.[0]?.text || "No description";
  const labels = fields.labels;
  const components = fields.components?.map(c => c.name) || [];
  const reporter = fields.reporter?.displayName || "Unknown";

  return {
    key,
    summary,
    description,
    labels,
    components,
    reporter
  };
});

// New resolver for GitHub repo connect
resolver.define('connectGithubRepo', async ({ payload }) => {
  const { repoUrl, githubToken } = payload;

  try {
    const response = await fetch('https://7246-103-141-57-14.ngrok-free.app/connect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ repo_url: repoUrl, github_token: githubToken })
    });

    console.log("Responsee",response);
    const text = await response.text(); // 🔥 Always get text first

    if (!response.ok) {
      let detail;
      try {
        const json = JSON.parse(text);
        detail = json.detail || text;
      } catch (e) {
        detail = text; // fallback for non-JSON error body
      }
      return { message: `❌ Failed: ${detail}` };
    }

    const result = JSON.parse(text); // 🧠 Parse only if ok
    return { message: result.message || '✅ Connected' };
  } catch (err) {
    console.error('Backend error:', err);
    return { message: '❌ Could not reach backend' };
  }
});



export const handler = resolver.getDefinitions();
