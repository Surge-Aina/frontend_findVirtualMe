import { MAINTENANCE_USER_MESSAGE, useMaintenance } from "@/shared/maintenance/MaintenanceProvider";

export default function MaintenanceNotice() {
  const { active } = useMaintenance();
  if (!active) return null;

  return (
    <p
      role="status"
      className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100"
    >
      {MAINTENANCE_USER_MESSAGE}
    </p>
  );
}