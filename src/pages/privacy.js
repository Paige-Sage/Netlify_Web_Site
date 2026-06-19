import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

// Standalone Privacy Policy for paigeandsage.club. Exists primarily to satisfy SMS/A2P 10DLC
// (carrier) requirements: it MUST state that mobile opt-in data and SMS consent are never shared
// or sold to third parties for marketing, and describe the messaging program. Keep that clause
// intact — removing it can get the messaging campaign flagged or rejected.
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

export default function Privacy() {
    return (
        <>
            <Head>
                <title>Privacy Policy · PaigeAndSage</title>
                <meta name="robots" content="noindex" />
            </Head>
            <main className="bg-gray-50 min-h-screen">
                <div className="max-w-3xl mx-auto px-4 py-10">
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Privacy Policy</h1>
                    <p className="text-gray-500 text-sm mb-8">Effective {EFFECTIVE}</p>

                    <Section title="Who we are">
                        <p>
                            PaigeAndSage is a small, private family project that aggregates publicly
                            posted youth performing-arts casting opportunities and shares them with a
                            few consenting family members. It is not a commercial service. You can
                            reach us at <a className="text-purple-600 hover:underline" href={`mailto:${CONTACT}`}>{CONTACT}</a>.
                        </p>
                    </Section>

                    <Section title="Information we collect">
                        <p>
                            For our text-message (SMS) notifications we store only the mobile phone
                            numbers of recipients who have opted in to receive texts. Recipients opt in
                            by texting the keyword <strong>JOIN</strong> to our program number and
                            receive a one-time confirmation reply. This is a private, low-volume,
                            family-oriented program: we send casting alerts only to a small number of
                            family and household members and do not operate a public marketing service.
                            We do not collect names, location, or any sensitive personal data through
                            the messaging program.
                        </p>
                        <p>
                            The public casting page itself displays no personal information and does
                            not require an account.
                        </p>
                    </Section>

                    <Section title="How we use information">
                        <p>
                            Mobile numbers are used solely to send the requested casting-opportunity
                            notifications (a short alert plus a link to the public casting page), to
                            process HELP and STOP requests, to maintain consent records, and to operate
                            the SMS program. We do not use them for advertising or any unrelated purpose.
                        </p>
                    </Section>

                    <Section title="SMS messaging &amp; consent (text messaging)">
                        <p>
                            This is a private, low-volume messaging program for family and household
                            members. Recipients consent by texting <strong>JOIN</strong> to
                            <strong> (206) 339-4171</strong>, after which they receive a confirmation
                            message. We send casting alerts only to a small number of family and
                            household members and do not operate a public marketing program.
                        </p>
                        <p className="font-medium text-gray-900">
                            No mobile information will be shared with third parties or affiliates for
                            marketing or promotional purposes. Text-messaging originator opt-in data
                            and consent will not be shared with any third parties.
                        </p>
                        <p>
                            Information may only be disclosed to service providers that help us operate
                            the messaging program (for example, our SMS delivery provider), and only as
                            needed to deliver the messages you asked to receive.
                        </p>
                        <p>
                            Message frequency varies (typically up to about two messages per day).
                            Message and data rates may apply. Reply <strong>STOP</strong> to any
                            message to unsubscribe, or <strong>HELP</strong> for help.
                        </p>
                    </Section>

                    <Section title="Data retention &amp; security">
                        <p>
                            We keep mobile numbers only while a recipient wishes to receive alerts and
                            remove them on request or after opt-out. We take reasonable measures to keep
                            this limited information secure.
                        </p>
                    </Section>

                    <Section title="Your choices">
                        <p>
                            You can opt out of texts at any time by replying STOP, or by emailing{' '}
                            <a className="text-purple-600 hover:underline" href={`mailto:${CONTACT}`}>{CONTACT}</a>{' '}
                            to have your number removed.
                        </p>
                    </Section>

                    <Section title="Changes">
                        <p>
                            We may update this policy from time to time; the effective date above will
                            change accordingly.
                        </p>
                    </Section>

                    <footer className="text-xs text-gray-400 mt-10">
                        <Link className="text-purple-600 hover:underline" href="/terms">Terms &amp; Conditions</Link>
                        {' · '}
                        <Link className="text-purple-600 hover:underline" href="/casting">Casting opportunities</Link>
                    </footer>
                </div>
            </main>
        </>
    );
}
