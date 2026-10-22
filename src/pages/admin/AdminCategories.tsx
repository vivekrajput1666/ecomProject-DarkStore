import { useEffect, useState, type FormEvent } from "react";
import {
  createCategory,
  getCategories,
  deleteCategory,
  type Category,
} from "../../api/categoryApi";

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");
      setCategories(await getCategories());
    } catch (requestError: any) {
      console.error("ADMIN CATEGORIES ERROR:", requestError);
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Failed to load categories"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCategories();
  }, []);

  const handleCreateCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await createCategory({
        name: name.trim(),
        description: description.trim(),
      });

      if (!response?.success) {
        throw new Error(response?.message || "Failed to add category");
      }

      setName("");
      setDescription("");
      setMessage(response.message || "Category added successfully");
      await loadCategories();
    } catch (requestError: any) {
      console.error("CREATE CATEGORY ERROR:", requestError);
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Failed to add category"
      );
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async (id: number) => {
  if (!window.confirm("Delete this category?")) return;

  try {
    await deleteCategory(id);
    alert("Category deleted successfully!");
    window.location.reload();
  } catch (error) {
    alert("Failed to delete category");
  }
};

  return (
    <div className="space-y-8">
      <header>
        <p className="text-amber-400 text-xs font-bold tracking-[0.3em] uppercase">
          Admin
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white">Categories</h1>
        <p className="mt-2 text-zinc-500">View and add product categories.</p>
      </header>

      <section className="rounded-xl border border-zinc-800 bg-[#151515] p-5 sm:p-6">
        <h2 className="mb-5 text-lg font-semibold text-white">Add category</h2>
        <form onSubmit={handleCreateCategory} className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm text-zinc-400">
            Category name
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-white outline-none focus:border-amber-400"
              maxLength={100}
            />
          </label>
          <label className="block text-sm text-zinc-400">
            Description
            <input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="mt-2 w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-white outline-none focus:border-amber-400"
              maxLength={255}
            />
          </label>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="rounded bg-amber-400 px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Adding..." : "Add category"}
            </button>
          </div>
        </form>
        {message && <p role="status" className="mt-4 text-sm text-emerald-400">{message}</p>}
        {error && <p role="alert" className="mt-4 text-sm text-red-400">{error}</p>}
      </section>

      <section className="overflow-hidden rounded-xl border border-zinc-800 bg-[#151515]">
        <div className="border-b border-zinc-800 px-5 py-4 sm:px-6">
          <h2 className="font-semibold text-white">All categories</h2>
        </div>
        {loading ? (
          <p className="p-6 text-sm text-zinc-400">Loading categories...</p>
        ) : error && categories.length === 0 ? (
          <div className="p-6">
            <p className="text-sm text-red-400">{error}</p>
            <button onClick={() => void loadCategories()} className="mt-4 text-sm font-semibold text-amber-400 hover:text-amber-300">
              Try again
            </button>
          </div>
        ) : categories.length === 0 ? (
          <p className="p-6 text-sm text-zinc-400">No categories found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="border-b border-zinc-800 text-zinc-500">
                <tr>
                  <th className="px-5 py-3 font-medium sm:px-6">ID</th>
                  <th className="px-5 py-3 font-medium sm:px-6">Category</th>
                  <th className="px-5 py-3 font-medium sm:px-6">Description</th>
                  <th className="px-5 py-3 font-medium sm:px-6">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {categories.map((category) => (
                  <tr key={category.id} className="text-zinc-300">
                    <td className="px-5 py-4 sm:px-6">{category.id}</td>
                    <td className="px-5 py-4 font-medium text-white sm:px-6">{category.name}</td>
                    <td className="px-5 py-4 text-zinc-400 sm:px-6">{category.description || "-"}</td>
                    <td className="px-5 py-4 text-zinc-400 sm:px-6">
                      {category.created_at ? new Date(category.created_at).toLocaleDateString() : "-"}
                      <button
  onClick={() => handleDelete(category.id)}
  className="bg-red-500 text-white px-3 ml-30 py-1 rounded"
>
  Delete
</button>
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
