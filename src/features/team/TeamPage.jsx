import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "@/shared/context/AuthContext";
import { AccountContext } from "@/shared/context/AccountContext";
import { isAccountTeamsEnabled } from "@/shared/config/accountTeams";
import { accountsApi } from "@/shared/api/accountsApi";
import { logApiError } from "@/shared/api/safeLog";

const ROLES = ["account_admin", "editor", "viewer"];

export default function TeamPage() {
  const navigate = useNavigate();
  const { token, user } = useContext(AuthContext);
  const { activeAccountId, activeAccount, refreshAccounts } = useContext(AccountContext);
  const [members, setMembers] = useState([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("editor");

  const teamsOn = isAccountTeamsEnabled();
  const canManage =
    teamsOn && (activeAccount?.role === "account_admin" || user?.role === "super_admin");

  useEffect(() => {
    if (!teamsOn || !token) {
      navigate("/dashboard");
    }
  }, [teamsOn, token, navigate]);

  useEffect(() => {
    const load = async () => {
      if (!canManage || !activeAccountId) return;
      try {
        const res = await accountsApi.listMembers(activeAccountId);
        setMembers(Array.isArray(res.data?.members) ? res.data.members : []);
      } catch (error) {
        logApiError(error, "Error loading team members");
        toast.error("Could not load team members");
      }
    };
    load();
  }, [canManage, activeAccountId]);

  if (!teamsOn) return null;

  if (!canManage) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-neutral-950 pt-24 px-4">
        <div className="max-w-3xl mx-auto bg-white dark:bg-neutral-900 rounded-2xl shadow-md p-8 text-slate-700 dark:text-neutral-200">
          Only account admins can manage team members.
        </div>
      </main>
    );
  }

  const onInvite = async (event) => {
    event.preventDefault();
    try {
      await accountsApi.addMember(activeAccountId, {
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      toast.success("Member saved");
      setInviteEmail("");
      const res = await accountsApi.listMembers(activeAccountId);
      setMembers(Array.isArray(res.data?.members) ? res.data.members : []);
      await refreshAccounts();
    } catch (error) {
      logApiError(error, "Invite member failed");
      toast.error(error.response?.data?.error || "Could not add member");
    }
  };

  const onRoleChange = async (membershipId, role) => {
    try {
      await accountsApi.updateMember(activeAccountId, membershipId, { role });
      const res = await accountsApi.listMembers(activeAccountId);
      setMembers(Array.isArray(res.data?.members) ? res.data.members : []);
    } catch (error) {
      toast.error(error.response?.data?.error || "Could not update role");
    }
  };

  const onRemove = async (membershipId) => {
    try {
      await accountsApi.removeMember(activeAccountId, membershipId);
      const res = await accountsApi.listMembers(activeAccountId);
      setMembers(Array.isArray(res.data?.members) ? res.data.members : []);
    } catch (error) {
      toast.error(error.response?.data?.error || "Could not remove member");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-neutral-950 pt-24 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <header>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-neutral-100">Team</h1>
          <p className="text-sm text-slate-600 dark:text-neutral-400 mt-1">
            Members and roles for the active workspace.
          </p>
        </header>

        <form
          onSubmit={onInvite}
          className="bg-white dark:bg-neutral-900 rounded-2xl shadow-md p-6 space-y-4 border border-slate-200 dark:border-neutral-700"
        >
          <h2 className="font-semibold text-slate-800 dark:text-neutral-100">Invite by email</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="teammate@example.test"
              className="flex-1 rounded-lg border border-slate-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="rounded-lg border border-slate-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </form>

        <section className="bg-white dark:bg-neutral-900 rounded-2xl shadow-md p-6 border border-slate-200 dark:border-neutral-700">
          <h2 className="font-semibold text-slate-800 dark:text-neutral-100 mb-4">Members</h2>
          <ul className="divide-y divide-slate-200 dark:divide-neutral-700">
            {members.map((member) => (
              <li key={member.id} className="py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <MemberRowEmail email={member.email} userId={member.userId} />
                  <div className="text-xs text-slate-500 capitalize">{member.status}</div>
                </div>
                <select
                  value={member.role}
                  onChange={(e) => onRoleChange(member.id, e.target.value)}
                  className="rounded-lg border border-slate-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => onRemove(member.id)}
                  className="rounded-lg border border-slate-300 dark:border-neutral-600 px-3 py-2 text-sm text-slate-700 dark:text-neutral-200"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}

function MemberRowEmail({ email, userId }) {
  return (
    <div className="font-medium text-slate-800 dark:text-neutral-100 truncate">
      {email}
      {userId ? <span className="text-xs text-slate-400 ml-2">({userId})</span> : null}
    </div>
  );
}