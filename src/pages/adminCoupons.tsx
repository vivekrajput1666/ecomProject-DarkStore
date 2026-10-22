import { useEffect, useState } from "react";
import { getCoupons, type Coupon } from "../api/couponApi";

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCoupons = async () => {
      try {
        setLoading(true);
        setError("");
        setCoupons(await getCoupons());
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Failed to load coupons"
        );
      } finally {
        setLoading(false);
      }
    };

    loadCoupons();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-amber-400 text-xs font-bold tracking-[0.3em] uppercase">
          Admin
        </p>
        <h1 className="text-3xl font-bold text-white mt-2">
          Coupons
        </h1>
        <p className="text-zinc-500 mt-2">
          Manage promotional coupons for your store.
        </p>
      </div>

      {error && (
        <p className="rounded border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <section className="overflow-hidden rounded-xl border border-zinc-800 bg-[#151515]">
        {loading ? (
          <p className="p-6 text-zinc-400">Loading coupons...</p>
        ) : coupons.length === 0 ? (
          <p className="p-6 text-zinc-400">No coupons found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-xl text-left text-sm">
              <thead className="border-b border-zinc-800 text-zinc-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Code</th>
                  <th className="px-6 py-4 font-medium">Discount</th>
                  <th className="px-6 py-4 font-medium">Expires</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="text-zinc-300">
                    <td className="px-6 py-4 font-semibold text-white">
                      {coupon.code}
                    </td>
                    <td className="px-6 py-4">
                      {coupon.discount_percent !== undefined
                        ? `${coupon.discount_percent}%`
                        : coupon.discount_amount !== undefined
                          ? `$${coupon.discount_amount}`
                          : "-"}
                    </td>
                    <td className="px-6 py-4">
                      {coupon.expires_at
                        ? new Date(coupon.expires_at).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4">
                      {coupon.is_active === false ? "Inactive" : "Active"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
