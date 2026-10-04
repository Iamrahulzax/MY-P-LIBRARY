/**
 * Production-Hardened Security Gateway & API Proxy Server
 * 
 * Capabilities:
 * - Zero external dependencies (uses native Node.js standard library)
 * - Strict Security Headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
 * - CORS Origin Whitelisting (No wildcard credentials)
 * - IP-Based Sliding-Window Rate Limiting (DoS and brute-force mitigation)
 * - Secure API Key Proxy (hides TMDB & RAWG keys from client-side network inspectors)
 * - Path Traversal Prevention (blocks ../ and hidden file access like .env, .git)
 * - Production Debug Mode Off (no stack trace leakage)
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3001;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Server-side secret keys (never exposed to browser bundles)
const TMDB_API_KEY = process.env.TMDB_API_KEY || process.env.MOVIE_API_KEY || '';
const RAWG_API_KEY = process.env.RAWG_API_KEY || process.env.GAME_API_KEY || '';

// --- 1. IP-BASED RATE LIMITER ---
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // 60 requests/min per IP
const ipRequestCounts = new Map();

function checkIpRateLimit(ip) {
  const now = Date.now();
  const entry = ipRequestCounts.get(ip);

  if (!entry || now - entry.startTime > RATE_LIMIT_WINDOW_MS) {
    ipRequestCounts.set(ip, { count: 1, startTime: now });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1 };
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfterSec = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - entry.startTime)) / 1000);
    return { allowed: false, remaining: 0, retryAfter: retryAfterSec };
  }

  entry.count += 1;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - entry.count };
}

// Clean up stale rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of ipRequestCounts.entries()) {
    if (now - data.startTime > RATE_LIMIT_WINDOW_MS) {
      ipRequestCounts.delete(ip);
    }
  }
}, 5 * 60 * 1000);

// --- 2. SECURITY HEADERS ---
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https://api.themoviedb.org https://api.rawg.io; frame-ancestors 'none'; object-src 'none'; base-uri 'self';"
};

// --- 3. CORS WHITELIST ---
const ALLOWED_ORIGINS = new Set([
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001'
]);

function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Max-Age', '86400');
  }
}

// --- 4. HTTPS FETCH HELPER ---
function fetchHttpsJson(targetUrl) {
  return new Promise((resolve, reject) => {
    https.get(targetUrl, { headers: { 'User-Agent': 'VaultShelfSecurityProxy/1.0' } }, (res) => {
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(rawData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// MIME Types for static files
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

// --- 5. MAIN REQUEST ROUTER ---
const server = http.createServer(async (req, res) => {
  // Apply standard security headers
  for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
    res.setHeader(header, value);
  }

  // Handle CORS
  setCorsHeaders(req, res);
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

  // Apply rate limiter
  const rateLimit = checkIpRateLimit(clientIp);
  res.setHeader('X-RateLimit-Remaining', rateLimit.remaining);
  if (!rateLimit.allowed) {
    res.writeHead(429, {
      'Content-Type': 'application/json',
      'Retry-After': String(rateLimit.retryAfter)
    });
    res.end(JSON.stringify({
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Try again in ${rateLimit.retryAfter} seconds.`
    }));
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // --- API ROUTE: HEALTH CHECK ---
  if (pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      mode: IS_PRODUCTION ? 'production' : 'development',
      debug: false,
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // --- API ROUTE: TMDB SECURE PROXY ---
  if (pathname === '/api/proxy/movie') {
    const query = parsedUrl.query.query;
    const year = parsedUrl.query.year;

    if (!query || typeof query !== 'string') {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing required query parameter: query' }));
      return;
    }

    if (!TMDB_API_KEY) {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Proxy TMDB Key Not Configured',
        message: 'Server has no TMDB_API_KEY set. Configure in environment or use client-side vault.'
      }));
      return;
    }

    try {
      const yearParam = year ? `&year=${encodeURIComponent(String(year))}` : '';
      const tmdbEndpoint = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}${yearParam}`;
      const response = await fetchHttpsJson(tmdbEndpoint);

      if (response.data && response.data.results && response.data.results.length > 0) {
        const best = response.data.results[0];
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          title: best.title,
          posterUrl: best.poster_path ? `https://image.tmdb.org/t/p/w500${best.poster_path}` : null,
          releaseYear: best.release_date ? parseInt(best.release_date.slice(0, 4), 10) : undefined,
          overview: best.overview,
          rating: best.vote_average
        }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'No match found on TMDB' }));
      }
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal proxy fetch error' }));
    }
    return;
  }

  // --- API ROUTE: RAWG SECURE PROXY ---
  if (pathname === '/api/proxy/game') {
    const search = parsedUrl.query.search;

    if (!search || typeof search !== 'string') {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing required query parameter: search' }));
      return;
    }

    if (!RAWG_API_KEY) {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Proxy RAWG Key Not Configured',
        message: 'Server has no RAWG_API_KEY set. Configure in environment or use client-side vault.'
      }));
      return;
    }

    try {
      const rawgEndpoint = `https://api.rawg.io/api/games?search=${encodeURIComponent(search)}&key=${RAWG_API_KEY}&page_size=1`;
      const response = await fetchHttpsJson(rawgEndpoint);

      if (response.data && response.data.results && response.data.results.length > 0) {
        const game = response.data.results[0];
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          title: game.name,
          coverUrl: game.background_image || null,
          releaseYear: game.released ? parseInt(game.released.slice(0, 4), 10) : undefined,
          genres: game.genres?.map((g) => g.name)
        }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'No match found on RAWG' }));
      }
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal proxy fetch error' }));
    }
    return;
  }

  // --- 6. SAFE STATIC FILE SERVING ---
  // Block directory traversal & hidden file access
  if (pathname.includes('..') || pathname.includes('.env') || pathname.includes('.git') || pathname.includes('.oxlintrc')) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Access Denied: Protected System Resource');
    return;
  }

  // Determine root directory for file
  let safeFilePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);

  // If path doesn't exist, check my-media-library/dist for SPA assets
  if (!fs.existsSync(safeFilePath)) {
    const distPath = path.join(__dirname, 'my-media-library', 'dist', pathname);
    if (fs.existsSync(distPath)) {
      safeFilePath = distPath;
    }
  }

  // Check if file exists
  fs.stat(safeFilePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // If SPA subroute, serve media library or root index
      const spaIndex = path.join(__dirname, 'my-media-library', 'dist', 'index.html');
      if (fs.existsSync(spaIndex)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        fs.createReadStream(spaIndex).pipe(res);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      }
      return;
    }

    const ext = path.extname(safeFilePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(safeFilePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`[Security Server] Shield active on http://localhost:${PORT}`);
  console.log(`[Security Server] Mode: ${IS_PRODUCTION ? 'Production' : 'Development'} (Debug: OFF)`);
  console.log(`[Security Server] Rate limiting & CORS protection enabled.`);
});
