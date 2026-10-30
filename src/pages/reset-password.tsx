import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setError("");
        setMessage("");

        if (!token) {
            setError("Invalid or missing reset token.");
            return;
        }

        if (password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        if (password.length > 72) {
            setError("Password cannot exceed 72 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            const response = await api.post("/user/reset-password", {
                token,
                newPassword: password,
            });

            setMessage(
                response.data.message || "Password changed successfully!"
            );

            setTimeout(() => {
                navigate("/login");
            }, 2000);

        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                "Unable to reset password. Your link may have expired."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#090909] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-8">

                <h1 className="text-3xl font-black text-white text-center mb-2">
                    RESET <span className="text-amber-400">PASSWORD</span>
                </h1>

                <p className="text-zinc-400 text-center text-sm mb-8">
                    Enter your new password below.
                </p>

                {!token && (
                    <p className="text-red-400 text-sm text-center mb-4">
                        Invalid or missing reset link.
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">

                    <div>
                        <label className="block text-sm text-zinc-300 mb-2">
                            New Password
                        </label>

                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter new password"
                            required
                            minLength={8}
                            maxLength={72}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white outline-none focus:border-amber-400"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-zinc-300 mb-2">
                            Confirm Password
                        </label>

                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            required
                            minLength={8}
                            maxLength={72}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white outline-none focus:border-amber-400"
                        />
                    </div>

                    {error && (
                        <p className="text-red-400 text-sm">{error}</p>
                    )}

                    {message && (
                        <p className="text-green-400 text-sm">{message}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !token}
                        className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black font-bold py-3 rounded-lg transition"
                    >
                        {loading ? "CHANGING PASSWORD..." : "CHANGE PASSWORD"}
                    </button>

                </form>

                <button
                    onClick={() => navigate("/login")}
                    className="w-full text-zinc-400 hover:text-amber-400 text-sm mt-6"
                >
                    Back to Sign In
                </button>

            </div>
        </div>
    );
}