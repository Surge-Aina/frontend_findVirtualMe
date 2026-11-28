import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/shared/context/AuthContext";
import { AccountContext } from "@/shared/context/AccountContext";
import { isAccountTeamsEnabled } from "@/shared/config/accountTeams";

export default function AccountSwitcher() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { accounts, activeAccountId, setActiveAccountId, activeAccount } = useContext(AccountContext);

  if (!isAccountTeamsEnabled() || !user || user.role === "super_admin") {
    return null;
  }
  if (!accounts.length) return null;

  return (
    <div className="flex items-center gap-2">
      {accounts.length > 1 ? (
        <select
          aria-label="Active account"
          value={activeAccountId || ""}
          onChange={(e) => setActiveAccountId(e.target.value)}
          className="rounded-lg border border-slate-200 dark:border-neutral-600 bg-white/80 dark:bg-neutral-900 px-2 py-1 text-xs text-slate-800 dark:text-neutral-200"
        >
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </select>
      ) : (
        <span className="text-xs text-slate-600 dark:text-neutral-400 hidden lg:inline">
          {accounts[0]?.name}
        </span>
      )}
      {activeAccount?.role === "account_admin" && (
        <button
          type="button"
          onClick={() => navigate("/team")}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          Team
        </button>
      )}
    </div>
  );
}