'use client';

import { useState, useEffect } from 'react';
import AddApiForm from '@/components/add-api-form';
import ApiList from '@/components/api-list';
import Chat from '@/components/chat';

export default function Home() {
  const [apis, setApis] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApis = async () => {
    try {
      const res = await fetch('/api/user-apis');
      const data = await res.json();
      setApis(data.apis || []);
    } catch (error) {
      console.error('Failed to fetch APIs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApis();
  }, []);

  const handleApiAdded = () => {
    fetchApis(); // Refresh the list
  };

  const handleApiDeleted = async (apiId: string) => {
    try {
      await fetch(`/api/user-apis?id=${apiId}`, { method: 'DELETE' });
      fetchApis(); // Refresh the list
    } catch (error) {
      console.error('Failed to delete API:', error);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
            API Spending Control
          </h1>
          <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
            Add any API to Claude, track spending, enforce budgets
          </p>
        </div>

        {/* Add API Form */}
        <div className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Add New API
          </h2>
          <AddApiForm onApiAdded={handleApiAdded} />
        </div>

        {/* API List */}
        <div className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Your APIs
          </h2>
          {loading ? (
            <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
          ) : (
            <ApiList apis={apis} onDelete={handleApiDeleted} />
          )}
        </div>

        {/* Chat Interface */}
        <div>
          <h2 className="mb-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Chat with Claude (has access to your APIs)
          </h2>
          <Chat />
        </div>
      </div>
    </div>
  );
}
