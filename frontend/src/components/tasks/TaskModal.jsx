import TaskForm from "./TaskForm";

export default function TaskModal({ open, task, onClose, onSubmit, loading, error }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/50"
      />
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          {task ? "Edit Task" : "Create New Task"}
        </h2>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <TaskForm task={task} onSubmit={onSubmit} onCancel={onClose} loading={loading} />
      </div>
    </div>
  );
}
