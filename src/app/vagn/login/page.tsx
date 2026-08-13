'use client';

import { useEffect, useState } from 'react';
import { GeenaButton } from '@/components/geena-button';
import { StateNotice } from '@/components/demo-chrome';

/**
 * The login card with one button — itself the screenshot. Nothing to phish, nothing to leak,
 * nothing to reset: signing in is the hop to Geena (an existing session bounces straight back;
 * otherwise an email code on GEENA's page, never on Vagn's). First-ever login IS signup.
 */
export default function VagnLogin() {
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    setDenied(new URLSearchParams(window.location.search).has('denied'));
  }, []);

  return (
    <main className="mx-auto flex max-w-6xl justify-center px-6 py-20">
      <div className="w-full max-w-sm">
        {denied && (
          <div className="mb-4">
            <StateNotice tone="denied">
              Sign-in cancelled on the Geena side — nothing was shared.
            </StateNotice>
          </div>
        )}
        <div className="card p-8 text-center">
          <p className="eyebrow">Vagn account</p>
          <h1 className="font-display mt-2 text-2xl font-bold tracking-tight">Sign in</h1>
          <p className="mt-2 text-[13px] leading-relaxed text-[color:var(--muted)]">
            One button, no password — signing up and signing in are the same act, on Geena&apos;s
            page, never here.
          </p>
          <div className="mt-6 flex justify-center">
            <GeenaButton demo="vagn" returnTo="/account" size="lg" />
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
