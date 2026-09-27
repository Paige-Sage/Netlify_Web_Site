import fs from 'fs';
import path from 'path';
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Markdown from 'markdown-to-jsx';

export default function TheaterGames({ content }) {
    return (
        <>
            <Head>
                <title>Theater Games Practice — Sage &amp; Paige</title>
                <meta
                    name="description"
                    content="A playful theater-games practice guide for building spontaneity, listening, physical commitment, and creative risk-taking."
                />
                <meta name="robots" content="noindex" />
            </Head>

            <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 py-3">
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
                        <span className="text-sm font-bold text-purple-700">Theater Games</span>
                    </nav>
                </div>
            </header>

            <main className="bg-gray-50 min-h-screen">
                <article className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
                    <header className="mb-10 text-center">
                        <h1 className="text-4xl font-bold text-gray-900">Sage &amp; Paige Theater Games Practice</h1>
                        <p className="mt-3 text-gray-500">A short, playful practice guide to use together.</p>
                    </header>
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-8 sm:px-10 sm:py-10">
                        <Markdown options={{ forceBlock: true }} className="sb-markdown">
                            {content}
                        </Markdown>
                    </div>
                </article>
            </main>
        </>
    );
}

export async function getStaticProps() {
    const contentPath = path.join(process.cwd(), 'content', 'hidden', 'theater-games.md');
    const content = await fs.promises.readFile(contentPath, 'utf8');
    return { props: { content } };
}
