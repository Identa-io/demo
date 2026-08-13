'use client';

import { useEffect, useMemo, useState } from 'react';
import { GeenaButton } from '@/components/geena-button';
import { StateNotice } from '@/components/demo-chrome';
import { ageFrom, docData, familyFromSlots, fullName } from '@/lib/records';
import { useGeena } from '@/lib/use-geena';

const DESTINATIONS = ['Europe', 'Worldwide excl. US/Canada', 'Worldwide'] as const;
const ADULT_PER_DAY = 4.2;
const CHILD_PER_DAY = 2.1;
const DESTINATION_FACTOR: Record<(typeof DESTINATIONS)[number], number> = {
  Europe: 1,
  'Worldwide excl. US/Canada': 1.4,
  Worldwide: 1.9,
};

/**
 * Resa — the family demo. Trip details are ordinary form fields (they are not personal data on
 * file anywhere). The TRAVELLERS are the point: the quote never asks how many children you have.
 * You connect, bind whichever children you're covering in your Geena, and each appears as a
 * priced line — two of three is a fine answer, and the insurer never learns a third exists.
 */
export default function ResaQuote() {
  const { data, refresh } = useGeena('resa');
  const [denied, setDenied] = useState(false);
  const [destination, setDestination] = useState<(typeof DESTINATIONS)[number]>('Europe');
  const [days, setDays] = useState(7);
  const [issued, setIssued] = useState(false);

  useEffect(() => {
    setDenied(new URLSearchParams(window.location.search).has('denied'));
  }, []);

  const slots = data?.slots;
  const holderName = fullName(docData(slots, 'PersonFullName'));
  const holderBirth = String(docData(slots, 'PersonBirthDetails')?.dateOfBirth ?? '');
  const children = familyFromSlots(slots);

  const connected = data?.connected ?? false;
  const hasTravellers = !!holderName;

  const price = useMemo(() => {
    const factor = DESTINATION_FACTOR[destination];
    const adult = ADULT_PER_DAY * days * factor;
    const perChild = CHILD_PER_DAY * days * factor;
    return {
      adult: Math.round(adult * 100) / 100,
      perChild: Math.round(perChild * 100) / 100,
      total: Math.round((adult + perChild * children.length) * 100) / 100,
    };
  }, [destination, days, children.length]);

  return (
    <main className="mx-auto max-w-6xl px-6">
      <section className="grid items-start gap-10 py-12 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="eyebrow">Single-trip cover</p>
          <h1 className="font-display mt-3 max-w-xl text-[40px] font-bold leading-[1.08] tracking-tight">
            The whole family, covered in one sitting.
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[color:var(--muted)]">
            No &quot;traveller 2, date of birth&quot; forms. Your children live in your vault —
            you decide which of them this policy covers, and that is all Resa ever learns.
          </p>

          <div className="card mt-8 p-5">
            <h2 className="text-[13px] font-semibold">Trip</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <label>
                <span className="field-label">Destination</span>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value as (typeof DESTINATIONS)[number])}
                  className="mt-1 w-full rounded-lg border border-[color:var(--line)] bg-white px-3 py-2 text-[14px]"
                >
                  {DESTINATIONS.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="field-label">Length of trip</span>
                <div className="mt-1 flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={30}
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="w-full accent-[color:var(--accent)]"
                  />
                  <span className="tabular w-16 shrink-0 text-right text-[14px] font-semibold">
                    {days} {days === 1 ? 'day' : 'days'}
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className="card mt-4 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-[13px] font-semibold">Travellers</h2>
              {!connected || data?.accessEnded ? (
                <GeenaButton demo="resa" returnTo="/" label="Add travellers from Geena" />
              ) : (
                <span className="text-[11px] text-[color:var(--muted)]">
                  from your vault — you chose exactly who
                </span>
              )}
            </div>

            {data && !data.configured && (
              <div className="mt-3">
                <StateNotice tone="info">{data.configureHint}</StateNotice>
              </div>
            )}

            {denied && !connected && (
              <div className="mt-3">
                <StateNotice tone="denied">
                  Nothing was shared — the quote stays anonymous until you decide otherwise.
                </StateNotice>
              </div>
            )}

            {data?.accessEnded && (
              <div className="mt-3">
                <StateNotice tone="ended">
                  Access ended — you revoked Resa in your Geena. The traveller list is gone from
                  Resa&apos;s side, entirely.
                </StateNotice>
              </div>
            )}

            {connected && !data?.accessEnded && !hasTravellers && (
              <div className="mt-3">
                <StateNotice tone="info">
                  Connected. Now pick the travellers:{' '}
                  {data?.grantUrl && (
                    <a
                      href={data.grantUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold underline underline-offset-2"
                    >
                      open the request in your Geena
                    </a>
                  )}{' '}
                  — answer &quot;Each child you cover&quot; with as many of your children as this
                  trip includes. Covering two of three? Share exactly those two.
                </StateNotice>
              </div>
            )}

            {hasTravellers && (
              <ul className="mt-4 divide-y divide-[color:var(--line)]">
                <li className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-[14px] font-semibold">{holderName}</p>
                    <p className="text-[11px] text-[color:var(--muted)]">
                      Policyholder{holderBirth ? ` · born ${holderBirth}` : ''}
                    </p>
                  </div>
                  <span className="tabular text-[13px] font-semibold">€{price.adult.toFixed(2)}</span>
                </li>
                {children.map((child) => {
                  const age = child.dateOfBirth ? ageFrom(child.dateOfBirth) : null;
                  return (
                    <li key={child.alias} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="text-[14px] font-semibold">{child.name || 'Child'}</p>
                        <p
                          className="truncate text-[11px] text-[color:var(--muted)]"
                          title="The pairwise reference Resa holds instead of an identity — stable for this policy, meaningless anywhere else. Two insurers could never match it."
                        >
                          Child{age != null ? ` · ${age} y` : ''} · ref {child.alias.slice(0, 8)}
                        </p>
                      </div>
                      <span className="tabular text-[13px] font-semibold">
                        €{price.perChild.toFixed(2)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}

            {hasTravellers && children.length === 0 && (
              <p className="mt-3 text-[12px] leading-relaxed text-[color:var(--muted)]">
                Travelling with children? Bind them in your Geena and they appear here as priced
                lines — the quote never asks how many you have.
              </p>
            )}
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6">
          <div className="card p-6">
            <p className="eyebrow">Your quote</p>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-[13px] text-[color:var(--muted)]">
                {destination} · {days} {days === 1 ? 'day' : 'days'} ·{' '}
                {1 + children.length} traveller{children.length ? 's' : ''}
              </span>
            </div>
            <p className="tabular mt-2 text-[36px] font-bold tracking-tight">
              €{price.total.toFixed(2)}
            </p>
            <p className="text-[11px] text-[color:var(--muted)]">
              €{price.adult.toFixed(2)} adult{children.length > 0 &&
                ` + ${children.length} × €${price.perChild.toFixed(2)} child`}
            </p>

            <table className="mt-5 w-full text-[12px]">
              <tbody>
                {[
                  ['Medical & repatriation', '€10m'],
                  ['Cancellation', '€5,000 / person'],
                  ['Baggage', '€2,500 / person'],
                  ['Excess', '€75'],
                ].map(([item, amount]) => (
                  <tr key={item} className="border-t border-[color:var(--line)]">
                    <td className="py-2 text-[color:var(--muted)]">{item}</td>
                    <td className="tabular py-2 text-right font-medium">{amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {issued ? (
              <div
                className="mt-5 rounded-xl p-4 text-[13px] leading-relaxed"
                style={{ background: 'var(--accent-soft)' }}
              >
                <p className="font-semibold">Policy RES-2026-08471 issued (simulated).</p>
                <p className="mt-1 text-[color:var(--muted)]">
                  {1 + children.length} traveller{children.length ? 's' : ''} covered,{' '}
                  {destination}, {days} days. Documents by email — in a real Resa, anyway.
                </p>
              </div>
            ) : (
              <button
                onClick={() => setIssued(true)}
                disabled={!hasTravellers}
                className="btn-primary mt-5 w-full !py-3 !text-[14px]"
                style={{ background: 'var(--accent)' }}
              >
                {hasTravellers ? 'Buy policy (simulated)' : 'Add travellers first'}
              </button>
            )}
            <p className="mt-3 text-[10px] leading-relaxed text-[color:var(--muted)]">
              Illustrative cover and pricing. Resa is fictional; no policy exists and no payment
              happens.
            </p>
          </div>

          {connected && !data?.accessEnded && (
            <p className="text-center text-[11px] text-[color:var(--muted)]">
              <button
                onClick={async () => {
                  await fetch('/api/revoke?demo=resa', { method: 'POST' });
                  setIssued(false);
                  void refresh();
                }}
                className="underline underline-offset-2 hover:opacity-70"
              >
                Disconnect Geena
              </button>{' '}
              — the traveller list disappears from Resa&apos;s side.
            </p>
          )}
        </aside>
      </section>
    </main>
  );
}
