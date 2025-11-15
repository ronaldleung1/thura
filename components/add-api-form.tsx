'use client';

import { useState } from 'react';

interface AddApiFormProps {
  onApiAdded: () => void;
}

export default function AddApiForm({ onApiAdded }: AddApiFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    endpoint: '',
    apiKey: '',
    httpMethod: 'GET',
    costPerCall: '',
    budgetLimit: '',
    parameterSchema: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Parse parameter schema JSON
      let parsedSchema;
      try {
        parsedSchema = JSON.parse(formData.parameterSchema);
      } catch {
        setError('Invalid JSON in parameter schema');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/user-apis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          costPerCall: parseFloat(formData.costPerCall),
          budgetLimit: parseFloat(formData.budgetLimit),
          parameterSchema: parsedSchema,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add API');
      }

      // Reset form
      setFormData({
        name: '',
        endpoint: '',
        apiKey: '',
        httpMethod: 'GET',
        costPerCall: '',
        budgetLimit: '',
        parameterSchema: '',
        description: '',
      });

      onApiAdded();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            API Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
            placeholder="Mapbox Geocoding"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            HTTP Method
          </label>
          <select
            value={formData.httpMethod}
            onChange={(e) => setFormData({ ...formData, httpMethod: e.target.value })}
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Endpoint URL
          </label>
          <input
            type="text"
            value={formData.endpoint}
            onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
            placeholder="https://api.example.com/{param}?key={apiKey}"
            required
          />
          <p className="mt-1 text-xs text-zinc-500">
            Use {'{paramName}'} for parameters and {'{apiKey}'} for your API key
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            API Key
          </label>
          <input
            type="text"
            value={formData.apiKey}
            onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
            placeholder="sk_xxxxx"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Cost per Call ($)
          </label>
          <input
            type="number"
            step="0.000001"
            value={formData.costPerCall}
            onChange={(e) => setFormData({ ...formData, costPerCall: e.target.value })}
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
            placeholder="0.0005"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Budget Limit ($)
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.budgetLimit}
            onChange={(e) => setFormData({ ...formData, budgetLimit: e.target.value })}
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
            placeholder="5.00"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Parameter Schema (JSON)
          </label>
          <input
            type="text"
            value={formData.parameterSchema}
            onChange={(e) => setFormData({ ...formData, parameterSchema: e.target.value })}
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
            placeholder='{"query": "string"}'
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Description
          </label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
            placeholder="Get lat/long coordinates for an address"
            required
          />
        </div>
      </div>

      {error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded bg-zinc-900 px-4 py-2 font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {loading ? 'Adding...' : 'Add API'}
      </button>
    </form>
  );
}
