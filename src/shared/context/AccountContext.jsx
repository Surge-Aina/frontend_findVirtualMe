import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./AuthContext";
import { isAccountTeamsEnabled } from "@/shared/config/accountTeams";
import { accountsApi } from "@/shared/api/accountsApi";

const STORAGE_KEY = "activeAccountId";

export const AccountContext = createContext({
  accounts: [],
  activeAccountId: null,
  activeAccount: null,
  setActiveAccountId: () => {},
  refreshAccounts: async () => {},
  loading: false,
});

export function AccountProvider({ children }) {
  const { token, user } = useContext(AuthContext);
  const [accounts, setAccounts] = useState([]);
  const [activeAccountId, setActiveAccountIdState] = useState(() =>
    localStorage.getItem(STORAGE_KEY)
  );
  const [loading, setLoading] = useState(false);

  const refreshAccounts = useCallback(async () => {
    if (!isAccountTeamsEnabled() || !token) {
      setAccounts([]);
      return;
    }
    setLoading(true);
    try {
      const res =
        user?.role === "super_admin"
          ? await accountsApi.listSuperAdminAccounts()
          : await accountsApi.listMine();
      const list = Array.isArray(res.data?.accounts) ? res.data.accounts : [];
      setAccounts(list);
      if (list.length === 1 && !activeAccountId) {
        const id = String(list[0].id);
        setActiveAccountIdState(id);
        localStorage.setItem(STORAGE_KEY, id);
      }
    } catch {
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }, [token, user?.role, activeAccountId]);

  useEffect(() => {
    refreshAccounts();
  }, [refreshAccounts]);

  const setActiveAccountId = useCallback((id) => {
    const next = id ? String(id) : null;
    setActiveAccountIdState(next);
    if (next) localStorage.setItem(STORAGE_KEY, next);
    else localStorage.removeItem(STORAGE_KEY);
  }, []);

  const activeAccount = useMemo(
    () => accounts.find((a) => String(a.id) === String(activeAccountId)) || null,
    [accounts, activeAccountId]
  );

  const value = useMemo(
    () => ({
      accounts,
      activeAccountId,
      activeAccount,
      setActiveAccountId,
      refreshAccounts,
      loading,
    }),
    [accounts, activeAccountId, activeAccount, setActiveAccountId, refreshAccounts, loading]
  );

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}