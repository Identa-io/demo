'use client';

import { useState } from 'react';
import { GeenaButton } from '@/components/geena-button';
import { StateNotice } from '@/components/demo-chrome';
import { addressLines, docData, fullName, slotByKind } from '@/lib/records';
import { useDemoBase, useGeena } from '@/lib/use-geena';
import { FLEET } from '../fleet';

/**
 * The account area, and the demo's two-act finale.
 *
 * Act 1, the desk view: a switcher shows exactly what the rental desk received — the driver
 * profile and the actual licence document, streamed through the coordinator. No photocopies at
 * the counter, no attachments in anyone's inbox.
 *
 * Act 2, revoke: done in the person's own Geena ("trip's over — take it all back"). The poll
 * flips this page to ACCESS ENDED: nothing here carried `keep`, so nothing survived.
 *
 * Logout is deliberately the other button — it ends Vagn's session and touches nothing at
 * Geena. Session control belongs to the app; data control belongs to the person.
 */
export default function VagnAccount() {
  const base = useDemoBase('vagn');
  const { data, loading, refresh } = useGeena('vagn');
  const [view, setView] = useState<'driver' | 'desk'>('driver');

  const authed = !!data?.vagnAuthed && !!data?.connected;

  if (!loading && !authed && !data?.accessEnded) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-16 text-center">
        <p className="eyebrow">Vagn account</p>
        <h1 className="font-display mt-2 text-2xl font-bold">You&apos;re signed out.</h1>
        <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-[color:var(--muted)]">
          Signing back in is one hop — no password, no reset flow, because there is nothing to
          reset.
        </p>
        <div className="mt-6 flex justify-center">
          <GeenaButton demo="vagn" returnTo="/account" size="lg" />
        </div>
      </main>
    );
  }

  const slots = data?.slots;
  const name = fullName(docData(slots, 'PersonFullName'));
  const email = String(docData(slots, 'PersonEmail')?.email ?? '');
  const phone = String(docData(slots, 'PersonPhone')?.telephone ?? '');
  const address = addressLines(docData(slots, 'PersonAddress'));
  const licences =
    slotByKind(slots, 'PERSONAL_FILES')?.records.filter((r) => r.type === 'file') ?? [];
  const bookings = (data?.bookings ?? [])
    .map((id) => FLEET.find((car) => car.id === id))
    .filter((car): car is NonNullable<typeof car> => !!car);

  const logout = async () => {
    await fetch('/api/vagn/logout', { method: 'POST' });
    window.location.href = `${base}/`;
  };

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Vagn account</p>
          <h1 className="font-display mt-1 text-3xl font-bold tracking-tight">
            {name ? name : 'Driver profile'}
          </h1>
          {email && <p className="text-[12px] text-[color:var(--muted)]">{email}</p>}
        </div>
        {authed && (
          <button onClick={logout} className="btn-secondary">
            Log out
          </button>
        )}
      </div>

      {data?.accessEnded && (
        <StateNotice tone="ended">
          <strong>Access ended.</strong> You revoked Vagn in your Geena — the desk view went dark,
          because nothing here carried &quot;keep&quot;. Compare that to the licence photocopy a
          rental counter took in 2019. Signing in again simply asks for consent afresh.
          <div className="mt-3">
            <GeenaButton demo="vagn" returnTo="/account" label="Reconnect with Geena" />
          </div>
        </StateNotice>
      )}

      {authed && (
        <>
          <div className="flex w-fit rounded-xl border border-[color:var(--line)] bg-[color:var(--card)] p-1 text-[12px] font-semibold">
            {(['driver', 'desk'] as const).map((id) => (
              <button
                key={id}
                onClick={() => setView(id)}
                className={`rounded-lg px-4 py-1.5 ${
                  view === id ? 'bg-[color:var(--ink)] text-white' : 'text-[color:var(--muted)]'
                }`}
              >
                {id === 'driver' ? 'Your view' : 'Rental-desk view'}
              </button>
            ))}
          </div>

          {view === 'driver' ? (
            <section className="grid gap-4 md:grid-cols-2">
              <div className="card p-5">
                <h2 className="eyebrow">Driver profile — live from your vault</h2>
                <dl className="mt-3 space-y-2.5 text-[14px]">
                  {[
                    ['Phone', phone],
                    ['Home address', address.join(' · ')],
                    ['Licence document', licences.length ? `${licences.length} on file` : ''],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-baseline justify-between gap-3">
                      <dt className="field-label">{label}</dt>
                      <dd className="text-right font-medium">
                        {value || (
                          <a
                            href={data?.grantUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[12px] font-normal text-[color:var(--muted)] underline underline-offset-2"
                          >
                            grant in Geena
                          </a>
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-3 text-[11px] leading-relaxed text-[color:var(--muted)]">
                  Moved house or renewed the licence? Change it in Geena once — Vagn reads the
                  current version, it holds no copy.
                </p>
              </div>

              <div className="card p-5">
                <h2 className="eyebrow">Reservations</h2>
                {bookings.length === 0 ? (
                  <p className="mt-3 text-[13px] text-[color:var(--muted)]">
                    None yet —{' '}
                    <a href={`${base}/`} className="underline underline-offset-2">
                      pick a car
                    </a>
                    .
                  </p>
                ) : (
                  <ul className="mt-3 space-y-2.5">
                    {bookings.map((car) => (
                      <li
                        key={car.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-[color:var(--line)] px-3.5 py-2.5"
                      >
                        <div>
                          <p className="text-[14px] font-bold">
                            {car.name}{' '}
                            <span className="font-normal text-[color:var(--muted)]">
                              · {car.example}
                            </span>
                          </p>
                          <p className="tabular text-[11px] text-[color:var(--muted)]">
                            €{car.perDay}/day · pick-up Malmö C
                          </p>
                        </div>
                        <span
                          className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                          style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
                        >
                          Confirmed
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-3 text-[11px] leading-relaxed text-[color:var(--muted)]">
                  Trip over? Revoke Vagn{' '}
                  {data?.grantUrl ? (
                    <a
                      href={data.grantUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="underline underline-offset-2"
                    >
                      in your Geena
                    </a>
                  ) : (
                    'in your Geena'
                  )}{' '}
                  and watch this page — access simply ends.
                </p>
              </div>
            </section>
          ) : (
            <section className="card border-2 border-dashed !border-[color:var(--accent)]/40 p-5">
              <p className="eyebrow" style={{ color: 'var(--accent)' }}>
                What the rental desk received
              </p>
              <div className="mt-4 grid gap-6 md:grid-cols-2">
                <dl className="space-y-2 text-[13px]">
                  {[
                    ['Driver', name],
                    ['Email', email],
                    ['Phone', phone],
                    ['Home address', address.join(', ')],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-baseline justify-between gap-3 border-b border-[color:var(--line)] pb-1.5"
                    >
                      <dt className="text-[color:var(--muted)]">{label}</dt>
                      <dd className="text-right font-medium">{value || '—'}</dd>
                    </div>
                  ))}
                </dl>
                <div>
                  <p className="field-label">Licence documents</p>
                  {licences.length === 0 ? (
                    <p className="mt-2 text-[13px] text-[color:var(--muted)]">
                      No licence granted yet.
                    </p>
                  ) : (
                    <ul className="mt-2 space-y-1.5">
                      {licences.map((file) => (
                        <li key={file.resourceId}>
                          <a
                            href={file.downloadUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between gap-2 rounded-lg border border-[color:var(--line)] px-3 py-2 text-[13px] font-medium hover:border-[color:var(--accent)]"
                          >
                            <span className="truncate">{file.label || file.fileName || 'Document'}</span>
                            <span className="shrink-0 text-[10px] text-[color:var(--muted)]">
                              streams inline — never attached
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="mt-3 text-[11px] leading-relaxed text-[color:var(--muted)]">
                    Every read here wrote a receipt the driver can see in their Geena. Nothing
                    carries &quot;keep&quot; — revocation ends this view, entirely.
                  </p>
                </div>
              </div>
            </section>
          )}

          {!name && (
            <StateNotice tone="info">
              You&apos;re signed in — now grant the rental profile:{' '}
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
              and this page fills itself.
            </StateNotice>
          )}
        </>
      )}
    </main>
  );
}
