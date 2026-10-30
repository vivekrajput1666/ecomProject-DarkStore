import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProfile } from "../api/authApi";
import {
    getMyAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    type Address,
    type AddressData,
} from "../api/addressApi";

/* ============================================================
   TYPES
============================================================ */

interface UserProfile {
    id: number;
    name: string;
    email: string;
    role: string;
    phone?: string | null;
    address?: string | null;
    created_at?: string;
    updated_at?: string;
}

type AddressFormState = {
    full_name: string;
    phone: string;
    address_line_1: string;
    address_line_2: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    address_type: string;
    is_default: number;
};

const EMPTY_FORM: AddressFormState = {
    full_name: "",
    phone: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    address_type: "home",
    is_default: 0,
};

/* ============================================================
   HELPERS
============================================================ */

const getAddressId = (address: Address): number | null => {
    const raw =
        address.id ??
        address.address_id ??
        (address as any).addressId ??
        (address as any).addressID;
    const parsed = Number(raw);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

/* ============================================================
   COMPONENT
============================================================ */

export default function Profile() {
    /* ----------------------------------------------------------
       PROFILE STATE
    ---------------------------------------------------------- */
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileError, setProfileError] = useState("");

    /* ----------------------------------------------------------
       ADDRESS STATE
    ---------------------------------------------------------- */
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [addressesLoading, setAddressesLoading] = useState(true);
    const [addressesError, setAddressesError] = useState("");

    /* ----------------------------------------------------------
       ADD / EDIT FORM STATE
    ---------------------------------------------------------- */
    const [showForm, setShowForm] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
    const [form, setForm] = useState<AddressFormState>(EMPTY_FORM);
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState("");
    const [formSuccess, setFormSuccess] = useState("");

    /* ----------------------------------------------------------
       DELETE STATE
    ---------------------------------------------------------- */
    const [deletingId, setDeletingId] = useState<number | null>(null);

    /* ----------------------------------------------------------
       SYNC BANNER STATE
       Shown when profiles.address has data but addresses table is empty
    ---------------------------------------------------------- */
    const [showSyncBanner, setShowSyncBanner] = useState(false);
    const [syncLoading, setSyncLoading] = useState(false);
    const [syncError, setSyncError] = useState("");

    /* ==========================================================
       LOAD PROFILE
    ========================================================== */
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await getProfile();
                console.log("PROFILE RESPONSE:", response);
                if (response.success && response.user) {
                    setProfile(response.user);
                } else {
                    setProfileError(response.message || "Failed to load profile");
                }
            } catch (error: any) {
                console.error("PROFILE ERROR:", error);
                setProfileError(
                    error.response?.data?.message || "Failed to load profile"
                );
            } finally {
                setProfileLoading(false);
            }
        };
        fetchProfile();
    }, []);

    /* ==========================================================
       LOAD ADDRESSES
    ========================================================== */
    const loadAddresses = async () => {
        setAddressesLoading(true);
        setAddressesError("");
        try {
            const saved = await getMyAddresses();
            console.log("PROFILE PAGE — ADDRESSES:", saved);
            setAddresses(saved);
        } catch (error: any) {
            console.error("LOAD ADDRESSES ERROR:", error);
            setAddressesError(
                error.response?.data?.message || "Failed to load addresses"
            );
        } finally {
            setAddressesLoading(false);
        }
    };

    useEffect(() => {
        loadAddresses();
    }, []);

    /* ==========================================================
       SYNC BANNER — show when profile has old address text
       but the addresses table is still empty
    ========================================================== */
    useEffect(() => {
        if (
            profile &&
            profile.address &&
            profile.address.trim() !== "" &&
            !addressesLoading &&
            addresses.length === 0
        ) {
            setShowSyncBanner(true);
        } else {
            setShowSyncBanner(false);
        }
    }, [profile, addresses, addressesLoading]);

    /* ==========================================================
       HANDLE SYNC — migrate profile.address into addresses table
    ========================================================== */
    const handleSync = async () => {
        if (!profile) return;

        setSyncLoading(true);
        setSyncError("");

        try {
            // Build the best possible address from profile data
            
            // We need at minimum: full_name, phone, address_line_1, city, state, pincode
            // The profile might not have city/state/pincode. Open the form instead of silently failing.
         
            setEditingAddressId(null);
            setShowForm(true);
            setShowSyncBanner(false);
        } finally {
            setSyncLoading(false);
        }
    };

    /* ==========================================================
       OPEN ADD FORM
    ========================================================== */
    const handleOpenAdd = () => {
        setForm(EMPTY_FORM);
        setEditingAddressId(null);
        setFormError("");
        setFormSuccess("");
        setShowForm(true);
    };

    /* ==========================================================
       OPEN EDIT FORM
    ========================================================== */
    const handleOpenEdit = (address: Address) => {
        setForm({
            full_name: address.full_name || "",
            phone: address.phone || "",
            address_line_1: address.address_line_1 || "",
            address_line_2: address.address_line_2 || "",
            city: address.city || "",
            state: address.state || "",
            country: address.country || "India",
            pincode: address.pincode || "",
            address_type: address.address_type || "home",
            is_default: Number(address.is_default) === 1 ? 1 : 0,
        });
        setEditingAddressId(getAddressId(address));
        setFormError("");
        setFormSuccess("");
        setShowForm(true);
    };

    /* ==========================================================
       CANCEL FORM
    ========================================================== */
    const handleCancelForm = () => {
        setShowForm(false);
        setEditingAddressId(null);
        setForm(EMPTY_FORM);
        setFormError("");
        setFormSuccess("");
    };

    /* ==========================================================
       FORM FIELD CHANGE
    ========================================================== */
    const handleFormChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox"
                ? (e.target as HTMLInputElement).checked ? 1 : 0
                : value,
        }));
    };

    /* ==========================================================
       SAVE ADDRESS (CREATE or UPDATE)
    ========================================================== */
    const handleSaveAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError("");
        setFormSuccess("");

        // Basic validation
        if (!form.full_name.trim()) {
            setFormError("Full name is required");
            return;
        }
        if (!form.phone.trim()) {
            setFormError("Phone number is required");
            return;
        }
        if (!form.address_line_1.trim()) {
            setFormError("Address line 1 is required");
            return;
        }
        if (!form.city.trim()) {
            setFormError("City is required");
            return;
        }
        if (!form.state.trim()) {
            setFormError("State is required");
            return;
        }
        if (!form.pincode.trim()) {
            setFormError("Pincode is required");
            return;
        }

        setFormLoading(true);

        try {
            const payload: AddressData = {
                full_name: form.full_name.trim(),
                phone: form.phone.trim(),
                address_line_1: form.address_line_1.trim(),
                address_line_2: form.address_line_2.trim() || undefined,
                city: form.city.trim(),
                state: form.state.trim(),
                country: form.country.trim() || "India",
                pincode: form.pincode.trim(),
                address_type: form.address_type || "home",
                is_default: form.is_default,
            };

            console.log(
                editingAddressId
                    ? "UPDATE ADDRESS PAYLOAD:"
                    : "CREATE ADDRESS PAYLOAD:",
                payload
            );

            if (editingAddressId !== null) {
                await updateAddress(editingAddressId, payload);
                setFormSuccess("Address updated successfully!");
            } else {
                await createAddress(payload);
                setFormSuccess("Address saved successfully!");
            }

            // Reload addresses after save
            await loadAddresses();

            // Close form after short delay so user sees success
            setTimeout(() => {
                setShowForm(false);
                setEditingAddressId(null);
                setForm(EMPTY_FORM);
                setFormSuccess("");
            }, 1200);

        } catch (error: any) {
            console.error("SAVE ADDRESS ERROR:", error);
            setFormError(
                error.response?.data?.message || "Failed to save address"
            );
        } finally {
            setFormLoading(false);
        }
    };

    /* ==========================================================
       DELETE ADDRESS
    ========================================================== */
    const handleDeleteAddress = async (address: Address) => {
        const addressId = getAddressId(address);
        if (addressId === null) return;

        if (!window.confirm("Delete this address?")) return;

        setDeletingId(addressId);
        try {
            await deleteAddress(addressId);
            console.log("DELETED ADDRESS ID:", addressId);
            await loadAddresses();
        } catch (error: any) {
            console.error("DELETE ADDRESS ERROR:", error);
            alert(error.response?.data?.message || "Failed to delete address");
        } finally {
            setDeletingId(null);
        }
    };

    /* ==========================================================
       SET DEFAULT
    ========================================================== */
    const handleSetDefault = async (address: Address) => {
        const addressId = getAddressId(address);
        if (addressId === null) return;

        try {
            await updateAddress(addressId, {
                full_name: address.full_name,
                phone: address.phone,
                address_line_1: address.address_line_1,
                address_line_2: address.address_line_2 || undefined,
                city: address.city,
                state: address.state,
                country: address.country || "India",
                pincode: address.pincode,
                address_type: address.address_type || "home",
                is_default: 1,
            });
            await loadAddresses();
        } catch (error: any) {
            console.error("SET DEFAULT ERROR:", error);
            alert(error.response?.data?.message || "Failed to set default address");
        }
    };

    /* ==========================================================
       LOADING
    ========================================================== */
    if (profileLoading) {
        return (
            <div className="min-h-screen bg-[#090909] text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-zinc-500 text-sm">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (profileError) {
        return (
            <div className="min-h-screen bg-[#090909] text-white flex items-center justify-center px-6">
                <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-400/10 border border-red-400/20 flex items-center justify-center">
                        <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-white text-xl font-bold mb-2">Unable to load profile</h2>
                    <p className="text-zinc-500 text-sm mb-6">{profileError}</p>
                    <Link to="/" className="inline-block bg-amber-400 hover:bg-amber-300 text-black font-semibold px-5 py-2.5 rounded-lg transition-colors">
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    if (!profile) return null;

    /* ==========================================================
       RENDER
    ========================================================== */
    return (
        <div className="min-h-screen bg-[#090909] text-white">

            {/* ------------------------------------------------
                HEADER
            ------------------------------------------------ */}
            <div className="border-b border-zinc-800">
                <div className="max-w-6xl mx-auto px-6 py-10">
                    <p className="text-amber-400 text-xs uppercase tracking-[0.3em] font-semibold mb-2">
                        Account
                    </p>
                    <h1 className="text-4xl font-bold tracking-tight">My Profile</h1>
                    <p className="text-zinc-500 text-sm mt-2">
                        Manage your account information and saved addresses.
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">

                {/* ============================================
                    ROW 1: PROFILE CARD + PERSONAL INFO
                ============================================ */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                            <div className="w-20 h-20 rounded-full bg-amber-400 flex items-center justify-center mb-5">
                                <span className="text-black text-3xl font-bold uppercase">
                                    {profile.name?.charAt(0) || "U"}
                                </span>
                            </div>
                            <h2 className="text-white text-2xl font-bold">{profile.name}</h2>
                            <p className="text-zinc-500 text-sm mt-1">{profile.email}</p>
                          <div className="mt-5 pt-5 border-t border-zinc-800">
    <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs uppercase tracking-wider">
        {profile.role}
    </span>

    {/* Admin Dashboard Button */}
    {profile.role?.toLowerCase() === "admin" && (
        <Link
            to="/admin/dashboard"
            className="mt-5 flex items-center justify-center gap-2 w-full bg-amber-400 hover:bg-amber-300 text-black font-bold px-4 py-3 rounded-lg transition-colors"
        >
            <span>⚡</span>
            Go to Admin Dashboard
            <span>→</span>
        </Link>
    )}
</div>
                        </div>
                    </div>

                    {/* Personal Info */}
                    <div className="lg:col-span-2">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                            <div className="mb-6">
                                <h2 className="text-xl font-bold">Personal Information</h2>
                                <p className="text-zinc-500 text-sm mt-1">Your account details</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">Full Name</p>
                                    <p className="text-white text-sm">{profile.name || "Not provided"}</p>
                                </div>
                                <div>
                                    <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">Email Address</p>
                                    <p className="text-white text-sm break-all">{profile.email || "Not provided"}</p>
                                </div>
                                <div>
                                    <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">Phone</p>
                                    <p className="text-white text-sm">{profile.phone || "Not provided"}</p>
                                </div>
                                <div>
                                    <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">Account Type</p>
                                    <p className="text-white text-sm capitalize">{profile.role || "User"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* ============================================
                    SYNC BANNER
                    Shown when user has old profile.address but
                    no rows in the addresses table yet
                ============================================ */}
                {showSyncBanner && (
                    <div className="bg-amber-400/10 border border-amber-400/30 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <p className="text-amber-400 font-semibold text-sm">
                                You have a saved address in your profile
                            </p>
                            <p className="text-zinc-400 text-sm mt-1">
                                Your old address: <span className="text-white">{profile.address}</span>
                            </p>
                            <p className="text-zinc-500 text-xs mt-1">
                                Click below to fill a form and save it as a shipping address so it appears at Checkout.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleSync}
                            disabled={syncLoading}
                            className="flex-shrink-0 bg-amber-400 hover:bg-amber-300 text-black font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60 text-sm"
                        >
                            {syncLoading ? "Opening..." : "Save as Shipping Address"}
                        </button>
                        {syncError && (
                            <p className="text-red-400 text-sm mt-2">{syncError}</p>
                        )}
                    </div>
                )}

                {/* ============================================
                    ADDRESSES SECTION
                ============================================ */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">

                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold">Saved Addresses</h2>
                            <p className="text-zinc-500 text-sm mt-1">
                                These addresses appear at Checkout
                            </p>
                        </div>
                        {!showForm && (
                            <button
                                type="button"
                                onClick={handleOpenAdd}
                                className="bg-amber-400 hover:bg-amber-300 text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
                            >
                                + Add Address
                            </button>
                        )}
                    </div>

                    {/* ----------------------------------------
                        ADD / EDIT FORM
                    ---------------------------------------- */}
                    {showForm && (
                        <form
                            onSubmit={handleSaveAddress}
                            className="bg-zinc-800 border border-zinc-700 rounded-xl p-6 mb-6"
                        >
                            <h3 className="text-white font-semibold text-lg mb-5">
                                {editingAddressId ? "Edit Address" : "Add New Address"}
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                {/* Full Name */}
                                <div>
                                    <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="full_name"
                                        value={form.full_name}
                                        onChange={handleFormChange}
                                        placeholder="Vivek Singh"
                                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-600 outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                                    />
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleFormChange}
                                        placeholder="08491002287"
                                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-600 outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                                    />
                                </div>

                                {/* Address Line 1 */}
                                <div className="sm:col-span-2">
                                    <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">
                                        Address Line 1 *
                                    </label>
                                    <input
                                        type="text"
                                        name="address_line_1"
                                        value={form.address_line_1}
                                        onChange={handleFormChange}
                                        placeholder="House / Flat No., Street, Village"
                                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-600 outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                                    />
                                </div>

                                {/* Address Line 2 */}
                                <div className="sm:col-span-2">
                                    <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">
                                        Address Line 2 (optional)
                                    </label>
                                    <input
                                        type="text"
                                        name="address_line_2"
                                        value={form.address_line_2}
                                        onChange={handleFormChange}
                                        placeholder="Landmark, Area (optional)"
                                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-600 outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                                    />
                                </div>

                                {/* City */}
                                <div>
                                    <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">
                                        City *
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={form.city}
                                        onChange={handleFormChange}
                                        placeholder="Jakh"
                                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-600 outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                                    />
                                </div>

                                {/* State */}
                                <div>
                                    <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">
                                        State *
                                    </label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={form.state}
                                        onChange={handleFormChange}
                                        placeholder="Jammu and Kashmir"
                                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-600 outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                                    />
                                </div>

                                {/* Pincode */}
                                <div>
                                    <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">
                                        Pincode *
                                    </label>
                                    <input
                                        type="text"
                                        name="pincode"
                                        value={form.pincode}
                                        onChange={handleFormChange}
                                        placeholder="184120"
                                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-600 outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                                    />
                                </div>

                                {/* Country */}
                                <div>
                                    <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">
                                        Country
                                    </label>
                                    <input
                                        type="text"
                                        name="country"
                                        value={form.country}
                                        onChange={handleFormChange}
                                        placeholder="India"
                                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-600 outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                                    />
                                </div>

                                {/* Address Type */}
                                <div>
                                    <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">
                                        Address Type
                                    </label>
                                    <select
                                        name="address_type"
                                        value={form.address_type}
                                        onChange={handleFormChange}
                                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                                    >
                                        <option value="home">Home</option>
                                        <option value="work">Work</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                {/* Set as Default */}
                                <div className="sm:col-span-2 flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="is_default"
                                        name="is_default"
                                        checked={form.is_default === 1}
                                        onChange={handleFormChange}
                                        className="w-4 h-4 accent-amber-400"
                                    />
                                    <label htmlFor="is_default" className="text-zinc-300 text-sm">
                                        Set as default address
                                    </label>
                                </div>

                            </div>

                            {/* Form Error */}
                            {formError && (
                                <p className="mt-4 text-red-400 text-sm">{formError}</p>
                            )}

                            {/* Form Success */}
                            {formSuccess && (
                                <p className="mt-4 text-green-400 text-sm">{formSuccess}</p>
                            )}

                            {/* Form Buttons */}
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="bg-amber-400 hover:bg-amber-300 text-black font-semibold px-6 py-2.5 rounded-lg transition-colors disabled:opacity-60 text-sm"
                                >
                                    {formLoading
                                        ? "Saving..."
                                        : editingAddressId
                                        ? "Update Address"
                                        : "Save Address"}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancelForm}
                                    disabled={formLoading}
                                    className="bg-zinc-700 hover:bg-zinc-600 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors disabled:opacity-60 text-sm"
                                >
                                    Cancel
                                </button>
                            </div>

                        </form>
                    )}

                    {/* ----------------------------------------
                        ADDRESS LIST
                    ---------------------------------------- */}
                    {addressesLoading ? (
                        <div className="flex items-center gap-3 text-zinc-500 text-sm py-4">
                            <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                            Loading addresses...
                        </div>
                    ) : addressesError ? (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-sm text-red-400">
                            {addressesError}
                        </div>
                    ) : addresses.length === 0 ? (
                        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 text-center">
                            <p className="text-zinc-400 text-sm">
                                No saved addresses yet.
                            </p>
                            <p className="text-zinc-600 text-xs mt-1">
                                Add an address using the button above. It will appear on the Checkout page.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {addresses.map((address, index) => {
                                const addressId = getAddressId(address);
                                const isDefault = Number(address.is_default) === 1;
                                const isDeleting = deletingId === addressId;

                                return (
                                    <div
                                        key={addressId ?? `addr-${index}`}
                                        className={`rounded-xl border p-5 transition ${
                                            isDefault
                                                ? "border-amber-400/40 bg-amber-400/5"
                                                : "border-zinc-700 bg-zinc-800"
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-4">

                                            {/* Address Info */}
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="text-white font-semibold text-sm">
                                                        {address.full_name}
                                                    </p>
                                                    <span className="text-xs text-zinc-500 uppercase px-2 py-0.5 bg-zinc-700 rounded">
                                                        {address.address_type || "home"}
                                                    </span>
                                                    {isDefault && (
                                                        <span className="text-xs text-amber-400 font-semibold uppercase px-2 py-0.5 bg-amber-400/10 border border-amber-400/30 rounded">
                                                            Default
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-zinc-400 text-sm mt-2">
                                                    {address.phone}
                                                </p>
                                                <p className="text-zinc-400 text-sm mt-1">
                                                    {address.address_line_1}
                                                    {address.address_line_2
                                                        ? `, ${address.address_line_2}`
                                                        : ""}
                                                </p>
                                                <p className="text-zinc-400 text-sm">
                                                    {address.city}
                                                    {address.state ? `, ${address.state}` : ""}
                                                    {" — "}
                                                    {address.pincode}
                                                </p>
                                                <p className="text-zinc-500 text-xs mt-1">
                                                    {address.country}
                                                </p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-col gap-2 flex-shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenEdit(address)}
                                                    className="text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                {!isDefault && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSetDefault(address)}
                                                        className="text-xs text-zinc-400 hover:text-white font-medium transition-colors"
                                                    >
                                                        Set Default
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteAddress(address)}
                                                    disabled={isDeleting}
                                                    className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors disabled:opacity-50"
                                                >
                                                    {isDeleting ? "Deleting..." : "Delete"}
                                                </button>
                                            </div>

                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                </div>

                {/* ============================================
                    ACCOUNT INFO
                ============================================ */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <h2 className="text-xl font-bold mb-6">Account Information</h2>
                    <div>
                        <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">
                            Account Status
                        </p>
                        <span className="inline-flex items-center gap-2 text-green-400 text-sm">
                            <span className="w-2 h-2 rounded-full bg-green-400" />
                            Active
                        </span>
                    </div>
                </div>

                {/* Back */}
                <div>
                    <Link
                        to="/"
                        className="text-zinc-500 hover:text-amber-400 text-sm transition-colors"
                    >
                        ← Back to Home
                    </Link>
                </div>

            </div>
        </div>
    );
}
