import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';

// ─── Constants ─────────────────────────────────────────────────────────────────
const API_URL = 'https://broadwaybound.org/wp-json/wp/v2/contestants?contest_category=101&per_page=100';
const VOTE_URL = 'https://broadwaybound.org/karaoke-contest-2026-voting/';
const CONTEST_END_UTC = new Date('2026-04-13T05:00:00.000Z'); // April 12 10 PM PT
const PERFORMANCE_CUTOFF = 6;
const POLL_MS = 30_000;

// Names to highlight (gold/amber) — checked against the "performers" portion of each title
const HIGHLIGHT_NAMES = ['sage', 'paige', 'lucinda'];

// Family/friend names to subtly highlight (light grey, no star)
const FAMILY_NAMES = ['griffin'];

// ─── Song → Show lookup (embedded from song-lookup.json) ──────────────────────
const SONG_LOOKUP = {
    '9 to 5': '9 to 5: The Musical',
    'anything you can do': 'Annie Get Your Gun',
    'bare necessities': 'The Jungle Book',
    'born to entertain': 'Ruthless!',
    breathe: 'In the Heights',
    'bring him home': 'Les Misérables',
    burn: 'Hamilton',
    'dancing queen': 'Mamma Mia!',
    'defying gravity': 'Wicked',
    "don't rain on my parade": 'Funny Girl',
    'ex wives': 'Six',
    'friend like me': 'Aladdin',
    'giants in the sky': 'Into the Woods',
    'girl scout': 'Beetlejuice',
    'good girl winnie foster': 'Tuck Everlasting',
    'growing up': 'Merrily We Roll Along',
    'hakuna matata': 'The Lion King',
    'heaven help my heart': 'Chess: The Musical',
    'hopelessly devoted to you': 'Grease',
    "how far i'll go": 'Moana',
    "i'm breaking down": 'Falsettos',
    'in the big blue world': 'Finding Nemo',
    "letter from harry's mother": 'Suffs',
    'love is an open door': 'Frozen',
    'manhattan bridge': 'Next Thing You Know',
    'might as well go to hell': 'Gutenberg! The Musical',
    'more is better': 'Mean Girls',
    'my man': 'Funny Girl',
    'no good deed': 'Wicked',
    'once upon a december': 'Anastasia',
    popular: 'Wicked',
    pulled: 'The Addams Family',
    'pure imagination': 'Willy Wonka',
    'razzle dazzle': 'Chicago',
    'say no to this': 'Hamilton',
    'she used to be mine': 'Waitress',
    'so long, farewell': 'The Sound of Music',
    'someone gets hurt': 'Mean Girls',
    'suddenly seymour': 'Little Shop of Horrors',
    'talk to the moon': null,
    'the other side': 'The Greatest Showman',
    'the schuyler sisters': 'Hamilton',
    'the scuttlebutt': 'The Little Mermaid',
    'the winner takes it all': 'Mamma Mia!',
    'the wizard and i': 'Wicked',
    'this is the moment': 'Jekyll & Hyde',
    'times are hard for dreamers': 'Amélie, the Musical',
    tomorrow: 'Annie',
    'waiting on a miracle': 'Encanto',
    "what i've been looking for": 'High School Musical',
    "what's your name, man?": 'Hamilton',
    'when he sees me': 'Waitress',
    'when i grow up': "Roald Dahl's Matilda",
    'will you fall in love with me again': 'Epic: The Musical',
    'winner takes it all': 'Mamma Mia!',
    'you and me (but mostly me)': 'The Book of Mormon',
    "you'll be back": 'Hamilton'
};

// ─── Utility helpers ──────────────────────────────────────────────────────────
function decodeEntities(str) {
    return String(str)
        .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&apos;/g, "'");
}

