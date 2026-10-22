import { useEffect, useState } from "react";
import {
  activateUser,
  deactivateUser,
  deleteUser,
  getUsers,
} from "../../api/adminApi";
import { useAuth } from "../../components/context/AuthContext";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean | number | string;
}

const isActiveUser = (value: AdminUser["is_active"]) =>
  value === true || Number(value) === 1;

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getUsers();
      if (!response?.success) {
        throw new Error(response?.message || "Failed to load users");
      }
      setUsers(response.users || []);
    } catch (requestError: any) {
      console.error("ADMIN USERS ERROR:", requestError);
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Failed to load users"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const toggleUserStatus = async (user: AdminUser) => {
    const currentlyActive = isActiveUser(user.is_active);
    const action = currentlyActive ? "deactivate" : "activate";

    if (
      currentlyActive &&
      !window.confirm(`Deactivate ${user.name || user.email}?`)
    ) {
      return;
    }

    try {
      setActionId(user.id);
      setError("");
      setMessage("");
      const response = currentlyActive
        ? await deactivateUser(user.id)
        : await activateUser(user.id);

      if (!response?.success) {
        throw new Error(response?.message || `Failed to ${action} user`);
      }

      setMessage(response.message || `User ${action}d successfully`);
      await loadUsers();
    } catch (requestError: any) {
      console.error("UPDATE USER STATUS ERROR:", requestError);
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          `Failed to ${action} user`
      );
    } finally {
      setActionId(null);
    }
  };

  const handleDeleteUser = async (user: AdminUser) => {
    if (!window.confirm(`Permanently delete ${user.name || user.email}?`)) {
      return;
    }

    try {
      setActionId(user.id);
      setError("");
      setMessage("");
      const response = await deleteUser(user.id);

      if (!response?.success) {
        throw new Error(response?.message || "Failed to delete user");
      }

      setMessage(response.message || "User deleted successfully");
      await loadUsers();
    } catch (requestError: any) {
      console.error("DELETE USER ERROR:", requestError);
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Failed to delete user"
      );
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <p className="text-amber-400 text-xs font-bold tracking-[0.3em] uppercase">Admin</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Users</h1>
        <p className="mt-2 text-zinc-500">Review accounts and manage access status.</p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded border border-zinc-800 bg-[#151515] px-4 py-2 text-sm text-zinc-300">{users.length} users</span>
        <span className="rounded border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-400">
          {users.filter((user) => isActiveUser(user.is_active)).length} active
        </span>
      </div>

      {message && <p role="status" className="text-sm text-emerald-400">{message}</p>}
      {error && <p role="alert" className="rounded border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-400">{error}</p>}

      <section className="overflow-hidden rounded-xl border border-zinc-800 bg-[#151515]">
        {loading ? (
          <p className="p-6 text-sm text-zinc-400">Loading users...</p>
        ) : error && users.length === 0 ? (
          <div className="p-6">
            <button onClick={() => void loadUsers()} className="text-sm font-semibold text-amber-400 hover:text-amber-300">Try again</button>
          </div>
        ) : users.length === 0 ? (
          <p className="p-6 text-sm text-zinc-400">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-190 text-left text-sm">
              <thead className="border-b border-zinc-800 text-zinc-500">
                <tr>
                  <th className="px-5 py-3 font-medium sm:px-6">ID</th>
                  <th className="px-5 py-3 font-medium sm:px-6">Name</th>
                  <th className="px-5 py-3 font-medium sm:px-6">Email</th>
                  <th className="px-5 py-3 font-medium sm:px-6">Role</th>
                  <th className="px-5 py-3 font-medium sm:px-6">Status</th>
                  <th className="px-5 py-3 font-medium sm:px-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {users.map((user) => {
                  const active = isActiveUser(user.is_active);
                  return (
                    <tr key={user.id} className="text-zinc-300">
                      <td className="px-5 py-4 sm:px-6">{user.id}</td>
                      <td className="px-5 py-4 font-medium text-white sm:px-6">{user.name || "-"}</td>
                      <td className="px-5 py-4 text-zinc-400 sm:px-6">{user.email}</td>
                      <td className="px-5 py-4 capitalize text-zinc-400 sm:px-6">{user.role || "-"}</td>
                      <td className="px-5 py-4 sm:px-6">
                        <span className={`inline-flex rounded border px-2.5 py-1 text-xs font-medium ${active ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-400" : "border-zinc-700 bg-zinc-800 text-zinc-400"}`}>
                          {active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-4 sm:px-6">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => void toggleUserStatus(user)}
                            disabled={actionId === user.id}
                            className={`rounded px-3 py-2 text-xs font-semibold disabled:opacity-50 ${active ? "border border-red-400/20 text-red-400 hover:bg-red-400/10" : "bg-amber-400 text-black hover:bg-amber-300"}`}
                          >
                            {actionId === user.id ? "Saving..." : active ? "Deactivate" : "Activate"}
                          </button>
                          {user.id !== currentUser?.id && (
                            <button
                              onClick={() => void handleDeleteUser(user)}
                              disabled={actionId === user.id}
                              className="rounded border border-red-400/20 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-400/10 disabled:opacity-50"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
