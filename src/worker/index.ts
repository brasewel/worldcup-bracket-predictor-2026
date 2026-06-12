import { handleApi } from './routes/api';
import { serveHtml } from './routes/html';
import { syncLiveScores, syncMatchStats } from './services/sync';

export interface Env {
  DB: D1Database;
  FOOTBALL_DATA_TOKEN: string;
  SPORTSAPI_KEY: string;
  ADMIN_PASSWORD: string;
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // API routes
    if (path.startsWith('/api/')) {
      const res = await handleApi(request, env);
      if (res) return res;
      return Response.json({ error: 'Not found' }, { status: 404 });
    }

    // Serve static assets (CSS, client.js) directly from Workers Assets
    if (path !== '/' && path !== '') {
      const assetResponse = await env.ASSETS.fetch(request);
      if (assetResponse.status !== 404) return assetResponse;
    }

    // SPA shell — inject runtime config and serve
    const htmlResponse = await env.ASSETS.fetch(new Request(new URL('/index.html', url)));
    const html = await htmlResponse.text();
    return serveHtml(html);
  },

  async scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    // Live scores first (worldcup26.ir owns score/status), then FD stats for finished matches only
    ctx.waitUntil(syncLiveScores(env).then(() => syncMatchStats(env)));
  },
};
