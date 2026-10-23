import { useEffect, useState } from "react";
import axios from "axios";
import {
    getProducts,
    createProduct,
    updateProduct,
    type Product,
} from "../api/productApi";

import {
    getCategories,
    type Category,
} from "../api/categoryApi";

interface ProductForm {
    name: string;
    description: string;
    price: string;
    stock: string;
    category_id: string;
}

const emptyForm: ProductForm = {
    name: "",
    description: "",
    price: "",
    stock: "",
    category_id: "",
};

export default function AdminProducts() {
    // =========================
    // STATE
    // =========================

    const [products, setProducts] = useState<Product[]>([]);

    const [categories, setCategories] = useState<Category[]>([]);

    const [form, setForm] =
        useState<ProductForm>(emptyForm);

    const [editingId, setEditingId] =
        useState<number | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [message, setMessage] =
        useState("");

    const [error, setError] =
        useState("");

    // =========================
    // LOAD PRODUCTS
    // =========================

    const loadProducts = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getProducts();

            console.log(
                "PRODUCTS RESPONSE:",
                response
            );

            if (response?.success) {
                setProducts(
                    response.products || []
                );
            } else {
                setError(
                    response?.message ||
                        "Failed to load products"
                );
            }
        } catch (err: any) {
            console.error(
                "GET PRODUCTS ERROR:",
                err
            );

            setError(
                err.response?.data?.message ||
                    "Failed to load products"
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // LOAD CATEGORIES
    // =========================
    

    const loadCategories = async () => {
        try {
            const data =
                await getCategories();

            console.log(
                "CATEGORIES:",
                data
            );

            setCategories(data || []);
        } catch (err: any) {
            console.error(
                "GET CATEGORIES ERROR:",
                err
            );

            setError(
                err.response?.data?.message ||
                    "Failed to load categories"
            );
        }
    };
    
    const handleDelete = async (id: number) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this category?"
  );

  if (!confirmDelete) return;

  try {
    await axios.delete(`/api/categories/${id}`);

    setCategories((prev) =>
      prev.filter((category) => category.id !== id)
    );

    alert("Category deleted successfully!");
  } catch (error: any) {
    console.error("Delete category error:", error);

    alert(
      error.response?.data?.message ||
      "Failed to delete category."
    );
  }
};

    // =========================
    // INITIAL LOAD
    // =========================

    useEffect(() => {
        loadProducts();
        loadCategories();
    }, []);
    

    // =========================
    // INPUT CHANGE
    // =========================

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement |
                HTMLTextAreaElement |
                HTMLSelectElement
        >
    ) => {
        const {
            name,
            value,
        } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // =========================
    // CREATE / UPDATE
    // =========================

    const handleSubmit = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        setMessage("");
        setError("");

        // Product name
        if (!form.name.trim()) {
            setError(
                "Product name is required"
            );
            return;
        }

        // Price
        if (form.price === "") {
            setError("Price is required");
            return;
        }

        // Stock
        if (form.stock === "") {
            setError("Stock is required");
            return;
        }

        // Price validation
        if (Number(form.price) < 0) {
            setError(
                "Price cannot be negative"
            );
            return;
        }

        // Stock validation
        if (Number(form.stock) < 0) {
            setError(
                "Stock cannot be negative"
            );
            return;
        }

        try {
            setSaving(true);

            const productData = {
                name: form.name.trim(),

                description:
                    form.description.trim() ||
                    null,

                price: Number(form.price),

                stock: Number(form.stock),

                category_id:
                    form.category_id === ""
                        ? null
                        : Number(
                              form.category_id
                          ),
            };

            console.log(
                "SENDING PRODUCT:",
                productData
            );

            // =========================
            // UPDATE
            // =========================

            if (editingId !== null) {
                const response =
                    await updateProduct(
                        editingId,
                        productData
                    );

                if (!response?.success) {
                    throw new Error(
                        response?.message ||
                            "Failed to update product"
                    );
                }

                setMessage(
                    "Product updated successfully!"
                );
            }

            // =========================
            // CREATE
            // =========================

            else {
                const response =
                    await createProduct(
                        productData
                    );

                if (!response?.success) {
                    throw new Error(
                        response?.message ||
                            "Failed to create product"
                    );
                }

                setMessage(
                    "Product created successfully!"
                );
            }

            // Reset form
            setForm(emptyForm);

            setEditingId(null);

            // Reload products
            await loadProducts();
        } catch (err: any) {
            console.error(
                "SAVE PRODUCT ERROR:",
                err
            );

            setError(
                err.response?.data?.message ||
                    err.message ||
                    "Failed to save product"
            );
        } finally {
            setSaving(false);
        }
    };

    // =========================
    // EDIT PRODUCT
    // =========================

    const handleEdit = (
        product: Product
    ) => {
        setMessage("");
        setError("");

        setEditingId(product.id);

        setForm({
            name:
                product.name || "",

            description:
                product.description || "",

            price:
                product.price !== null &&
                product.price !== undefined
                    ? String(
                          product.price
                      )
                    : "",

            stock:
                product.stock !== null &&
                product.stock !== undefined
                    ? String(
                          product.stock
                      )
                    : "",

            category_id:
                product.category_id !==
                    null &&
                product.category_id !==
                    undefined
                    ? String(
                          product.category_id
                      )
                    : "",
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    // =========================
    // CANCEL EDIT
    // =========================

    const handleCancelEdit = () => {
        setEditingId(null);

        setForm(emptyForm);

        setMessage("");

        setError("");
    };

    // =========================
    // DELETE PRODUCT
    // =========================

    

    // =========================
    // UI
    // =========================

    return (
        <div className="space-y-8">

            {/* =========================
                HEADER
            ========================= */}

            <div>
                <p className="text-amber-400 text-xs font-bold tracking-[0.3em] uppercase">
                    Admin
                </p>

                <h1 className="text-3xl font-bold text-white mt-2">
                    Products
                </h1>

                <p className="text-zinc-500 mt-2">
                    Create, edit and manage your
                    store products.
                </p>
            </div>

            {/* =========================
                ERROR
            ========================= */}

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm">
                    {error}
                </div>
            )}

            {/* =========================
                SUCCESS
            ========================= */}

            {message && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg px-4 py-3 text-sm">
                    {message}
                </div>
            )}

            {/* =========================
                ADD / EDIT PRODUCT
            ========================= */}

            <div className="bg-[#151515] border border-zinc-800 rounded-xl p-6">

                <div className="flex items-center justify-between mb-6">

                    <div>
                        <h2 className="text-xl font-bold text-white">
                            {editingId !==
                            null
                                ? "Edit Product"
                                : "Add Product"}
                        </h2>

                        <p className="text-zinc-500 text-sm mt-1">
                            {editingId !==
                            null
                                ? `Editing product #${editingId}`
                                : "Create a new product"}
                        </p>
                    </div>

                    {editingId !==
                        null && (
                        <button
                            type="button"
                            onClick={
                                handleCancelEdit
                            }
                            className="text-sm text-zinc-400 hover:text-white"
                        >
                            Cancel
                        </button>
                    )}

                </div>

                <form
                    onSubmit={
                        handleSubmit
                    }
                    className="space-y-5"
                >

                    {/* PRODUCT NAME */}

                    <div>
                        <label className="block text-sm text-zinc-400 mb-2">
                            Product Name
                        </label>

                        <input
                            type="text"
                            name="name"
                            value={
                                form.name
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="Enter product name"
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white outline-none focus:border-amber-400"
                        />
                    </div>

                    {/* DESCRIPTION */}

                    <div>
                        <label className="block text-sm text-zinc-400 mb-2">
                            Description
                        </label>

                        <textarea
                            name="description"
                            value={
                                form.description
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="Enter product description"
                            rows={4}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white outline-none focus:border-amber-400 resize-none"
                        />
                    </div>

                    {/* PRICE / STOCK */}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        {/* PRICE */}

                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">
                                Price
                            </label>

                            <input
                                type="number"
                                name="price"
                                value={
                                    form.price
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Enter price"
                                min="0"
                                step="0.01"
                                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white outline-none focus:border-amber-400"
                            />
                        </div>

                        {/* STOCK */}

                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">
                                Stock
                            </label>

                            <input
                                type="number"
                                name="stock"
                                value={
                                    form.stock
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Enter stock"
                                min="0"
                                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white outline-none focus:border-amber-400"
                            />
                        </div>

                    </div>

                    {/* =========================
                        CATEGORY DROPDOWN
                    ========================= */}

                    <div>
                        <label className="block text-sm text-zinc-400 mb-2">
                            Category
                        </label>

                        <select
                            name="category_id"
                            value={
                                form.category_id
                            }
                            onChange={
                                handleChange
                            }
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white outline-none focus:border-amber-400"
                        >

                            <option value="">
                                Select Category
                            </option>

                            {categories.map(
                                (
                                    category
                                ) => (
                                    <option
                                        key={
                                            category.id
                                        }
                                        value={
                                            category.id
                                        }
                                    >
                                        {
                                            category.name
                                        }
                                    </option>
                                )
                            )}

                        </select>

                        {categories.length ===
                            0 && (
                            <p className="text-zinc-600 text-xs mt-2">
                                No categories found.
                            </p>
                        )}
                    </div>

                    {/* BUTTONS */}

                    <div className="flex gap-3">

                        <button
                            type="submit"
                            disabled={
                                saving
                            }
                            className="bg-amber-400 hover:bg-amber-300 disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-semibold px-6 py-3 rounded-lg transition-colors"
                        >
                            {saving
                                ? "Saving..."
                                : editingId !==
                                    null
                                ? "Update Product"
                                : "Create Product"}
                        </button>

                        {editingId !==
                            null && (
                            <button
                                type="button"
                                onClick={
                                    handleCancelEdit
                                }
                                className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold px-6 py-3 rounded-lg"
                            >
                                Cancel
                            </button>
                        )}

                    </div>

                </form>
            </div>

            {/* =========================
                PRODUCTS TABLE
            ========================= */}

            <div className="bg-[#151515] border border-zinc-800 rounded-xl overflow-hidden">

                {/* TABLE HEADER */}

                <div className="p-6 border-b border-zinc-800">

                    <div className="flex items-center justify-between">

                        <div>
                            <h2 className="text-xl font-bold text-white">
                                All Products
                            </h2>

                            <p className="text-zinc-500 text-sm mt-1">
                                {
                                    products.length
                                }{" "}
                                product
                                {products.length !==
                                1
                                    ? "s"
                                    : ""}
                            </p>
                        </div>

                        <button
                            onClick={() => {
                                loadProducts();
                                loadCategories();
                            }}
                            className="text-sm text-amber-400 hover:text-amber-300"
                        >
                            Refresh
                        </button>

                    </div>

                </div>

                {/* LOADING */}

                {loading ? (
                    <div className="p-10 text-center text-zinc-500">
                        Loading products...
                    </div>
                ) : products.length ===
                  0 ? (
                    <div className="p-10 text-center text-zinc-500">
                        No products found.
                    </div>
                ) : (

                    /* TABLE */

                    <div className="overflow-x-auto">

                        <table className="w-full">

                            <thead>

                                <tr className="border-b border-zinc-800 text-left">

                                    <th className="px-6 py-4 text-xs text-zinc-500 uppercase">
                                        ID
                                    </th>

                                    <th className="px-6 py-4 text-xs text-zinc-500 uppercase">
                                        Product
                                    </th>

                                    <th className="px-6 py-4 text-xs text-zinc-500 uppercase">
                                        Category
                                    </th>

                                    <th className="px-6 py-4 text-xs text-zinc-500 uppercase">
                                        Price
                                    </th>

                                    <th className="px-6 py-4 text-xs text-zinc-500 uppercase">
                                        Stock
                                    </th>

                                    <th className="px-6 py-4 text-xs text-zinc-500 uppercase">
                                        Actions
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {products.map(
                                    (
                                        product
                                    ) => (
                                        <tr
                                            key={
                                                product.id
                                            }
                                            className="border-b border-zinc-800 last:border-b-0 hover:bg-zinc-900/50"
                                        >

                                            {/* ID */}

                                            <td className="px-6 py-4 text-zinc-500">
                                                #
                                                {
                                                    product.id
                                                }
                                            </td>

                                            {/* PRODUCT */}

                                            <td className="px-6 py-4">

                                                <p className="text-white font-medium">
                                                    {
                                                        product.name
                                                    }
                                                </p>

                                                {product.description && (
                                                    <p className="text-zinc-500 text-xs mt-1 max-w-xs truncate">
                                                        {
                                                            product.description
                                                        }
                                                    </p>
                                                )}

                                            </td>

                                            {/* CATEGORY */}

                                            <td className="px-6 py-4 text-zinc-400">
                                                {
                                                    product.category_name ||
                                                    "No category"
                                                }
                                            </td>

                                            {/* PRICE */}

                                            <td className="px-6 py-4 text-white">
                                                ₹
                                                {Number(
                                                    product.price ||
                                                        0
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}
                                            </td>

                                            {/* STOCK */}

                                            <td className="px-6 py-4">

                                                <span
                                                    className={
                                                        product.stock >
                                                        0
                                                            ? "text-emerald-400"
                                                            : "text-red-400"
                                                    }
                                                >
                                                    {
                                                        product.stock
                                                    }
                                                </span>

                                            </td>

                                            {/* ACTIONS */}

                                            <td className="px-6 py-4">

                                                <div className="flex gap-3">

                                                    <button
                                                        onClick={() =>
                                                            handleEdit(
                                                                product
                                                            )
                                                        }
                                                        className="text-amber-400 hover:text-amber-300 text-sm"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                product.id
                                                            )
                                                        }
                                                        className="text-red-400 hover:text-red-300 text-sm"
                                                    >
                                                        Delete
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>
                                    )
                                )}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>

        </div>
    );
}