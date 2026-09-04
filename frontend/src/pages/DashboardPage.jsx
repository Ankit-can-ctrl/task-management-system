import { useCallback, useEffect, useState } from "react";
import { createTask, deleteTask, getTasks, updateTask } from "../api/taskApi";
import { getErrorMessage } from "../utils/getErrorMessage";
import DashboardStats from "../components/dashboard/DashboardStats";
import Navbar from "../components/layout/Navbar";
import Pagination from "../components/tasks/Pagination";
import TaskFilters from "../components/tasks/TaskFilters";
import TaskList from "../components/tasks/TaskList";
import TaskModal from "../components/tasks/TaskModal";

const defaultPagination = {
  totalCount: 0,
  totalPages: 1,
  currentPage: 1,
  limit: 5,
};

export default function DashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState(defaultPagination);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    priority: "",
    page: 1,
    limit: 5,
  });
  const [loading, setLoading] = useState(true);
  const [statsRefreshKey, setStatsRefreshKey] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [actionError, setActionError] = useState("");

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setActionError("");
    try {
      const params = {
        page: filters.page,
        limit: filters.limit,
        sortBy: "createdAt",
        order: "desc",
      };
      if (filters.search.trim()) params.search = filters.search.trim();
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;

      const res = await getTasks(params);
      setTasks(res.data.tasks);
      setPagination(res.data.pagination);
    } catch (err) {
      setActionError(getErrorMessage(err, "Failed to load tasks"));
      setTasks([]);
      setPagination(defaultPagination);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(fetchTasks, filters.search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchTasks, filters.search]);

  const refreshAll = () => {
    fetchTasks();
    setStatsRefreshKey((k) => k + 1);
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingTask(null);
    setFormError("");
  };

  const handleSubmitTask = async (data) => {
    setFormLoading(true);
    setFormError("");
    try {
      if (editingTask) {
        await updateTask(editingTask._id, data);
      } else {
        await createTask(data);
      }
      closeModal();
      refreshAll();
    } catch (err) {
      setFormError(getErrorMessage(err, "Failed to save task"));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteTask = async (task) => {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    setActionError("");
    try {
      await deleteTask(task._id);
      refreshAll();
    } catch (err) {
      setActionError(getErrorMessage(err, "Failed to delete task"));
    }
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
            <p className="text-sm text-slate-500">Manage your personal tasks</p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            + New Task
          </button>
        </div>

        <DashboardStats refreshKey={statsRefreshKey} />

        <TaskFilters filters={filters} onChange={setFilters} />

        {actionError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {actionError}
          </div>
        )}

        <TaskList
          tasks={tasks}
          loading={loading}
          onEdit={openEditModal}
          onDelete={handleDeleteTask}
        />

        <Pagination pagination={pagination} onPageChange={handlePageChange} />
      </main>

      <TaskModal
        open={modalOpen}
        task={editingTask}
        onClose={closeModal}
        onSubmit={handleSubmitTask}
        loading={formLoading}
        error={formError}
      />
    </div>
  );
}
