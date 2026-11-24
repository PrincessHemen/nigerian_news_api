import { Router } from 'express'

const router = Router()

const page = /* html */ `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Nigerian News API</title>
<style>
  :root {
    --bg: #F4F6F6; --fg: #1a1a1a; --muted: #6b6b6b;
    --card: #f5f5f4; --border: #e2e2df; --accent: #0a7d3c;
    color-scheme: light dark;
  }
  @media (prefers-color-scheme: dark) {
    :root { --bg: #121212; --fg: #ececec; --muted: #9a9a9a;
            --card: #1c1c1c; --border: #2e2e2e; --accent: #3ddc84; }
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--fg);
         font: 16px/1.6 system-ui, -apple-system, Segoe UI, sans-serif; }
  main { max-width: 760px; margin: 0 auto; padding: 48px 20px 80px; }
  h1 { font-size: 2rem; margin: 0 0 6px; }
  h2 { font-size: 1.2rem; margin: 40px 0 12px; }
  p { margin: 0 0 12px; }
  .tag { color: var(--muted); }
  .badge { display: inline-block; font-size: .75rem; padding: 2px 8px; border-radius: 999px;
           background: var(--accent); color: #fff; margin-left: 8px; vertical-align: middle; }
  .card { background: var(--card); border: 1px solid var(--border);
          border-radius: 10px; padding: 16px; margin-bottom: 12px; }
  .method { font-weight: 700; color: var(--accent); margin-right: 8px; }
  code, pre { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .85rem; }
  pre { background: var(--card); border: 1px solid var(--border); border-radius: 10px;
        padding: 14px; overflow-x: auto; margin: 8px 0 0; }
  table { width: 100%; border-collapse: collapse; font-size: .9rem; }
  th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid var(--border); }
  a { color: var(--accent); }
  .soon { opacity: .65; }
</style>


</head>

<body>
<main>
  <h1>Nigerian News API <span class="badge">live</span></h1>
  <p class="tag">Headlines from Nigerian news sites, scraped and normalized into one consistent JSON shape.</p>

  <h2>Base URL</h2>
  <pre id="base"></pre>

  <h2>Endpoints</h2>
  <div class="card">
    <p><span class="method">GET</span><code>/api/articles</code></p>
    <p>Returns the latest articles from every registered source, in one normalized format.
       Sources that fail to respond are listed in <code>errors</code> instead of breaking the whole response.</p>
    <pre id="curl"></pre>
  </div>

  <div class="card">
    <p><span class="method">GET</span><code>/api/sources</code></p>
    <p>Returns the list of news sources the API pulls from. Use a source's <code>id</code>
       to match it against the <code>sourceId</code> field on articles.</p>
    <pre id="curl-sources"></pre>
  </div>

  <h2>Example response</h2>
<pre>{
  "articles": [
    {
      "title": "FG announces new fuel subsidy plan",
      "url": "https://punchng.com/fg-announces-new-fuel-subsidy-plan",
      "image": "https://punchng.com/img/fuel.jpg",
      "publishedAt": "2026-09-21T08:15:00.000Z",
      "author": "Chidi Okafor",
      "sourceId": "punch"
    }
  ],
  "errors": [
    { "source": "premiumtimes", "error": "https://... returned 403" }
  ]
}</pre>

  <h2>Article fields</h2>
  <div class="card">
    <table>
      <tr><th>Field</th><th>Type</th><th>Notes</th></tr>
      <tr><td><code>title</code></td><td>string</td><td>Always present</td></tr>
      <tr><td><code>url</code></td><td>string</td><td>Always present, absolute link to the original story</td></tr>
      <tr><td><code>image</code></td><td>string | null</td><td>Lead image if the source provides one</td></tr>
      <tr><td><code>publishedAt</code></td><td>string | null</td><td>ISO 8601 timestamp</td></tr>
      <tr><td><code>author</code></td><td>string | null</td><td>If the source provides one</td></tr>
      <tr><td><code>sourceId</code></td><td>string</td><td>Which site it came from, e.g. <code>punch</code></td></tr>
    </table>
  </div>

  <h2>Current sources</h2>
  <p><code>punch</code>, <code>premiumtimes</code></p>

  <h2>Errors</h2>
  <div class="card">
    <table>
      <tr><th>Status</th><th>Meaning</th></tr>
      <tr><td><code>404</code></td><td>Route doesn't exist</td></tr>
      <tr><td><code>500</code></td><td>Scraping failed on the server side</td></tr>
    </table>
  </div>

  <p class="tag" style="margin-top:40px">Authentication and rate limiting are planned and not yet enabled.</p>
</main>


<script>
  const origin = location.origin;
  document.getElementById('base').textContent = origin + '/api';
  document.getElementById('curl').textContent = 'curl ' + origin + '/api/articles';
  document.getElementById('curl-sources').textContent = 'curl ' + origin + '/api/sources';
</script>

</body>

</html>`

router.get('/', (_req, res) => {
    res.type('html').send(page)
})

export default router