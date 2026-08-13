'use client';

import { useEffect, useState } from 'react';
import { GeenaButton } from '@/components/geena-button';
import { StateNotice } from '@/components/demo-chrome';

/**
 * The login card with one button — itself the screenshot. Nothing to phish, nothing to leak,
 * nothing to reset: signing in is the hop to Geena (existing session bounces straight back;
 * otherwise an email code on GEENA's page, never on Nyckel's). First-ever login IS signup.
 */
export default function NyckelLogin() {
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    setDenied(new URLSearchParams(window.location.search).has('denied'));
  }, []);

  return (
    <main className="mx-auto flex max-w-5xl justify-center px-6 py-20">
      <div className="w-full max-w-sm">
        {denied && (
          <div className="mb-4">
            <StateNotice tone="denied">
              Sign-in cancelled on the Geena side — nothing was shared.
            </StateNotice>
          </div>
        )}
        <div className="rounded-3xl bg-[color:var(--card)] p-8 text-center shadow-sm ring-1 ring-[color:var(--line)]">
          <h1 className="font-display text-2xl font-light tracking-tight">
            Sign in to <span className="font-semibold">Nyckel</span>
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-[color:var(--muted)]">
            One button. No password — signing up and signing in are the same act, on Geena&apos;s
            page, never here.
          </p>
          <div className="mt-6 flex justify-center">
            <GeenaButton demo="nyckel" returnTo="/account" size="lg" />
          </div>
          <p className="mt-6 text-[11px] leading-relaxed text-[color:var(--muted)]">
            Already connected? The hop bounces straight back — consent is never re-asked for an
            active connection.
          </p>
        </div>
      </div>
    </main>
  );
}
