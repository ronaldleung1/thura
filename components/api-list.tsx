'use client';

interface UserApi {
  id: string;
  name: string;
  endpoint: string;
  httpMethod: string;
  costPerCall: string;
  budgetLimit: string;
  spendAmount: string;
  description: string;
  createdAt: string;
}

interface ApiListProps {
  apis: UserApi[];
  onDelete: (apiId: string) => void;
}

export default function ApiList({ apis, onDelete }: ApiListProps) {
  if (apis.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-zinc-600 dark:text-zinc-400">
          No APIs yet. Add your first API above!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {apis.map((api) => {
        const spend = parseFloat(api.spendAmount);
        const budget = parseFloat(api.budgetLimit);
        const percentage = budget > 0 ? (spend / budget) * 100 : 0;
        const callCount = spend > 0 ? Math.round(spend / parseFloat(api.costPerCall)) : 0;

        return (
          <div
            key={api.id}
            className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  {api.name}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {api.description}
                </p>
              </div>
              <button
                onClick={() => onDelete(api.id)}
                className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                Delete
              </button>
            </div>

            <div className="mb-2">
              <div className="mb-1 flex items-baseline justify-between">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Spend: ${spend.toFixed(4)} / ${budget.toFixed(2)}
                </span>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  {percentage.toFixed(1)}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                <div
                  className={`h-full transition-all ${
                    percentage > 90
                      ? 'bg-red-600'
                      : percentage > 70
                      ? 'bg-yellow-600'
                      : 'bg-green-600'
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-zinc-600 dark:text-zinc-400">
              <span>Calls: {callCount}</span>
              <span>•</span>
              <span>Cost/call: ${parseFloat(api.costPerCall).toFixed(6)}</span>
              <span>•</span>
              <span>{api.httpMethod}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