function parseTitle(raw) {
    const decoded = decodeEntities(raw.trim());
    // "Entry #NN: Song Name – Performers"
    const m = decoded.match(/^Entry\s*#(\d+):\s*(.+?)\s*[–—]+(.*?)$/);
    if (m) return { entryNumber: m[1].padStart(2, '0'), songName: m[2].trim(), performers: m[3].trim() };
    const m2 = decoded.match(/^Entry\s*#(\d+):\s*(.+)$/);
    if (m2) return { entryNumber: m2[1].padStart(2, '0'), songName: m2[2].trim(), performers: '' };
    return { entryNumber: '', songName: decoded, performers: '' };
}

function normalizeKey(s) {
    return String(s).replace(/['']/g, "'").replace(/[""]/g, '"').toLowerCase();
}

function lookupShow(songName) {
    if (!songName) return '';
    const val = SONG_LOOKUP[normalizeKey(songName)];
    return val || '';
}

function isHighlighted(performers) {
    if (!performers) return false;
    const lower = performers.toLowerCase();
    return HIGHLIGHT_NAMES.some((name) => lower.includes(name));
}

function isFamilyHighlighted(performers) {
    if (!performers) return false;
    const lower = performers.toLowerCase();
    return FAMILY_NAMES.some((name) => lower.includes(name));
}

function formatCountdown(ms) {
    if (ms <= 0) return 'Voting has ended';
    const s = Math.floor(ms / 1000);
    const days = Math.floor(s / 86400);
    const hrs = Math.floor((s % 86400) / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return days > 0 ? `${days}d ${pad(hrs)}h ${pad(mins)}m ${pad(secs)}s` : `${pad(hrs)}h ${pad(mins)}m ${pad(secs)}s`;
}

function formatTime(date) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' });
}

// ─── Page component ───────────────────────────────────────────────────────────
export default function KaraokeContest2026() {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('votes');
    const [lastUpdated, setLastUpdated] = useState(null);
    const [countdown, setCountdown] = useState('');

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch(API_URL);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const raw = await res.json();
            const parsed = raw.map((c) => {
                const { entryNumber, songName, performers } = parseTitle(c.title.rendered);
                return {
                    id: c.id,
                    entryNumber,
                    songName,
                    show: lookupShow(songName),
                    performers,
                    votes: parseInt(c.votes_count, 10) || 0,
                    views: parseInt(c.votes_viewers, 10) || 0,
                    link: c.link || VOTE_URL,
                    highlighted: isHighlighted(performers),
                    familyHighlighted: !isHighlighted(performers) && isFamilyHighlighted(performers)
                };
            });
            setEntries(parsed);
            setLastUpdated(new Date());
            setError(null);
        } catch (e) {
            setError('Could not load leaderboard data. Check your connection and try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial fetch + 30-second polling
    useEffect(() => {
        fetchData();
        const id = setInterval(fetchData, POLL_MS);
        return () => clearInterval(id);
    }, [fetchData]);

    // Countdown clock
    useEffect(() => {
        const tick = () => setCountdown(formatCountdown(CONTEST_END_UTC - new Date()));
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    const sortedByVotes = [...entries].sort((a, b) => b.votes - a.votes);
    const cutoffVotes = sortedByVotes[PERFORMANCE_CUTOFF - 1]?.votes ?? 0;

    const sorted = [...entries].sort((a, b) => (sortBy === 'votes' ? b.votes - a.votes : b.views - a.views));

    const votingEnded = new Date() >= CONTEST_END_UTC;

    return (
        <>
            <Head>
                <title>Karaoke Contest 2026 Leaderboard | Our Cute Animals</title>
                <meta
                    name="description"
                    content="Live leaderboard for the Broadway Bound Sings Karaoke Contest 2026. Track Sage & Paige and Lucinda's standings in real time!"
                />
            </Head>

            {/* ── Navigation header ── */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
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
                        <span className="text-sm font-bold text-purple-700">🎤 Karaoke 2026</span>
                    </nav>
                    <a
                        href={VOTE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                    >
                        Vote Now →
                    </a>
                </div>
            </header>

            <main className="bg-gray-50 min-h-screen">
                <div className="max-w-6xl mx-auto px-4 py-8">
                    {/* ── Page title ── */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">🎭 Karaoke Contest 2026 Leaderboard</h1>
                        <p className="text-gray-500 text-sm">Broadway Bound Sings · Spring 2026 · Top 6 performers earn a spot on stage</p>
                    </div>

                    {/* ── Status bar ── */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-5 flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex flex-wrap gap-8">
                            <div>
                                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">{votingEnded ? 'Contest Status' : 'Voting Closes In'}</div>
                                <div className={`text-xl font-mono font-bold tabular-nums ${votingEnded ? 'text-gray-500' : 'text-purple-700'}`}>
                                    {countdown}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Last Updated</div>
                                <div className="text-sm font-medium text-gray-700">{lastUpdated ? formatTime(lastUpdated) : '—'}</div>
                            </div>
                            {entries.length > 0 && (
                                <div>
                                    <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Contestants</div>
                                    <div className="text-sm font-medium text-gray-700">{entries.length}</div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500">Sort by:</span>
                            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
                                <button
                                    onClick={() => setSortBy('votes')}
                                    className={`px-3 py-1.5 font-medium transition-colors ${
                                        sortBy === 'votes' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    🗳 Votes
                                </button>
                                <button
                                    onClick={() => setSortBy('views')}
                                    className={`px-3 py-1.5 font-medium transition-colors border-l border-gray-200 ${
                                        sortBy === 'views' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    👁 Views
                                </button>
                            </div>
                            <button
                                onClick={fetchData}
                                title="Refresh now"
                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors text-base"
                            >
                                ↻
                            </button>
                        </div>
                    </div>

                    {/* ── Legend ── */}
                    <div className="flex items-center gap-2 mb-3 text-sm">
                        <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 text-amber-800 font-medium text-xs">
                            ⭐ Sage &amp; Paige / Lucinda entries highlighted
                        </span>
                        <span className="text-gray-400 text-xs">· $1/vote, minimum 10 votes</span>
                    </div>

                    {/* ── Leaderboard table ── */}
                    {loading ? (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-16 text-center">
                            <div className="text-gray-400 text-lg animate-pulse">Loading leaderboard…</div>
                        </div>
                    ) : error ? (
                        <div className="bg-white rounded-xl border border-red-200 shadow-sm p-10 text-center">
                            <div className="text-red-500 font-medium mb-3">{error}</div>
                            <button onClick={fetchData} className="text-sm text-purple-600 hover:underline">
                                Try again
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wide">
                                        <th className="text-center px-3 py-3 font-semibold text-gray-400 w-12">#</th>
                                        <th className="text-left px-3 py-3 font-semibold text-gray-400">Song</th>
                                        <th className="text-left px-3 py-3 font-semibold text-gray-400 hidden lg:table-cell">Show</th>
                                        <th className="text-left px-3 py-3 font-semibold text-gray-400 hidden md:table-cell">Singers</th>
                                        <th className={`text-right px-3 py-3 font-semibold w-20 ${sortBy === 'votes' ? 'text-purple-600' : 'text-gray-400'}`}>
                                            Votes
                                        </th>
                                        <th className={`text-right px-3 py-3 font-semibold w-20 ${sortBy === 'views' ? 'text-purple-600' : 'text-gray-400'}`}>
                                            Views
                                        </th>
                                        <th className={`text-right px-3 py-3 font-semibold w-24 text-orange-500 ${sortBy === 'views' ? 'hidden' : ''}`}>
                                            To Perform
                                        </th>
                                        <th className="px-3 py-3 w-16"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sorted.map((entry, idx) => {
                                        const rank = idx + 1;
                                        const inTop = rank <= PERFORMANCE_CUTOFF;
                                        const isLastPerformer = rank === PERFORMANCE_CUTOFF;

                                        const rankBadge = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank;

                                        return (
                                            <React.Fragment key={entry.id}>
                                                <tr
                                                    className={`border-b border-gray-100 transition-colors ${
                                                        entry.highlighted
                                                            ? 'bg-amber-50 hover:bg-amber-100'
                                                            : entry.familyHighlighted
                                                              ? 'bg-gray-100 hover:bg-gray-200'
                                                              : 'hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {/* Rank */}
                                                    <td className="px-3 py-3 text-center">
                                                        <span className={`font-bold ${rank <= 3 ? 'text-base' : inTop ? 'text-gray-700' : 'text-gray-400'}`}>
                                                            {rankBadge}
                                                        </span>
                                                    </td>

                                                    {/* Song name */}
                                                    <td className="px-3 py-3">
                                                        <div className="flex items-center gap-1.5">
                                                            {entry.highlighted && <span className="text-amber-400 text-base">⭐</span>}
                                                            <span
                                                                className={`font-medium ${
                                                                    entry.highlighted ? 'text-amber-900' : inTop ? 'text-gray-900' : 'text-gray-600'
                                                                }`}
                                                            >
                                                                {entry.songName || `Entry #${entry.entryNumber}`}
                                                            </span>
                                                        </div>
                                                        {/* Singers shown inline on mobile */}
                                                        {entry.performers && <div className="text-xs text-gray-400 mt-0.5 md:hidden">{entry.performers}</div>}
                                                        {/* Show shown inline on small screens */}
                                                        {entry.show && (
                                                            <div className="text-xs text-gray-400 mt-0.5 lg:hidden">
                                                                <span className="italic">{entry.show}</span>
                                                            </div>
                                                        )}
                                                    </td>

                                                    {/* Show */}
                                                    <td className="px-3 py-3 text-gray-500 italic hidden lg:table-cell">
                                                        {entry.show || <span className="text-gray-200 not-italic">—</span>}
                                                    </td>

                                                    {/* Singers */}
                                                    <td
                                                        className={`px-3 py-3 hidden md:table-cell ${
                                                            entry.highlighted ? 'text-amber-800 font-semibold' : 'text-gray-600'
                                                        }`}
                                                    >
                                                        {entry.performers || <span className="text-gray-300">—</span>}
                                                    </td>

                                                    {/* Votes */}
                                                    <td className="px-3 py-3 text-right font-mono tabular-nums">
                                                        <span
                                                            className={`font-semibold ${
                                                                sortBy === 'votes' ? (entry.highlighted ? 'text-amber-700' : 'text-gray-900') : 'text-gray-400'
                                                            }`}
                                                        >
                                                            {entry.votes.toLocaleString()}
                                                        </span>
                                                    </td>

                                                    {/* Views */}
                                                    <td className="px-3 py-3 text-right font-mono tabular-nums">
                                                        <span
                                                            className={`${
                                                                sortBy === 'views'
                                                                    ? `font-semibold ${entry.highlighted ? 'text-amber-700' : 'text-gray-900'}`
                                                                    : 'text-gray-400'
                                                            }`}
                                                        >
                                                            {entry.views.toLocaleString()}
                                                        </span>
                                                    </td>

                                                    {/* To Perform */}
                                                    <td className={`px-3 py-3 text-right font-mono tabular-nums ${sortBy === 'views' ? 'hidden' : ''}`}>
                                                        {rank <= PERFORMANCE_CUTOFF ? (
                                                            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                                                ✓ In
                                                            </span>
                                                        ) : (
                                                            <span className="font-semibold text-orange-600">
                                                                +{(cutoffVotes - entry.votes + 1).toLocaleString()}
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* View link */}
                                                    <td className="px-3 py-3 text-center">
                                                        <a
                                                            href={entry.link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={`text-xs font-medium px-2 py-1 rounded-md transition-colors ${
                                                                entry.highlighted
                                                                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                                                    : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                                                            }`}
                                                        >
                                                            View
                                                        </a>
                                                    </td>
                                                </tr>

                                                {/* ── Performance cutoff divider (votes sort only) ── */}
                                                {isLastPerformer && sortBy === 'votes' && (
                                                    <tr key="cutoff-divider">
                                                        <td colSpan={7} className="px-4 py-2.5 bg-purple-50">
                                                            <div className="flex items-center gap-3 text-xs font-bold text-purple-600 uppercase tracking-wider">
                                                                <div className="flex-1 border-t-2 border-dashed border-purple-300" />
                                                                ✂ Top 6 perform on stage — entries below need more votes!
                                                                <div className="flex-1 border-t-2 border-dashed border-purple-300" />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {sorted.length === 0 && !loading && <div className="p-16 text-center text-gray-400">No contestants found.</div>}
                        </div>
                    )}

                    {/* ── Footer note ── */}
                    <p className="mt-5 text-xs text-center text-gray-400">
                        Live data from{' '}
                        <a href={VOTE_URL} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">
                            broadwaybound.org
                        </a>{' '}
                        · Auto-refreshes every 30 seconds · Voting ends April 12, 2026 at 10:00 PM PT
                    </p>
                </div>
            </main>
        </>
    );
}
