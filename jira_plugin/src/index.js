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

  // 🚨 In a real app, you'd securely store these
  console.log(`Received GitHub Repo URL: ${repoUrl}`);
  console.log(`Received GitHub Token: ${githubToken.slice(0, 4)}...`);

  // Optionally validate the token with GitHub
  // Example only:
  // const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
  //   headers: {
  //     Authorization: `token ${githubToken}`
  //   }
  // });

  return { message: 'GitHub repo connected!' };
});

export const handler = resolver.getDefinitions();
