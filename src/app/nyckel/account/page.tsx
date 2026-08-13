'use client';

import { useState } from 'react';
import { GeenaButton } from '@/components/geena-button';
import { StateNotice } from '@/components/demo-chrome';
import { docData, fullName, slotByKind } from '@/lib/records';
import { useDemoBase, useGeena } from '@/lib/use-geena';
import { LISTINGS } from '../listings';

/**
 * The account area, and the demo's two-act finale.
 *
 * Act 1, the landlord view: a switcher shows exactly what Nyckel received — structured
 * employment + income, and the actual salary slips, streamed through the coordinator. No email
 * attachments, no copies floating around.
 *
 * Act 2, revoke: done in the person's Geena ("didn't get the flat — take it all back"). The
 * poll flips this page to ACCESS ENDED: nothing here carried `keep`, so nothing survived.
 * Compare that to the PDF you emailed a landlord in 2019.
 *
 * Logout is the other button on purpose — it ends Nyckel's session and touches nothing at
 * Geena. Session control belongs to the app; data control belongs to the person.
 */
export default function NyckelAccount() {
  const base = useDemoBase('nyckel');
  const { data, loading, refresh } = useGeena('nyckel');
  const [view, setView] = useState<'applicant' | 'landlord'>('applicant');

  const authed = !!data?.nyckelAuthed && !!data?.connected;

  if (!loading && !authed && !data?.accessEnded) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-16 text-center">
        <h1 className="font-display text-2xl font-light">You&apos;re signed out.</h1>
        <p className="mt-2 text-[13px] text-[color:var(--muted)]">
          Signing back in is one hop — no password, no reset flow, because there is nothing to
          reset.
        </p>
        <div className="mt-6 flex justify-center">
          <GeenaButton demo="nyckel" returnTo="/account" size="lg" />
        </div>
      </main>
    );
  }

  const slots = data?.slots;
  const name = fullName(docData(slots, 'PersonFullName'));
  const email = String(docData(slots, 'PersonEmail')?.email ?? '');
  const job = docData(slots, 'PersonJob');
  const finances = docData(slots, 'PersonFinancialProfile');
  const files = slotByKind(slots, 'PERSONAL_FILES')?.records.filter((r) => r.type === 'file') ?? [];
  const applications = (data?.applications ?? [])
    .map((id) => LISTINGS.find((listing) => listing.id === id))
    .filter((listing): listing is NonNullable<typeof listing> => !!listing);

  const employment = job
    ? [job.jobTitle, job.employerName].filter(Boolean).join(' at ')
    : '';
  const income = finances?.grossAnnualIncome
    ? `${String(finances.grossAnnualIncome)} ${String(finances.grossAnnualIncomeCurrency ?? '')} / year`
    : '';

  const logout = async () => {
    await fetch('/api/nyckel/logout', { method: 'POST' });
    window.location.href = `${base}/`;
  };

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-light tracking-tight">
            {name ? (
              <>
                Welcome, <span className="font-semibold">{name.split(' ')[0]}</span>
              </>
            ) : (
              'Your account'
            )}
          </h1>
          {email && <p className="text-[12px] text-[color:var(--muted)]">{email}</p>}
        </div>
        {authed && (
          <button
            onClick={logout}
            className="rounded-xl border border-[color:var(--line)] px-4 py-2 text-[13px] font-semibold hover:border-[color:var(--ink)]/40"
          >
            Log out
          </button>
        )}
      </div>

      {data?.accessEnded && (
        <StateNotice tone="ended">
          <strong>Access ended.</strong> You revoked Nyckel in your Geena — nothing here carried
          &quot;keep&quot;, so nothing survived. Compare that to the PDF you emailed a landlord in
          2019. Signing in again simply asks for consent afresh.
          <div className="mt-3">
            <GeenaButton demo="nyckel" returnTo="/account" label="Reconnect with Geena" />
          </div>
        </StateNotice>
      )}

      {authed && (
        <>
          {/* The view switcher — both sides of the same consent. */}
          <div className="flex w-fit rounded-xl border border-[color:var(--line)] bg-[color:var(--card)] p-1 text-[12px] font-semibold">
            {(['applicant', 'landlord'] as const).map((id) => (
              <button
                key={id}
                onClick={() => setView(id)}
                className={`rounded-lg px-4 py-1.5 capitalize ${
                  view === id ? 'bg-[color:var(--ink)] text-white' : 'text-[color:var(--muted)]'
                }`}
              >
                {id === 'applicant' ? 'Your view' : 'Landlord view'}
              </button>
            ))}
          </div>

          {view === 'applicant' ? (
            <section className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-[color:var(--card)] p-5 shadow-sm ring-1 ring-[color:var(--line)]">
                <h2 className="text-[11px] font-bold uppercase tracking-widest text-[color:var(--muted)]">
                  Profile — live from your vault
                </h2>
                <dl className="mt-3 space-y-2 text-[14px]">
                  <ProfileRow label="Employment" value={employment} grantUrl={data?.grantUrl} />
                  <ProfileRow label="Income" value={income} grantUrl={data?.grantUrl} />
                  <ProfileRow
                    label="Salary slips"
                    value={files.length ? `${files.length} shared` : ''}
                    grantUrl={data?.grantUrl}
                  />
                </dl>
                <p className="mt-3 text-[11px] leading-relaxed text-[color:var(--muted)]">
                  Edit anything in Geena and it changes here too — Nyckel reads the current
                  version, it holds no copy.
                </p>
              </div>

              <div className="rounded-2xl bg-[color:var(--card)] p-5 shadow-sm ring-1 ring-[color:var(--line)]">
                <h2 className="text-[11px] font-bold uppercase tracking-widest text-[color:var(--muted)]">
                  Your applications
                </h2>
                {applications.length === 0 ? (
                  <p className="mt-3 text-[13px] text-[color:var(--muted)]">
                    None yet —{' '}
                    <a href={`${base}/`} className="underline underline-offset-2">
                      browse the listings
                    </a>
                    .
                  </p>
                ) : (
                  <ul className="mt-3 space-y-2.5">
                    {applications.map((listing) => (
                      <li
                        key={listing.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-[color:var(--line)] px-3.5 py-2.5"
                      >
                        <div>
                          <p className="text-[14px] font-semibold">{listing.title}</p>
                          <p className="text-[11px] text-[color:var(--muted)]">
                            {listing.area} · €{listing.rent}/mo
                          </p>
                        </div>
                        <span className="rounded-full bg-[color:var(--accent-soft)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
                          Submitted
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-3 text-[11px] leading-relaxed text-[color:var(--muted)]">
                  Didn&apos;t get the flat? Revoke Nyckel{' '}
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
            <section className="rounded-2xl border-2 border-dashed border-[color:var(--steel)]/40 bg-[color:var(--card)] p-5">
              <p className="text-[11px] font-bold uppercase tracking-widest text-[color:var(--steel)]">
                What Nyckel actually received
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <dl className="space-y-2 text-[13px]">
                  <LandlordRow label="Applicant" value={name} />
                  <LandlordRow label="Email" value={email} />
                  <LandlordRow label="Employment" value={employment} />
                  <LandlordRow
                    label="Contract"
                    value={job ? [job.employmentType, job.contractType].filter(Boolean).join(', ') : ''}
                  />
                  <LandlordRow label="Income" value={income} />
                </dl>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[color:var(--muted)]">
                    Documents
                  </p>
                  {files.length === 0 ? (
                    <p className="mt-2 text-[13px] text-[color:var(--muted)]">
                      No salary slips granted yet.
                    </p>
                  ) : (
                    <ul className="mt-2 space-y-1.5">
                      {files.map((file) => (
                        <li key={file.resourceId}>
                          <a
                            href={file.downloadUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 rounded-lg border border-[color:var(--line)] px-3 py-2 text-[13px] font-medium hover:border-[color:var(--steel)]"
                          >
                            📄 {file.label || file.fileName || 'Document'}
                            <span className="ml-auto text-[10px] text-[color:var(--muted)]">
                              opens inline — no attachment ever sent
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="mt-3 text-[11px] leading-relaxed text-[color:var(--muted)]">
                    Every read here wrote a receipt the applicant can see in their Geena. Nothing
                    carries &quot;keep&quot; — revocation ends this view, entirely.
                  </p>
                </div>
              </div>
            </section>
          )}

          {!name && !employment && (
            <StateNotice tone="info">
              You&apos;re signed in — now grant the application data:{' '}
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

function ProfileRow({
  label,
  value,
  grantUrl,
}: {
  label: string;
  value: string;
  grantUrl?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-[11px] font-bold uppercase tracking-widest text-[color:var(--muted)]">
        {label}
      </dt>
      <dd className="text-right font-medium">
        {value || (
          <a
            href={grantUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[12px] font-normal text-[color:var(--muted)] underline underline-offset-2"
          >
            grant in Geena
          </a>
        )}
      </dd>
    </div>
  );
}

function LandlordRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-[color:var(--line)] pb-1.5">
      <dt className="text-[color:var(--muted)]">{label}</dt>
      <dd className="text-right font-medium">{value || '—'}</dd>
    </div>
  );
}
