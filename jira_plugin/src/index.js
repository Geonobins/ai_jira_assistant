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

export const handler = resolver.getDefinitions();
