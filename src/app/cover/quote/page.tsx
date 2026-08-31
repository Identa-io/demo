'use client';

import { useEffect, useMemo, useState } from 'react';
import { GeenaButton } from '@/components/geena-button';
import { StateNotice } from '@/components/demo-chrome';
import { FamilyManager } from '@/components/family-manager';
import { PendingFills } from '@/components/pending-fills';
import { SlotFiller } from '@/components/slot-filler';
import { ageFrom, docData, familyFromSlots, fullName, slotByKind } from '@/lib/records';
import { useDemoBase, useGeena } from '@/lib/use-geena';
import { DESTINATIONS, tripPrice, type Destination } from '../pricing';

/**
 * Cover — screen 2 of 3, the form stage. Trip details are ordinary form fields (they are not
 * personal data on file anywhere). Everything else demonstrates the chapter: the policyholder
 * flows in from the vault (the prefill intersection), the TRAVELLERS are chosen child by child
 * (subjects, priced per person), and the switching discount hangs off a file slot.
 */
export default function CoverQuote() {
  const base = useDemoBase('cover');
  const { data, refresh } = useGeena('cover');
  const [denied, setDenied] = useState(false);
  const [destination, setDestination] = useState<Destination>('Europe');
  const [days, setDays] = useState(7);

  useEffect(() => {
    setDenied(new URLSearchParams(window.location.search).has('denied'));
  }, []);

  const slots = data?.slots;
  const childSubject = data?.subjects?.find((s) => s.relation === 'child') ?? data?.subjects?.[0];
  const childSlots = (slots ?? []).filter((slot) => slot.subject);
  const holderName = fullName(docData(slots, 'PersonFullName'));
  const holderBirth = String(docData(slots, 'PersonBirthDetails')?.dateOfBirth ?? '');
  const children = familyFromSlots(slots);

  const fileSlot = slotByKind(slots, 'PERSONAL_FILES');
  const sharedPolicy = fileSlot?.records?.find((record) => record.type === 'file');
  const switching = !!sharedPolicy;

  const connected = data?.connected ?? false;
  const managing = connected && !data?.accessEnded;
  const hasTravellers = !!holderName;

  const price = useMemo(
    () => tripPrice({ destination, days, childCount: children.length, switching }),
    [destination, days, children.length, switching],
  );

  const doneHref = `${base}/done?destination=${encodeURIComponent(destination)}&days=${days}`;

  return (
    <main className="mx-auto max-w-6xl px-6">
      <section className="grid items-start gap-10 py-12 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="eyebrow">Your quote</p>
          <h1 className="font-display mt-3 max-w-xl text-[34px] font-bold leading-[1.08] tracking-tight">
            One trip, the whole family.
          </h1>
          <p className="mt-3 max-w-md text-[14px] leading-relaxed text-[color:var(--muted)]">
            Your half of this form no longer exists — it flowed in from your vault. The children
            are the only thing Cover still has to ask about.
          </p>

          <div className="card mt-7 p-5">
            <h2 className="text-[13px] font-semibold">Trip</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <label>
                <span className="field-label">Destination</span>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value as Destination)}
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
                <GeenaButton demo="cover" returnTo="/quote" label="Connect with Geena" />
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
                  Access ended — you revoked Cover in your Geena. The traveller list is gone from
                  Cover&apos;s side, entirely.
                </StateNotice>
              </div>
            )}

            {managing && !hasTravellers && (
              <div className="mt-3">
                <StateNotice tone="info">
                  You&apos;re connected — your own details resolve right below (watch them arrive
                  without typing), then add the children you&apos;re covering.
                </StateNotice>
              </div>
            )}

            {managing && (
              <div className="mt-4">
                <PendingFills
                  demo="cover"
                  slots={data?.slots}
                  onChanged={() => void refresh()}
                  title="Policyholder"
                />
              </div>
            )}

            {hasTravellers && (
              <ul className="mt-4 divide-y divide-[color:var(--line)]">
                <li className="leader-row py-3">
                  <div>
                    <p className="vault-value text-[13.5px] font-semibold">{holderName}</p>
                    <p className="text-[11px] text-[color:var(--muted)]">
                      Policyholder{holderBirth ? ` · born ${holderBirth}` : ''}
                    </p>
                  </div>
                  <span className="leader-fill" aria-hidden />
                  <span className="tabular text-[13px] font-semibold">
                    €{price.adult.toFixed(2)}
                  </span>
                </li>
                {children.map((child) => {
                  const age = child.dateOfBirth ? ageFrom(child.dateOfBirth) : null;
                  return (
                    <li key={child.alias} className="leader-row py-3">
                      <div className="min-w-0">
                        <p className="vault-value text-[13.5px] font-semibold">
                          {child.name || 'Child'}
                        </p>
                        <p
                          className="truncate text-[11px] text-[color:var(--muted)]"
                          title="The pairwise reference Cover holds instead of an identity — stable for this policy, meaningless anywhere else. Two insurers could never match it."
                        >
                          Child{age != null ? ` · ${age} y` : ''} ·{' '}
                          <span className="vault-value">ref {child.alias.slice(0, 8)}</span>
                        </p>
                      </div>
                      <span className="leader-fill" aria-hidden />
                      <span className="tabular text-[13px] font-semibold">
                        €{price.perChild.toFixed(2)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}

            {managing && childSubject && (
              <div className="mt-4 border-t border-[color:var(--line)] pt-4">
                <p className="field-label">{childSubject.label ?? 'Travelling children'}</p>
                <div className="mt-2">
                  <FamilyManager
                    demo="cover"
                    subject={childSubject}
                    slots={childSlots}
                    onChanged={() => void refresh()}
                  />
                </div>
              </div>
            )}
          </div>

          {managing && fileSlot && (
            <div className="card mt-4 p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-[13px] font-semibold">Switching from another insurer?</h2>
                <span
                  className="tabular rounded-md px-2 py-0.5 text-[11px] font-bold"
                  style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
                >
                  −10%
                </span>
              </div>
              {switching ? (
                <p className="mt-2 text-[12.5px] leading-relaxed">
                  <span className="vault-value">{sharedPolicy?.fileName ?? 'Your policy'}</span>{' '}
                  <span className="text-[color:var(--muted)]">
                    is shared — the discount is on. A file is a data point like any other:
                    consented, receipted, revocable.
                  </span>
                </p>
              ) : (
                <div className="mt-3">
                  <SlotFiller
                    bare
                    demo="cover"
                    slot={fileSlot}
                    onFilled={() => void refresh()}
                  />
                  <p className="mt-2 text-[10px] leading-relaxed text-[color:var(--muted)]">
                    Optional — upload your current policy (or pick it from your vault) and we take
                    10% off the total.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6">
          <div className="card p-6">
            <p className="eyebrow">Your quote</p>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-[13px] text-[color:var(--muted)]">
                {destination} · {days} {days === 1 ? 'day' : 'days'} · {1 + children.length}{' '}
                traveller{children.length ? 's' : ''}
              </span>
            </div>
            {/* The one warm mark on the page sits over the figure that matters. */}
            <div className="mt-3 h-1 w-10 rounded-full" style={{ background: 'var(--sun)' }} />
            <p className="tabular mt-2 text-[36px] font-bold tracking-tight">
              €{price.total.toFixed(2)}
            </p>
            <p className="text-[11px] text-[color:var(--muted)]">
              €{price.adult.toFixed(2)} adult
              {children.length > 0 && ` + ${children.length} × €${price.perChild.toFixed(2)} child`}
              {switching && ` − €${price.discount.toFixed(2)} switching`}
            </p>

            {/* Schedule of cover, set with leaders — the way policy schedules have always read. */}
            <div className="mt-5 space-y-2 text-[12px]">
              {[
                ['Medical & repatriation', '€10m'],
                ['Cancellation', '€5,000 / person'],
                ['Baggage', '€2,500 / person'],
                ['Excess', '€75'],
              ].map(([item, amount]) => (
                <div key={item} className="leader-row">
                  <span className="text-[color:var(--muted)]">{item}</span>
                  <span className="leader-fill" aria-hidden />
                  <span className="tabular font-medium">{amount}</span>
                </div>
              ))}
            </div>

            <a
              href={hasTravellers ? doneHref : undefined}
              aria-disabled={!hasTravellers}
              className={`btn-primary mt-5 w-full !py-3 !text-[14px] ${
                hasTravellers ? '' : 'pointer-events-none opacity-40'
              }`}
              style={{ background: 'var(--accent)' }}
            >
              {hasTravellers ? 'Buy policy (simulated) →' : 'Add travellers first'}
            </a>
            <p className="mt-3 text-[10px] leading-relaxed text-[color:var(--muted)]">
              Illustrative cover and pricing. Cover is fictional; no policy exists and no payment
              happens.
            </p>
          </div>

          {managing && (
            <p className="text-center text-[11px] text-[color:var(--muted)]">
              <button
                onClick={async () => {
                  await fetch('/api/revoke?demo=cover', { method: 'POST' });
                  void refresh();
                }}
                className="underline underline-offset-2 hover:opacity-70"
              >
                Disconnect Geena
              </button>{' '}
              — the traveller list disappears from Cover&apos;s side.
            </p>
          )}
        </aside>
      </section>
    </main>
  );
}
