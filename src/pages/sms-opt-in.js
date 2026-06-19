import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

// Dedicated public SMS opt-in (Call-to-Action) page for paigeandsage.club. This is the carrier
// "collateral" for the A2P 10DLC campaign Via-Text opt-in: it plainly shows the JOIN keyword,
// the program number, and all required disclosures (frequency, rates, HELP/STOP, links to the
// Privacy Policy and Terms). Reviewers reach it by direct URL, so noindex is fine. Keep the JOIN
// keyword, number, frequency, "message & data rates may apply", and STOP/HELP text intact.
const CONTACT = 'opportunities@paigeandsage.club';
const SMS_NUMBER_DISPLAY = '(206) 339-4171';

function Section({ title, children }) {
    return (
        <section className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{title}</h2>
            <div className="text-sm text-gray-700 leading-relaxed space-y-2">{children}</div>
        </section>
    );
}

export default function SmsOptIn() {
    return (
        <>
            <Head>
                <title>SMS Alerts Opt-In · Casting Opportunities</title>
                <meta name="robots" content="noindex" />
            </Head>
            <main className="bg-gray-50 min-h-screen">
                <div className="max-w-3xl mx-auto px-4 py-10">
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Casting Opportunities SMS Alerts</h1>
                    <p className="text-gray-500 text-sm mb-8">Text-message opt-in information</p>

                    <div className="rounded-lg border border-purple-200 bg-purple-50 p-5 mb-8">
                        <p className="text-base font-semibold text-gray-900 mb-1">
                            To opt in, text <span className="text-purple-700">JOIN</span> to {SMS_NUMBER_DISPLAY}
                        </p>
                        <p className="text-sm text-gray-700">
                            You&apos;ll receive a one-time confirmation reply. Reply <strong>HELP</strong> for help or <strong>STOP</strong> to cancel at any
                            time.
                        </p>
                    </div>

                    <Section title="What you'll receive">
                        <p>
                            This program sends short text alerts about youth performing-arts casting opportunities, aggregated from public sources. Each message
                            is a brief alert plus a link to the casting listing.
                        </p>
                    </Section>

                    <Section title="Who this is for">
                        <p>
                            Text JOIN to opt in and receive casting alerts. This is a low-volume, non-commercial notification program for subscribers who opt
                            in; it is not a public marketing or lead-generation service.
                        </p>
                    </Section>

                    <Section title="Message frequency &amp; rates">
                        <p>
                            Message frequency varies, typically two messages per day or less.
                            <strong> Message and data rates may apply.</strong>
                        </p>
                    </Section>

                    <Section title="Help &amp; opt-out">
                        <p>
                            Reply <strong>HELP</strong> (or email{' '}
                            <a className="text-purple-600 hover:underline" href={`mailto:${CONTACT}`}>
                                {CONTACT}
                            </a>
                            ) for help. Reply <strong>STOP</strong> to unsubscribe at any time; after you reply STOP we send one confirmation message and then
                            stop texting. Reply
                            <strong> JOIN</strong> to resubscribe.
                        </p>
                    </Section>

                    <Section title="Your privacy">
                        <p>
                            Mobile opt-in data and SMS consent are never shared or sold to third parties or affiliates for marketing or promotional purposes.
                            See our{' '}
                            <Link className="text-purple-600 hover:underline" href="/privacy">
                                Privacy Policy
                            </Link>{' '}
                            and{' '}
                            <Link className="text-purple-600 hover:underline" href="/terms">
                                Terms &amp; Conditions
                            </Link>
                            .
                        </p>
                    </Section>

                    <footer className="text-xs text-gray-400 mt-10">
                        <Link className="text-purple-600 hover:underline" href="/privacy">
                            Privacy Policy
                        </Link>
                        {' · '}
                        <Link className="text-purple-600 hover:underline" href="/terms">
                            Terms &amp; Conditions
                        </Link>
                    </footer>
                </div>
            </main>
        </>
    );
}
