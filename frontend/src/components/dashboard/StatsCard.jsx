export default function StatsCard({ label, value, accentClass }) {
  return (
    <div className={`rounded-xl border p-5 shadow-sm ${accentClass}`}>
      <p className="text-sm font-medium opacity-80">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value ?? 0}</p>
    </div>
  );
}
