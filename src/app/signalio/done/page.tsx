'use client';

import { StateNotice } from '@/components/demo-chrome';
import { docData, fullName, maskedAccount } from '@/lib/records';
import { useDemoBase, useGeena, useJourneyAdvanceHref } from '@/lib/use-geena';

/**
 * Signalio — screen 3 of 3, the finish. The product delivers instantly (the first briefing,
 * addressed by name), the mandate line shows what the vault provided, and the scoreboard states
 * the chapter's whole argument: you typed nothing.
 */
export default function SignalioDone() {
  const base = useDemoBase('signalio');
  const { data } = useGeena('signalio');
  const advance = useJourneyAdvanceHref('signalio', 'cover');

  const slots = data?.slots;
  const name = fullName(docData(slots, 'PersonFullName'));
  const first = name.split(' ')[0] ?? '';
  const email = String(docData(slots, 'PersonEmail')?.email ?? '');
  const sepa = maskedAccount(docData(slots, 'PersonBankAccount'));
  const ready = (data?.connected ?? false) && !data?.accessEnded && !!name;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      {!ready ? (
        <div className="space-y-4">
          <StateNotice tone="info">
            No subscription yet — finish the checkout first.
          </StateNotice>
          <a href={`${base}/checkout`} className="btn-primary">
            Back to checkout
          </a>
        </div>
      ) : (
        <>
          <p className="eyebrow">Subscription active</p>
          <h1 className="font-display mt-2 text-[34px] font-bold leading-tight tracking-tight">
            You&apos;re in{first ? `, ${first}` : ''}.
          </h1>
          <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-[color:var(--muted)]">
            Mandate <span className="vault-value">SIG-2026-3311</span> · €12.00 monthly by SEPA
            direct debit from <span className="vault-value">{sepa || 'your account'}</span>{' '}
            (simulated). The Morning Signal lands at{' '}
            <span className="vault-value">{email || 'your inbox'}</span> on weekdays.
          </p>

          {/* The product, delivered on the confirmation screen — addressed from the vault. */}
          <div className="card mt-8 p-6">
            <div className="flex items-baseline justify-between">
              <p className="font-display text-[13px] font-bold">The Morning Signal · issue 413</p>
              <span
                className="tabular rounded-md px-2 py-1 text-[11px] font-bold"
                style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
              >
                tomorrow 07:00
              </span>
            </div>
            <p className="font-display mt-3 text-[17px] font-bold leading-snug">
              Good morning{first ? `, ${first}` : ''} — three things before the open.
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-[color:var(--muted)]">
              Your first briefing is being typeset. It will keep arriving until you cancel — and
              cancelling here means revoking in your Geena, which really ends our access. No
              retention flow, no &ldquo;are you sure&rdquo; maze.
            </p>
          </div>

          {/* The chapter's scoreboard — the argument, in three lines. */}
          <div className="card mt-4 p-5">
            <div className="space-y-2 text-[12px]">
              {[
                ['Fields you typed in chapter 1', '8'],
                ['Fields you typed in chapter 2', '0'],
                ['Data points Signalio received', '4 — served live from your vault'],
              ].map(([item, amount]) => (
                <div key={item} className="leader-row">
                  <span className="text-[color:var(--muted)]">{item}</span>
                  <span className="leader-fill" aria-hidden />
                  <span className="tabular font-semibold">{amount}</span>
                </div>
              ))}
            </div>
          </div>

          {/* The handoff — the last new thing the journey has to show. */}
          <div className="mt-8 rounded-2xl p-6 text-white" style={{ background: 'var(--ink)' }}>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] opacity-70">
              Next — chapter 3 of 3
            </p>
            <h2 className="font-display mt-2 text-[22px] font-bold tracking-tight">
              Now bring the family.
            </h2>
            <p className="mt-1.5 max-w-md text-[13px] leading-relaxed opacity-80">
              Cover insures the family trip. Your details flow in like they just did here — the
              children are the only thing new, and there is a file slot with a discount attached.
            </p>
            <a
              href={advance}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-[13px] font-semibold text-black transition-transform hover:scale-[1.02]"
            >
              Continue to Cover →
            </a>
          </div>
        </>
      )}
    </main>
  );
}
