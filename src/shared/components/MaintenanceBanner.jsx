import { MAINTENANCE_USER_MESSAGE, useMaintenance } from "@/shared/maintenance/MaintenanceProvider";

export default function MaintenanceBanner() {
  const { active } = useMaintenance();
  if (!active) return null;

  return (
    <div
      role="status"
      className="bg-amber-100 dark:bg-amber-950 border-b border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-100 px-4 py-3 text-center text-sm"
    >
      {MAINTENANCE_USER_MESSAGE}
    </div>
  );
}