import { useEffect, useState } from "react";
import { getTaskStats } from "../../api/taskApi";
import StatsCard from "./StatsCard";

export default function DashboardStats({ refreshKey }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await getTaskStats();
        if (!cancelled) setStats(res.data);
      } catch {
        if (!cancelled) {
          setStats({ total: 0, pending: 0, inProgress: 0, completed: 0 });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchStats();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-200" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatsCard
        label="Total Tasks"
        value={stats.total}
        accentClass="border-slate-200 bg-white text-slate-900"
      />
      <StatsCard
        label="Pending"
        value={stats.pending}
        accentClass="border-amber-200 bg-amber-50 text-amber-900"
      />
      <StatsCard
        label="In Progress"
        value={stats.inProgress}
        accentClass="border-blue-200 bg-blue-50 text-blue-900"
      />
      <StatsCard
        label="Completed"
        value={stats.completed}
        accentClass="border-emerald-200 bg-emerald-50 text-emerald-900"
      />
    </div>
  );
}
