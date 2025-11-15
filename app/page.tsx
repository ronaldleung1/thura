'use client';

import Chat from '@/components/chat';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex justify-between mb-4">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Thura
          </h2>
          <Link href="/manage-apis" className="rounded bg-zinc-900 px-6 py-2 font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
            Manage APIs
          </Link>
        </div>

        <Chat />
      </div>
    </div>
  );
}
