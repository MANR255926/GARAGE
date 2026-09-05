"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { NavPill } from "@/components/admin/NavPill";
import { BackgroundPattern } from "@/components/shared/BackgroundPattern";
import { type Service } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/client";

type ServiceForm = Omit<Service, "id">;

const EMPTY_FORM: ServiceForm = {
  name: "",
  description: "",
  price_min: 0,
  price_max: 0,
  active: true,
};

export default function ServicesPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  async function loadServices() {
    try {
      const res = await fetch("/api/services");
      const data = await res.json();
      if (data.services) {
        setServices(
          data.services.map((s: Record<string, unknown>) => ({
            id: String(s.id),
            name: String(s.name),
            description: String(s.description || ""),
            price_min: Number(s.price_min),
            price_max: Number(s.price_max),
            active: Boolean(s.active),
          }))
        );
      }
    } catch (err) {
      console.error("Failed to load services from API:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const supabase = createClient();
    async function checkAuth() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace("/admin/login");
        return;
      }

      const { data: profile, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (error || !profile || profile.role !== "admin") {
        router.replace("/error-page?code=403");
        return;
      }

      setCheckingAuth(false);
      loadServices();
    }
    checkAuth();
  }, [router]);

  if (checkingAuth) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center"
        style={{ background: "var(--page)" }}
      >
        <BackgroundPattern />
        <div className="flex flex-col items-center gap-3 relative" style={{ zIndex: 10 }}>
          <div
            className="w-10 h-10 rounded-full animate-spin"
            style={{
              border: "3px solid var(--border)",
              borderTopColor: "var(--lime)",
            }}
          />
          <p className="font-inter text-xs font-medium" style={{ color: "var(--slate)" }}>
            Verifying admin access...
          </p>
        </div>
      </div>
    );
  }

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(svc: Service) {
    setEditingId(svc.id);
    setForm({
      name: svc.name,
      description: svc.description,
      price_min: svc.price_min,
      price_max: svc.price_max,
      active: svc.active,
    });
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        const res = await fetch(`/api/services/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          const { service } = await res.json();
          setServices((prev) =>
            prev.map((s) => (s.id === editingId ? { ...s, ...service } : s))
          );
        }
      } else {
        const res = await fetch("/api/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          const { service } = await res.json();
          setServices((prev) => [...prev, service]);
        }
      }
      setModalOpen(false);
    } catch (err) {
      console.error("Error saving service:", err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/services/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setServices((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {
      console.error("Error deleting service:", err);
    }
  }

  async function toggleActive(id: string) {
    const current = services.find((s) => s.id === id);
    if (!current) return;
    const nextActive = !current.active;

    // Optimistic UI update
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: nextActive } : s))
    );

    try {
      await fetch(`/api/services/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: nextActive }),
      });
    } catch (err) {
      console.error("Error toggling active status:", err);
      // Revert if error
      setServices((prev) =>
        prev.map((s) => (s.id === id ? { ...s, active: !nextActive } : s))
      );
    }
  }

  return (
    <div
      className="min-h-screen w-full p-6 relative"
      style={{ background: "var(--page)" }}
    >
      <BackgroundPattern />

      <div className="max-w-[1360px] mx-auto relative" style={{ zIndex: 10 }}>
        <NavPill activeTab={2} />

        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="font-inter text-xs" style={{ color: "var(--slate)" }}>
              Admin
            </p>
            <h1 className="font-oswald text-2xl font-semibold" style={{ color: "var(--ink)" }}>
              Services
            </h1>
          </div>
          <button
            id="btn-add-service"
            onClick={openAdd}
            className="flex items-center gap-1.5 rounded-full px-4 py-2.5 font-inter text-xs font-semibold transition-opacity hover:opacity-90"
            style={{ background: "var(--lime)", color: "var(--ink-2)" }}
          >
            <Plus size={14} /> Add Service
          </button>
        </div>

        {/* Services table */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "var(--card)",
            boxShadow: "0 1px 3px rgba(20,22,26,0.06)",
          }}
        >
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Service", "Description", "Price Range (PKR)", "Active", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 font-inter text-xs font-semibold"
                      style={{ color: "var(--slate)" }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {services.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center font-inter text-xs" style={{ color: "var(--slate)" }}>
                    No services found. Click &quot;Add Service&quot; above to create one.
                  </td>
                </tr>
              )}
              {services.map((svc, i) => (
                <tr
                  key={svc.id}
                  style={{
                    borderBottom:
                      i < services.length - 1 ? "1px solid var(--border)" : undefined,
                  }}
                >
                  <td className="px-5 py-3">
                    <p className="font-inter text-sm font-medium" style={{ color: "var(--ink)" }}>
                      {svc.name}
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    <p
                      className="font-inter text-xs max-w-xs truncate"
                      style={{ color: "var(--slate)" }}
                    >
                      {svc.description}
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    <span className="font-mono text-xs font-semibold" style={{ color: "var(--ink)" }}>
                      {svc.price_min.toLocaleString()} – {svc.price_max.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => toggleActive(svc.id)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full font-inter text-[11px] font-medium"
                      style={{
                        background: svc.active ? "var(--lime)" : "var(--chip)",
                        color: svc.active ? "var(--ink-2)" : "var(--slate)",
                      }}
                    >
                      {svc.active ? <Check size={10} /> : <X size={10} />}
                      {svc.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        id={`btn-edit-${svc.id}`}
                        onClick={() => openEdit(svc)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: "var(--chip)" }}
                        aria-label={`Edit ${svc.name}`}
                      >
                        <Pencil size={12} color="var(--slate)" />
                      </button>
                      <button
                        id={`btn-delete-${svc.id}`}
                        onClick={() => handleDelete(svc.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: "var(--chip)" }}
                        aria-label={`Delete ${svc.name}`}
                      >
                        <Trash2 size={12} color="#EF4444" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 100 }}
          onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="svc-modal-title"
        >
          <div
            className="rounded-2xl p-6 w-full max-w-md mx-4 relative"
            style={{
              background: "var(--card)",
              boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
            }}
          >
            <button
              id="btn-close-svc-modal"
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "var(--chip)" }}
              aria-label="Close"
            >
              <X size={14} color="var(--ink)" />
            </button>

            <h2
              id="svc-modal-title"
              className="font-oswald text-xl font-semibold mb-5"
              style={{ color: "var(--ink)" }}
            >
              {editingId ? "Edit Service" : "Add Service"}
            </h2>

            <form onSubmit={handleSave} className="flex flex-col gap-4">
              {[
                { id: "svc-name",   label: "Service Name", key: "name",        type: "text" },
                { id: "svc-desc",   label: "Description",  key: "description", type: "text" },
                { id: "svc-pmin",   label: "Price Min (PKR)", key: "price_min",type: "number" },
                { id: "svc-pmax",   label: "Price Max (PKR)", key: "price_max",type: "number" },
              ].map(({ id, label, key, type }) => (
                <div key={key} className="flex flex-col gap-1.5">
                  <label htmlFor={id} className="font-inter text-xs font-semibold" style={{ color: "var(--ink)" }}>
                    {label}
                  </label>
                  <input
                    id={id}
                    type={type}
                    required={key === "name" || key.startsWith("price")}
                    value={String(form[key as keyof ServiceForm])}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        [key]: type === "number" ? Number(e.target.value) : e.target.value,
                      }))
                    }
                    className="rounded-xl px-4 py-2.5 font-inter text-sm border outline-none"
                    style={{
                      background: "var(--chip)",
                      color: "var(--ink)",
                      borderColor: "var(--border)",
                    }}
                  />
                </div>
              ))}

              <div className="flex items-center gap-3">
                <input
                  id="svc-active"
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.checked }))}
                  className="w-4 h-4"
                  style={{ accentColor: "var(--lime)" }}
                />
                <label htmlFor="svc-active" className="font-inter text-sm" style={{ color: "var(--ink)" }}>
                  Active
                </label>
              </div>

              <button
                id="btn-save-service"
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-xl font-inter text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: "var(--lime)", color: "var(--ink-2)" }}
              >
                {saving ? "Saving..." : editingId ? "Save Changes" : "Add Service"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}