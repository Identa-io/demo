'use client';

import { useEffect, useState } from 'react';
import type { DemoSlug } from '@/lib/demos';
import type { BackstageEntry } from '@/lib/session';

interface BackstageData {
  demo: string;
  manifest: unknown;
  manifestId: string | null;
  clientId: string;
  requestId: string | null;
  connected: boolean;
  log: BackstageEntry[];
}

type Tab = 'connection' | 'log' | 'manifest';

/**
 * The partner-facing X-ray, kept in the neutral Geena chrome on purpose (brand ≠ chrome): the
 * manifest this demo opens, the live connection ids, and every upstream call the coordinator
 * made this session — method, path, status, latency. The demos sell the UX; this sells the
 * integration.
 */
export function BackstageDrawer({ demo }: { demo: DemoSlug }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('connection');
  const [data, setData] = useState<BackstageData | null>(null);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    const load = async () => {
      const res = await fetch(`/api/backstage?demo=${demo}`, { cache: 'no-store' });
      if (res.ok && alive) setData((await res.json()) as BackstageData);
    };
    void load();
    const timer = setInterval(() => void load(), 4000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [open, demo]);

  return (
    <div className="fixed bottom-4 right-4 z-50" style={{ fontFamily: 'var(--font-inter)' }}>
      {open && (
        <div className="mb-2 flex max-h-[70vh] w-[min(30rem,90vw)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#17151f] text-[12px] text-slate-200 shadow-2xl">
          <div className="flex items-center gap-1 border-b border-white/10 px-3 py-2">
            {(['connection', 'log', 'manifest'] as Tab[]).map((id) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold capitalize ${
                  tab === id ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {id === 'log' ? 'API log' : id}
              </button>
            ))}
            <span className="ml-auto text-[10px] uppercase tracking-widest text-slate-500">
              backstage
            </span>
          </div>

          <div className="overflow-y-auto p-3 font-mono text-[11px] leading-relaxed">
            {tab === 'connection' && (
              <dl className="space-y-1.5">
                <Row k="client_id" v={data?.clientId ?? '…'} />
                <Row k="manifest_id" v={data?.manifestId ?? '(not configured)'} />
                <Row k="request_id" v={data?.requestId ?? '— returned by the token exchange'} />
                <Row k="connected" v={String(data?.connected ?? false)} />
                <p className="pt-2 text-slate-400">
                  Tokens live server-side only; the browser holds an opaque session id. Slot ids are
                  read from `status`, never hard-coded.
                </p>
              </dl>
            )}
            {tab === 'log' &&
              (data?.log.length ? (
                <div className="space-y-1">
                  {[...data.log].reverse().map((entry, index) => (
                    <div key={index} className="flex items-baseline gap-2">
                      <span className={entry.status < 400 ? 'text-emerald-400' : 'text-red-400'}>
                        {entry.status}
                      </span>
                      <span className="text-slate-400">{entry.method}</span>
                      <span className="min-w-0 flex-1 truncate">{entry.path}</span>
                      <span className="text-slate-500">{entry.ms}ms</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400">No upstream calls yet — connect first.</p>
              ))}
            {tab === 'manifest' && (
              <pre className="whitespace-pre-wrap break-all">
                {JSON.stringify(data?.manifest ?? {}, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-full border border-white/10 bg-[#17151f] px-4 py-2 text-[12px] font-semibold text-white shadow-lg hover:bg-[#241f31]"
      >
        {open ? 'Close backstage' : 'Backstage'}
      </button>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-24 shrink-0 text-slate-500">{k}</dt>
      <dd className="break-all">{v}</dd>
    </div>
  );
}
