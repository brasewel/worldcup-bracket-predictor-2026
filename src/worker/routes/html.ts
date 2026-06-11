import { DEADLINE_MS, GROUPS } from '../data/constants';

// The static HTML is served as a Worker asset. The worker injects
// runtime configuration via a small inline <script> before </head>.
export function serveHtml(htmlAsset: string): Response {
  const injected = htmlAsset.replace(
    '</head>',
    `<script>window.__DEADLINE_MS__=${DEADLINE_MS};window.__GROUPS_JSON__=${JSON.stringify(JSON.stringify(GROUPS))};</script></head>`,
  );
  return new Response(injected, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
