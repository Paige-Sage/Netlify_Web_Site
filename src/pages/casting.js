import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';

// ─── Constants ─────────────────────────────────────────────────────────────────
// Public, PII-free casting feed served by the castingnotify read-api (Azure Function).
const API_URL = 'https://func-cn-readapi-f9edd8.azurewebsites.net/api/feed';

// Fixed, allowlisted buckets — sections/classes are NEVER derived from arbitrary feed values.
const SECTIONS = [
    { bucket: 'strong', label: 'Strong matches', accent: 'border-green-500', dot: 'bg-green-500' },
    { bucket: 'union_caution', label: 'Union — worth a look (Taft-Hartley)', accent: 'border-purple-500', dot: 'bg-purple-500' },
    { bucket: 'possible', label: 'Possible', accent: 'border-amber-500', dot: 'bg-amber-500' }
];
const KNOWN_BUCKETS = new Set(SECTIONS.map((s) => s.bucket));
const DIST_LABEL = {
    '<=10mi': 'within 10 mi',
    '<=25mi': 'within 25 mi',
    '<=60mi': 'within 60 mi',
    remote: 'remote'
};

// ─── Utility helpers ──────────────────────────────────────────────────────────
// Only allow absolute http/https URLs with no embedded credentials (defense-in-depth;
// the server already strips query/fragment and host-allowlists, but the SPA validates too).
function safeUrl(raw) {
    if (!raw || typeof raw !== 'string') return null;
    try {
        const u = new URL(raw);
        if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
        if (u.username || u.password) return null;
        return u;
    } catch (e) {
        return null;
    }
}

function timeAgo(iso) {
    const t = Date.parse(iso);
    if (isNaN(t)) return '';
    const s = Math.max(0, Math.floor((Date.now() - t) / 1000));
    if (s < 90) return 'just now';
    const m = Math.floor(s / 60);
    if (m < 60) return `${m} min ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} ${h === 1 ? 'hour' : 'hours'} ago`;
    const d = Math.floor(h / 24);
    return `${d} ${d === 1 ? 'day' : 'days'} ago`;
}

function Card({ entry }) {
    const u = safeUrl(entry.url);
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <h3 className="text-base font-semibold text-gray-900">
                {entry.title || 'Untitled'}
                {entry.org ? <span className="font-normal text-gray-500"> · {entry.org}</span> : null}
            </h3>
            <div className="flex flex-wrap gap-1.5 mt-2">
                {entry.is_new ? (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-green-600 text-white">NEW</span>
                ) : null}
                {entry.type ? (
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                        {String(entry.type).replace(/_/g, ' ')}
                    </span>
                ) : null}
                {entry.locality && entry.locality !== 'unknown' ? (
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">{entry.locality}</span>
                ) : null}
                {entry.distance_band ? (
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                        📍 {DIST_LABEL[entry.distance_band] || entry.distance_band}
                    </span>
                ) : null}
                {entry.deadline ? (
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">due {entry.deadline}</span>
                ) : null}
            </div>
            {Array.isArray(entry.reasons) && entry.reasons.length ? (
                <div className="text-sm text-gray-500 mt-2">{entry.reasons.join(' · ')}</div>
            ) : null}
            {u ? (
                <div className="mt-2 text-sm">
                    <a
                        href={u.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        referrerPolicy="no-referrer"
                        className="text-purple-600 hover:underline font-medium"
                    >
                        open listing ↗
                    </a>
                    <span className="text-xs text-gray-400 ml-2">{u.hostname}</span>
                </div>
            ) : null}
        </div>
    );
}

export default function Casting() {
    const [feed, setFeed] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notReady, setNotReady] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        setNotReady(false);
        try {
            const res = await fetch(API_URL, { method: 'GET', credentials: 'omit' });
            if (res.status === 503) {
                setNotReady(true);
                setFeed(null);
                setError(null);
                return;
            }
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setFeed(data);
            setNotReady(false);
            setError(null);
        } catch (e) {
            setError('Couldn’t load opportunities right now. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Defensive grouping: drop any entry whose bucket isn't one of the three known buckets.
    const entries = feed && Array.isArray(feed.entries) ? feed.entries : [];
    const byBucket = { strong: [], union_caution: [], possible: [] };
    entries.forEach((e) => {
        if (e && KNOWN_BUCKETS.has(e.bucket)) byBucket[e.bucket].push(e);
    });
    const updated = feed ? timeAgo(feed.generated_at) : '';
    const shownCount = byBucket.strong.length + byBucket.union_caution.length + byBucket.possible.length;

    return (
        <>
            <Head>
                <title>Casting opportunities — Sage</title>
                <meta name="description" content="Current youth casting and audition opportunities for Sage." />
                <meta name="robots" content="noindex" />
            </Head>

            <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                    <nav className="flex items-center gap-5">
                        <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                            Home
                        </Link>
                        <Link href="/blog" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                            Blog
                        </Link>
                        <Link href="/about" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                            About
                        </Link>
                        <span className="text-sm font-bold text-purple-700">🎭 Casting</span>
                    </nav>
                    <button
                        onClick={fetchData}
                        title="Refresh"
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors text-base"
                    >
                        ↻
                    </button>
                </div>
            </header>

            <main className="bg-gray-50 min-h-screen">
                <div className="max-w-5xl mx-auto px-4 py-8">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">🎭 Casting opportunities</h1>
                        <p className="text-gray-500 text-sm">
                            Auditions and youth-development calls, aggregated automatically.
                            {feed ? ` Updated ${updated || 'recently'} · ${shownCount} opportunities.` : ''}
                        </p>
                    </div>

                    {loading && !feed && !notReady && !error ? (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-16 text-center">
                            <div className="text-gray-400 text-lg animate-pulse">Loading opportunities…</div>
                        </div>
                    ) : null}

                    {notReady ? (
                        <div className="bg-white rounded-xl border border-amber-200 shadow-sm p-10 text-center">
                            <div className="text-amber-700 font-medium">The feed isn’t published yet — check back soon.</div>
                        </div>
                    ) : null}

                    {error ? (
                        <div className="bg-white rounded-xl border border-red-200 shadow-sm p-10 text-center">
                            <div className="text-red-500 font-medium mb-3">{error}</div>
                            <button onClick={fetchData} className="text-sm text-purple-600 hover:underline">
                                Try again
                            </button>
                        </div>
                    ) : null}

                    {feed && !error
                        ? SECTIONS.map((s) => (
                              <section key={s.bucket} className="mb-8">
                                  <h2 className={`flex items-center gap-2 text-lg font-semibold text-gray-900 border-b-2 ${s.accent} pb-1 mb-3`}>
                                      <span className={`inline-block w-2.5 h-2.5 rounded-full ${s.dot}`} />
                                      {s.label} ({byBucket[s.bucket].length})
                                  </h2>
                                  {byBucket[s.bucket].length === 0 ? (
                                      <p className="text-sm text-gray-400 italic">None right now.</p>
                                  ) : (
                                      <div className="grid gap-3">
                                          {byBucket[s.bucket].map((e) => (
                                              <Card key={e.id} entry={e} />
                                          ))}
                                      </div>
                                  )}
                              </section>
                          ))
                        : null}

                    <footer className="text-xs text-gray-400 mt-10">
                        Listings are aggregated automatically; always confirm details on the original listing.
                        This page shows no personal information.
                    </footer>
                </div>
            </main>
        </>
    );
}
