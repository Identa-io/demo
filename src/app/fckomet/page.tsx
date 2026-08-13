'use client';

import { useEffect, useState } from 'react';
import { GeenaButton } from '@/components/geena-button';
import { StateNotice } from '@/components/demo-chrome';
import { ageFrom, docData, fullName, playersFromSlots } from '@/lib/records';
import { useGeena } from '@/lib/use-geena';

/**
 * FC Komet — the family demo. The pitch is the question that is ABSENT: the form never asks how
 * many children you have. You connect, and in your Geena you bind whichever kids you register —
 * two of three is fine, the club never learns a third exists. Each player card shows the
 * pairwise alias the club sees instead of any identity: two organizations can never correlate
 * the same child.
 */
export default function FcKometPage() {
  const { data, refresh } = useGeena('fckomet');
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    setDenied(new URLSearchParams(window.location.search).has('denied'));
  }, []);

  const slots = data?.slots;
  const guardianName = fullName(docData(slots, 'PersonFullName'));
  const guardianEmail = String(docData(slots, 'PersonEmail')?.email ?? '');
  const guardianPhone = String(docData(slots, 'PersonPhone')?.telephone ?? '');
  const players = playersFromSlots(slots);
  const connected = data?.connected ?? false;
  const registered = players.length > 0;

  return (
    <main>
      {/* Matchday hero: navy, a diagonal cut, scoreboard numerals. */}
      <section
        className="text-white"
        style={{
          background:
            'linear-gradient(135deg, var(--navy) 0%, var(--navy) 62%, var(--sky) 62.2%, var(--sky) 64%, var(--navy) 64.2%)',
        }}
      >
        <div className="mx-auto max-w-5xl px-6 py-14">
          <p className="text-[12px] font-bold uppercase tracking-[0.3em] text-[color:var(--accent)]">
            FC Komet · youth academy
          </p>
          <h1 className="font-display mt-3 max-w-2xl text-5xl uppercase leading-[1.02]">
            Season 2026/27 — registration is open
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/80">
            No &quot;child 1 / child 2 / child 3&quot; forms. Your family lives in your vault —
            share exactly the members you choose, and nothing else.
          </p>
          {!connected && (
            <div className="mt-7">
              <GeenaButton demo="fckomet" returnTo="/" label="Register with Geena" size="lg" />
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-5xl space-y-5 px-6 py-10">
        {data && !data.configured && (
          <StateNotice tone="info">{data.configureHint}</StateNotice>
        )}
        {denied && !connected && (
          <StateNotice tone="denied">
            No problem — nothing was shared. Registration stays open all summer.
          </StateNotice>
        )}

        {data?.accessEnded && (
          <StateNotice tone="ended">
            Access ended — you revoked FC Komet in your Geena. The club can no longer read
            anything, and it kept nothing.
          </StateNotice>
        )}

        {connected && !registered && !data?.accessEnded && (
          <StateNotice tone="info">
            You&apos;re connected. Now bind the players:{' '}
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
            and answer &quot;Each child you register&quot; with as many of your children as you
            like — two of three is a perfectly good answer, and the club will never know about
            the third.
          </StateNotice>
        )}

        {registered && (
          <>
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-display text-3xl uppercase">Registered players</h2>
              <span
                className="rounded-full px-3 py-1 text-[12px] font-bold"
                style={{ background: 'var(--accent)', color: 'var(--navy)' }}
              >
                {players.length} {players.length === 1 ? 'player' : 'players'}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {players.map((player, index) => {
                const age = player.dateOfBirth ? ageFrom(player.dateOfBirth) : null;
                return (
                  <article
                    key={player.alias}
                    className="rounded-2xl bg-[color:var(--card)] p-5 shadow-sm ring-1 ring-[color:var(--line)]"
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className="font-display flex h-12 w-12 items-center justify-center rounded-xl text-xl text-white"
                        style={{ background: 'var(--navy)' }}
                      >
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate text-[17px] font-bold">
                          {player.name || 'Player'}
                        </h3>
                        <p className="text-[12px] text-[color:var(--muted)]">
                          {age != null ? `U${Math.max(age + 1, 6)} · ${age} years old` : 'age from date of birth'}
                        </p>
                      </div>
                    </div>
                    <p
                      className="mt-3 truncate rounded-lg bg-[color:var(--bg)] px-2.5 py-1.5 font-mono text-[10px] text-[color:var(--muted)]"
                      title="The pairwise alias FC Komet sees instead of any identity — stable for this connection, meaningless anywhere else. Two organizations can never correlate your child."
                    >
                      how the club knows them: {player.alias.slice(0, 13)}…
                    </p>
                  </article>
                );
              })}
            </div>

            <div className="rounded-2xl bg-[color:var(--card)] p-5 shadow-sm ring-1 ring-[color:var(--line)]">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-[color:var(--muted)]">
                Parent / guardian
              </h3>
              <p className="mt-1.5 text-[15px] font-semibold">{guardianName || '—'}</p>
              <p className="text-[13px] text-[color:var(--muted)]">
                {[guardianEmail, guardianPhone].filter(Boolean).join(' · ')}
              </p>
            </div>

            <StateNotice tone="info">
              Kid number four arrives next year? Same consent covers them — the ask (&quot;each
              child&quot;) never changed. Just bind them in your Geena and they appear here.
            </StateNotice>

            <p className="text-center text-[11px] text-[color:var(--muted)]">
              <button
                onClick={async () => {
                  await fetch('/api/revoke?demo=fckomet', { method: 'POST' });
                  void refresh();
                }}
                className="underline underline-offset-2 hover:opacity-70"
              >
                Withdraw the registration
              </button>{' '}
              — revokes the connection; the club keeps nothing.
            </p>
          </>
        )}
      </section>
    </main>
  );
}
