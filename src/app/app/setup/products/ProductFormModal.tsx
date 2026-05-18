"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { validateSku } from "@/lib/sku";
import { bahtToSatang } from "@/lib/money/format";
import { compressImage } from "@/lib/image/compress";
import { useT } from "@/lib/i18n/provider";
import type { Product } from "@/lib/pos/types";

type FormValues = {
  sku: string;
  name: string;
  category: string;
  priceBaht: string;
  costBaht: string;
  shippingFeeBaht: string;
  startingQty: string;
  reorderPoint: string;
  sendLaterEnabled: boolean;
  imagePath: string | null; // data URL for the demo
};

const empty = (): FormValues => ({
  sku: "",
  name: "",
  category: "uncategorized",
  priceBaht: "",
  costBaht: "",
  shippingFeeBaht: "0",
  startingQty: "0",
  reorderPoint: "",
  sendLaterEnabled: true,
  imagePath: null,
});

function fromProduct(p: Product): FormValues {
  return {
    sku: p.sku,
    name: p.name,
    category: p.category,
    priceBaht: (p.price_satang / 100).toString(),
    costBaht:
      p.cost_satang && p.cost_satang > 0
        ? (p.cost_satang / 100).toString()
        : "",
    shippingFeeBaht: (p.shipping_fee_satang / 100).toString(),
    startingQty: String(p.current_qty),
    reorderPoint:
      typeof p.reorder_point === "number" && p.reorder_point > 0
        ? String(p.reorder_point)
        : "",
    sendLaterEnabled: p.send_later_enabled,
    imagePath: p.image_path,
  };
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export function ProductFormModal({
  open,
  onClose,
  initial,
  workspaceId,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  initial: Product | null;
  workspaceId: string;
  onSubmit: (values: Omit<Product, "id">, originalId: string | null) => void;
}) {
  const [v, setV] = useState<FormValues>(empty());
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [uploading, setUploading] = useState(false);
  const { push } = useToast();
  const { t } = useT();

  useEffect(() => {
    if (open) {
      setV(initial ? fromProduct(initial) : empty());
      setErrors({});
    }
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function set<K extends keyof FormValues>(key: K, val: FormValues[K]) {
    setV((s) => ({ ...s, [key]: val }));
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.currentTarget.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await compressImage(file, {
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.8,
        mimeType: "image/webp",
      });
      const dataUrl = await blobToDataUrl(result.blob);
      set("imagePath", dataUrl);
      push({
        kind: "success",
        title: "Image ready",
        message: `${Math.round(result.bytes / 1024)} KB · ${result.width}×${result.height}`,
      });
    } catch (err) {
      push({
        kind: "error",
        title: "Image failed",
        message: err instanceof Error ? err.message : "Could not compress",
      });
    } finally {
      setUploading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};

    const sku = validateSku(v.sku);
    if (!sku.ok) next.sku = sku.reason;

    if (!v.name.trim()) next.name = "Name is required";
    if (v.name.length > 160) next.name = "Name is too long";

    const price = Number(v.priceBaht);
    if (!Number.isFinite(price) || price < 0) {
      next.priceBaht = "Price must be ≥ 0";
    }

    const costRaw = v.costBaht.trim();
    const cost = costRaw === "" ? null : Number(costRaw);
    if (cost !== null && (!Number.isFinite(cost) || cost < 0)) {
      next.costBaht = "Cost must be ≥ 0";
    }

    const shipping = v.shippingFeeBaht.trim() === "" ? 0 : Number(v.shippingFeeBaht);
    if (!Number.isFinite(shipping) || shipping < 0) {
      next.shippingFeeBaht = "Shipping fee must be ≥ 0";
    }

    const qty = v.startingQty.trim() === "" ? 0 : Number(v.startingQty);
    if (!Number.isInteger(qty) || qty < 0) {
      next.startingQty = "Starting qty must be a non-negative integer";
    }

    const reorderRaw = v.reorderPoint.trim();
    const reorder = reorderRaw === "" ? null : Number(reorderRaw);
    if (reorder !== null && (!Number.isInteger(reorder) || reorder < 0)) {
      next.reorderPoint = "Reorder point must be a non-negative integer";
    }

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const product: Omit<Product, "id"> = {
      workspace_id: workspaceId,
      sku: sku.ok ? sku.normalized : v.sku,
      name: v.name.trim(),
      category: v.category.trim() || "uncategorized",
      price_satang: bahtToSatang(price),
      shipping_fee_satang: bahtToSatang(shipping),
      send_later_enabled: v.sendLaterEnabled,
      is_active: initial?.is_active ?? true,
      image_path: v.imagePath,
      current_qty: qty,
      ...(initial?.pinned ? { pinned: initial.pinned } : {}),
      ...(initial?.upsellSkus ? { upsellSkus: initial.upsellSkus } : {}),
      ...(cost !== null && cost > 0 ? { cost_satang: bahtToSatang(cost) } : {}),
      ...(reorder !== null && reorder > 0 ? { reorder_point: reorder } : {}),
    };

    onSubmit(product, initial?.id ?? null);
    push({
      kind: "success",
      title: initial ? "Product updated" : "Product added",
      message: `${product.sku} — ${product.name}`,
    });
    onClose();
  }

  if (!open) return null;

  const title = initial ? t.setupProducts.formEdit : t.setupProducts.formAdd;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-text/40 px-3 py-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="panel-lift relative w-full max-w-2xl max-h-[92dvh] overflow-y-auto p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full border border-line bg-panel px-3 py-1 text-sm font-bold text-muted hover:text-text"
        >
          ×
        </button>

        <div className="kicker kicker-gold">Catalog</div>
        <h2 className="headline-upright text-2xl mt-2 text-accent-deep">
          {title}
        </h2>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <div>
            <label className="field-label" htmlFor="pf-sku">
              {t.setupProducts.fSku}
            </label>
            <input
              id="pf-sku"
              className="field mono"
              value={v.sku}
              onChange={(e) => set("sku", e.currentTarget.value)}
              placeholder="DEMO-001"
              autoComplete="off"
              autoCapitalize="characters"
              maxLength={32}
              disabled={!!initial}
            />
            {errors.sku ? (
              <p className="mt-1 text-xs text-[var(--color-danger-soft-fg)]">
                {errors.sku}
              </p>
            ) : initial ? (
              <p className="mt-1 text-xs text-muted">
                {t.setupProducts.fSkuLocked}
              </p>
            ) : null}
          </div>

          <div>
            <label className="field-label" htmlFor="pf-name">
              {t.setupProducts.fName}
            </label>
            <input
              id="pf-name"
              className="field"
              value={v.name}
              onChange={(e) => set("name", e.currentTarget.value)}
              placeholder="Cat Hoodie"
              maxLength={160}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-[var(--color-danger-soft-fg)]">
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label className="field-label" htmlFor="pf-category">
              {t.setupProducts.fCategory}
            </label>
            <input
              id="pf-category"
              className="field"
              value={v.category}
              onChange={(e) => set("category", e.currentTarget.value)}
              placeholder="apparel"
              maxLength={80}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="pf-price">
                {t.setupProducts.fPrice}
              </label>
              <input
                id="pf-price"
                className="field mono num"
                type="number"
                inputMode="decimal"
                value={v.priceBaht}
                onChange={(e) => set("priceBaht", e.currentTarget.value)}
                placeholder="890"
                min={0}
                step={1}
              />
              {errors.priceBaht && (
                <p className="mt-1 text-xs text-[var(--color-danger-soft-fg)]">
                  {errors.priceBaht}
                </p>
              )}
            </div>
            <div>
              <label className="field-label" htmlFor="pf-cost">
                Unit cost (THB, optional)
              </label>
              <input
                id="pf-cost"
                className="field mono num"
                type="number"
                inputMode="decimal"
                value={v.costBaht}
                onChange={(e) => set("costBaht", e.currentTarget.value)}
                placeholder="420"
                min={0}
                step={1}
              />
              <p className="mt-1 text-xs text-muted">
                Wholesale / landed cost. Powers margin reports.
              </p>
              {errors.costBaht && (
                <p className="mt-1 text-xs text-[var(--color-danger-soft-fg)]">
                  {errors.costBaht}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="pf-ship">
                {t.setupProducts.fShippingFee}
              </label>
              <input
                id="pf-ship"
                className="field mono num"
                type="number"
                inputMode="decimal"
                value={v.shippingFeeBaht}
                onChange={(e) => set("shippingFeeBaht", e.currentTarget.value)}
                placeholder="0"
                min={0}
                step={1}
              />
              {errors.shippingFeeBaht && (
                <p className="mt-1 text-xs text-[var(--color-danger-soft-fg)]">
                  {errors.shippingFeeBaht}
                </p>
              )}
            </div>
            <div>
              <label className="field-label" htmlFor="pf-reorder">
                Reorder at qty (optional)
              </label>
              <input
                id="pf-reorder"
                className="field mono num"
                type="number"
                inputMode="numeric"
                value={v.reorderPoint}
                onChange={(e) => set("reorderPoint", e.currentTarget.value)}
                placeholder="10"
                min={0}
                step={1}
              />
              <p className="mt-1 text-xs text-muted">
                Dashboard flags when current stock ≤ this number.
              </p>
              {errors.reorderPoint && (
                <p className="mt-1 text-xs text-[var(--color-danger-soft-fg)]">
                  {errors.reorderPoint}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="field-label" htmlFor="pf-qty">
              {t.setupProducts.fStartingQty}
            </label>
            <input
              id="pf-qty"
              className="field mono num"
              type="number"
              inputMode="numeric"
              value={v.startingQty}
              onChange={(e) => set("startingQty", e.currentTarget.value)}
              placeholder="30"
              min={0}
              step={1}
            />
            {errors.startingQty && (
              <p className="mt-1 text-xs text-[var(--color-danger-soft-fg)]">
                {errors.startingQty}
              </p>
            )}
          </div>

          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={v.sendLaterEnabled}
              onChange={(e) => set("sendLaterEnabled", e.currentTarget.checked)}
              className="mt-1 h-4 w-4 accent-[var(--color-accent)]"
            />
            <span>
              <span className="font-semibold text-text">
                {t.setupProducts.fSendLater}
              </span>
              <span className="block text-xs text-muted">
                {t.setupProducts.fSendLaterHint}
              </span>
            </span>
          </label>

          <div>
            <span className="field-label">{t.setupProducts.fImage}</span>
            <div className="panel-quiet border-dashed border-line-strong p-4">
              <div className="flex flex-wrap items-start gap-4">
                <div className="h-28 w-28 flex-none overflow-hidden rounded-[var(--radius-md)] border border-line bg-soft">
                  {v.imagePath ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={v.imagePath}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="grid h-full w-full place-items-center text-[10px] font-bold uppercase tracking-wider text-faint">
                      {t.setupProducts.fImageNoFile}
                    </span>
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={uploading}
                    className="block text-sm text-muted file:mr-3 file:rounded-[var(--radius-md)] file:border file:border-line file:bg-panel file:px-4 file:py-2 file:text-sm file:font-bold file:text-accent-strong"
                  />
                  {v.imagePath && (
                    <button
                      type="button"
                      onClick={() => set("imagePath", null)}
                      className="self-start text-xs font-bold text-[var(--color-danger-soft-fg)] underline-offset-2 hover:underline"
                    >
                      {t.setupProducts.fImageRemove}
                    </button>
                  )}
                  <p className="text-xs text-muted">
                    {t.setupProducts.fImageHint}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-end gap-3 border-t border-line-soft pt-5">
            <button type="button" onClick={onClose} className="btn-ghost btn-md">
              Cancel
            </button>
            <button type="submit" className="btn-accent btn-lg">
              {initial ? t.setupProducts.saveChanges : t.setupProducts.formAdd}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
