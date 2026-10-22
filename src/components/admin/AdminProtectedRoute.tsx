import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminProtectedRoute = () => {
  const { user, loading } = useAuth();

  console.log("ADMIN PROTECTION:", {
    loading,
    user,
    role: user?.role,
  });

  // Wait until AuthContext checks the token
  if (loading) {
    return (
      <div className="min-h-screen bg-[#090909] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />

          <p className="text-zinc-400">
            Checking admin access...
          </p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but not admin
  if (user.role !== "admin") {
    console.log("ACCESS DENIED:", user.role);

    return <Navigate to="/" replace />;
  }

  // Admin
  return <Outlet />;
};

export default AdminProtectedRoute;