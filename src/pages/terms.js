import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

// Standalone Terms & Conditions for paigeandsage.club. Like /privacy, this exists mainly to meet
// SMS / A2P 10DLC (carrier) requirements: it describes the messaging program, frequency, rates,
// and the STOP / HELP keywords. noindex + excluded from the sitemap (see next-sitemap.config.js);
// not linked from the site navigation.
const EFFECTIVE = 'June 18, 2026';
const CONTACT = 'opportunities@paigeandsage.club';

function Section({ title, children }) {
    return (
        <section className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{title}</h2>
            <div className="text-sm text-gray-700 leading-relaxed space-y-2">{children}</div>
        </section>
    );
}

export default function Terms() {
    return (
        <>
            <Head>
                <title>Terms &amp; Conditions · Casting Opportunities</title>
                <meta name="robots" content="noindex" />
            </Head>
            <main className="bg-gray-50 min-h-screen">
                <div className="max-w-3xl mx-auto px-4 py-10">
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Terms &amp; Conditions</h1>
                    <p className="text-gray-500 text-sm mb-8">Effective {EFFECTIVE}</p>

                    <Section title="About this service">
                        <p>
                            This is a small, non-commercial program that aggregates publicly posted youth performing-arts casting opportunities and shares them
                            with subscribers who opt in. It is provided as-is, for personal use, with no warranty. Always confirm details on the original
                            listing.
                        </p>
                    </Section>

                    <Section title="Text-message (SMS) program">
                        <p>
                            This is a low-volume, non-commercial SMS notification program. Recipients opt in by texting <strong>JOIN</strong> to
                            <strong> (206) 339-4171</strong> and receive a one-time confirmation message. By opting in, you consent to receive recurring text
                            notifications about youth performing-arts casting opportunities (a short alert plus a link to the casting listing). Message
                            frequency varies, typically up to about two messages per day.
                        </p>
                        <p>
                            <strong>Message and data rates may apply.</strong> Your mobile carrier is not liable for delayed or undelivered messages.
                        </p>
                    </Section>

                    <Section title="Opting out and help">
                        <p>
                            You can cancel at any time by replying <strong>STOP</strong> to any message. After you reply STOP, we will send one confirmation
                            message and then stop sending texts; reply <strong>JOIN</strong> to resubscribe.
                        </p>
                        <p>
                            For help, reply <strong>HELP</strong> or email{' '}
                            <a className="text-purple-600 hover:underline" href={`mailto:${CONTACT}`}>
                                {CONTACT}
                            </a>
                            .
                        </p>
                    </Section>

                    <Section title="Privacy">
                        <p>
                            Your mobile information is handled as described in our{' '}
                            <Link className="text-purple-600 hover:underline" href="/privacy">
                                Privacy Policy
                            </Link>
                            . We do not share or sell mobile opt-in data or SMS consent to third parties for marketing purposes.
                        </p>
                    </Section>

                    <Section title="Changes">
                        <p>We may update these terms from time to time; the effective date above will change accordingly.</p>
                    </Section>

                    <footer className="text-xs text-gray-400 mt-10">
                        <Link className="text-purple-600 hover:underline" href="/privacy">
                            Privacy Policy
                        </Link>
                    </footer>
                </div>
            </main>
        </>
    );
}
