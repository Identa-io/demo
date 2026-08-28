'use client';

import { useEffect, useMemo, useState } from 'react';
import { GeenaButton } from '@/components/geena-button';
import { StateNotice } from '@/components/demo-chrome';
import { FamilyManager } from '@/components/family-manager';
import { PendingFills } from '@/components/pending-fills';
import { SlotFiller } from '@/components/slot-filler';
import { ageFrom, docData, familyFromSlots, fullName, slotByKind } from '@/lib/records';
import { useDemoBase, useGeena } from '@/lib/use-geena';
import { DESTINATIONS, tripPrice, ZONE_CODE, type Destination } from '../pricing';

/**
 * Cover — screen 2 of 3, the form stage, set as the ticket being written: the travellers card
 * is a boarding pass whose stub holds the child picker, the switching discount is a rubber
 * stamp, and the quote itself is a second ticket that reprices live. Trip details are ordinary
 * form fields (they are not personal data on file anywhere); everything else flows from the
 * vault or is chosen child by child.
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
  const dayWord = days === 1 ? 'day' : 'days';

  return (
    <main className="mx-auto max-w-6xl px-6">
      <section className="grid items-start gap-10 py-12 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="eyebrow">Your quote</p>
          <h1 className="mt-3.5 max-w-xl text-[36px] font-extrabold leading-[1.08] tracking-[-0.02em]">
            One trip, the whole family.
          </h1>
          <p className="mt-3 max-w-md text-[14px] leading-[1.65] text-[color:var(--muted)]">
            Your half of this form no longer exists — it flowed in from your vault. The children
            are the only thing Cover still has to ask about.
          </p>

          <div className="mt-7 flex flex-col gap-4">
            {data && !data.configured && <StateNotice tone="info">{data.configureHint}</StateNotice>}

            {denied && !connected && (
              <StateNotice tone="denied">
                Nothing was shared — the quote stays anonymous until you decide otherwise.
              </StateNotice>
            )}

            {data?.accessEnded && (
              <StateNotice tone="ended">
                Access ended — you revoked Cover in your Geena. The traveller list is gone from
                Cover&apos;s side, entirely.
              </StateNotice>
            )}

            {(!connected || data?.accessEnded) && (
              <div className="card flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center">
                <div>
                  <p className="text-[14px] font-bold">Board from your vault</p>
                  <p className="mt-0.5 text-[12px] text-[color:var(--muted)]">
                    One hop, one consent screen — then your details resolve without typing.
                  </p>
                </div>
                <GeenaButton demo="cover" returnTo="/quote" label="Connect with Geena" />
              </div>
            )}

            {managing && (
              <div className="card overflow-hidden">
                <div className="px-6 pb-4 pt-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-[14px] font-bold">Travellers</h2>
                    <span className="font-mono text-[9.5px] tracking-[0.1em] text-[color:var(--mono-muted)]">
                      FROM YOUR VAULT — YOU CHOSE EXACTLY WHO
                    </span>
                  </div>

                  {!hasTravellers && (
                    <div className="mt-3">
                      <StateNotice tone="info">
                        You&apos;re connected — your own details resolve right below (watch them
                        arrive without typing), then add the children you&apos;re covering.
                      </StateNotice>
                    </div>
                  )}

                  <div className="mt-3">
                    <PendingFills
                      demo="cover"
                      slots={data?.slots}
                      onChanged={() => void refresh()}
                      title="Policyholder"
                    />
                  </div>

                  {hasTravellers && (
                    <ul className="mt-3">
                      <li className="leader-row py-3">
                        <div>
                          <p className="font-mono text-[13px] font-semibold">{holderName}</p>
                          <p className="mt-0.5 text-[11px] text-[color:var(--mono-muted)]">
                            Policyholder{holderBirth ? ` · born ${holderBirth}` : ''}
                          </p>
                        </div>
                        <span className="leader-fill" aria-hidden />
                        <span className="font-mono text-[13px] font-semibold">
                          €{price.adult.toFixed(2)}
                        </span>
                      </li>
                      {children.map((child) => {
                        const age = child.dateOfBirth ? ageFrom(child.dateOfBirth) : null;
                        return (
                          <li
                            key={child.alias}
                            className="leader-row border-t border-[#e8ebed] py-3"
                          >
                            <div className="min-w-0">
                              <p className="font-mono text-[13px] font-semibold">
                                {child.name || 'Child'}
                              </p>
                              <p
                                className="mt-0.5 truncate text-[11px] text-[color:var(--mono-muted)]"
                                title="The pairwise reference Cover holds instead of an identity — stable for this policy, meaningless anywhere else. Two insurers could never match it."
                              >
                                Child{age != null ? ` · ${age} y` : ''} ·{' '}
                                <span className="font-mono text-[0.95em]">
                                  ref {child.alias.slice(0, 8)}
                                </span>
                              </p>
                            </div>
                            <span className="leader-fill" aria-hidden />
                            <span className="font-mono text-[13px] font-semibold">
                              €{price.perChild.toFixed(2)}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                {childSubject && (
                  <>
                    <div className="tear" />
                    <div className="px-6 pb-5 pt-4">
                      <p className="font-mono text-[9.5px] tracking-[0.1em] text-[color:var(--mono-muted)]">
                        {(childSubject.label ?? 'Travelling children').toUpperCase()}
                      </p>
                      <div className="mt-2.5">
                        <FamilyManager
                          demo="cover"
                          subject={childSubject}
                          slots={childSlots}
                          onChanged={() => void refresh()}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {managing && fileSlot && (
              <div className="card px-6 py-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-[14px] font-bold">Switching from another insurer?</h2>
                  <span className="stamp">−10% SWITCHER</span>
                </div>
                {switching ? (
                  <p className="mt-2.5 text-[12.5px] leading-[1.65]">
                    <span className="font-mono text-[0.95em]">
                      {sharedPolicy?.fileName ?? 'Your policy'}
                    </span>{' '}
                    <span className="text-[color:var(--muted)]">
                      is shared — the discount is on. A file is a data point like any other:
                      consented, receipted, revocable.
                    </span>
                  </p>
                ) : (
                  <div className="mt-3">
                    <SlotFiller bare demo="cover" slot={fileSlot} onFilled={() => void refresh()} />
                    <p className="mt-2 text-[10px] leading-relaxed text-[color:var(--muted)]">
                      Optional — upload your current policy (or pick it from your vault) and we
                      take 10% off the total.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <aside className="sticky top-6 flex h-fit flex-col gap-4 lg:mt-[152px]">
          <div className="card overflow-hidden !shadow-[0_12px_32px_rgba(27,39,51,0.06)]">
            <div className="px-[26px] pb-4.5 pt-[22px]">
              <div className="font-mono flex items-baseline justify-between text-[10px] tracking-[0.1em] text-[color:var(--mono-muted)]">
                <span>YOUR QUOTE</span>
                <span>{ZONE_CODE[destination]}</span>
              </div>
              {/* Trip details are the only ordinary form fields on the page. */}
              <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
                <label>
                  <span className="field-label">DESTINATION</span>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value as Destination)}
                    className="mt-1 w-full rounded-lg border border-[color:var(--line)] bg-white px-2.5 py-1.5 text-[12.5px]"
                  >
                    {DESTINATIONS.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </label>
                <label className="sm:w-36">
                  <span className="field-label">DAYS</span>
                  <div className="mt-1 flex items-center gap-2 pt-1.5">
                    <input
                      type="range"
                      min={1}
                      max={30}
                      value={days}
                      onChange={(e) => setDays(Number(e.target.value))}
                      className="w-full accent-[color:var(--accent)]"
                    />
                    <span className="font-mono w-6 shrink-0 text-right text-[12.5px] font-semibold">
                      {days}
                    </span>
                  </div>
                </label>
              </div>
              <p className="mt-3 text-[13px] text-[color:var(--muted)]">
                {destination} · {days} {dayWord} · {1 + children.length} traveller
                {children.length ? 's' : ''}
              </p>
              <div className="mt-3 h-1 w-10 rounded-full" style={{ background: 'var(--stamp)' }} />
              <p className="font-mono mt-2 text-[34px] font-semibold tracking-[-0.02em]">
                €{price.total.toFixed(2)}
              </p>
              <p className="mt-0.5 text-[11px] text-[color:var(--mono-muted)]">
                €{price.adult.toFixed(2)} adult
                {children.length > 0 &&
                  ` + ${children.length} × €${price.perChild.toFixed(2)} child`}
                {switching && ` − €${price.discount.toFixed(2)} switching`}
              </p>
            </div>
            <div className="tear" />
            <div className="px-[26px] pb-6 pt-4">
              <div className="flex flex-col gap-2 text-[12px]">
                {[
                  ['Medical & repatriation', '€10m'],
                  ['Cancellation', '€5,000 / person'],
                  ['Baggage', '€2,500 / person'],
                  ['Excess', '€75'],
                ].map(([item, amount]) => (
                  <div key={item} className="leader-row">
                    <span className="text-[color:var(--mono-muted)]">{item}</span>
                    <span className="leader-fill" aria-hidden />
                    <span className="font-mono font-semibold">{amount}</span>
                  </div>
                ))}
              </div>
              <a
                href={hasTravellers ? doneHref : undefined}
                aria-disabled={!hasTravellers}
                className={`btn-primary mt-5 w-full !py-3 !text-[14px] !font-bold ${
                  hasTravellers ? '' : 'pointer-events-none opacity-40'
                }`}
              >
                {hasTravellers ? 'Buy policy (simulated) →' : 'Add travellers first'}
              </a>
              {managing && (
                <button
                  onClick={async () => {
                    await fetch('/api/revoke?demo=cover', { method: 'POST' });
                    void refresh();
                  }}
                  className="btn-secondary mt-2.5 w-full !py-3 !text-[14px] !font-bold"
                >
                  Disconnect Geena
                </button>
              )}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
