import { useEffect, useState } from "react";
import api from "../api/axios";

interface Review {
  id: number;
  user_id: number;
  product_id: number;
  rating: number;
  comment: string | null;
  is_approved: number;
  created_at: string;
  user_name: string;
  product_name: string;
}

const AdminReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get("/review/all");
      setReviews(response.data.reviews || []);
      setError("");
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
      setError("Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleAction = async (
    id: number,
    action: "approve" | "reject" | "delete"
  ) => {
    try {
      if (action === "delete") {
        await api.delete(`/review/${id}`);
      } else {
        await api.put(`/review/${id}/${action}`);
      }

      await fetchReviews();
    } catch (err) {
      console.error(`Failed to ${action} review:`, err);
      alert(`Failed to ${action} review.`);
    }
  };

  if (loading) {
    return <p className="text-zinc-400">Loading reviews...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Reviews</h1>
        <p className="mt-2 text-zinc-400">
          Manage and moderate customer reviews.
        </p>
      </div>

      {error && <p className="text-red-400">{error}</p>}

      {reviews.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-[#111111] p-8 text-center text-zinc-400">
          No reviews found.
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-xl border border-zinc-800 bg-[#111111] p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {review.product_name}
                  </h2>
                  <p className="text-sm text-zinc-400">
                    By {review.user_name}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    review.is_approved
                      ? "bg-green-900/40 text-green-400"
                      : "bg-yellow-900/40 text-yellow-400"
                  }`}
                >
                  {review.is_approved ? "Approved" : "Pending"}
                </span>
              </div>

              <p className="mt-3 text-amber-400">
                {"★".repeat(review.rating)}
                {"☆".repeat(5 - review.rating)}
              </p>

              <p className="mt-3 whitespace-pre-wrap text-zinc-300">
                {review.comment || "No comment provided."}
              </p>

              <p className="mt-3 text-xs text-zinc-500">
                {new Date(review.created_at).toLocaleDateString()}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                {!review.is_approved && (
                  <button
                    onClick={() => handleAction(review.id, "approve")}
                    className="rounded bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500"
                  >
                    Approve
                  </button>
                )}

                {review.is_approved ? (
                  <button
                    onClick={() => handleAction(review.id, "reject")}
                    className="rounded bg-yellow-600 px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-500"
                  >
                    Reject
                  </button>
                ) : null}

                <button
                  onClick={() => {
                    if (window.confirm("Delete this review permanently?")) {
                      handleAction(review.id, "delete");
                    }
                  }}
                  className="rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReviews;