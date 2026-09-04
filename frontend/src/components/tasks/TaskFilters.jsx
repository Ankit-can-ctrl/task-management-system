import { TASK_PRIORITIES, TASK_STATUSES } from "../../utils/constants";

export default function TaskFilters({ filters, onChange }) {
  const handleChange = (e) => {
    onChange({ ...filters, [e.target.name]: e.target.value, page: 1 });
  };

  const handleSearchChange = (e) => {
    onChange({ ...filters, search: e.target.value, page: 1 });
  };

  const clearFilters = () => {
    onChange({ search: "", status: "", priority: "", page: 1, limit: filters.limit });
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <label htmlFor="search" className="mb-1.5 block text-xs font-medium text-slate-600">
            Search by title
          </label>
          <input
            id="search"
            name="search"
            type="text"
            value={filters.search}
            onChange={handleSearchChange}
            placeholder="Search tasks..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div>
          <label htmlFor="status" className="mb-1.5 block text-xs font-medium text-slate-600">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={filters.status}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">All statuses</option>
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="priority" className="mb-1.5 block text-xs font-medium text-slate-600">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            value={filters.priority}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">All priorities</option>
            {TASK_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </div>
      </div>

      {(filters.search || filters.status || filters.priority) && (
        <button
          type="button"
          onClick={clearFilters}
          className="mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
