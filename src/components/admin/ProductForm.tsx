"use client";

import Image from "next/image";
import { useState } from "react";
import { saveProduct } from "@/app/admin/actions";
import { site } from "@/lib/site";
import Uploader from "./Uploader";

type CategoryOption = { id: string; name: string; parentName?: string };

type ProductData = {
  id?: string;
  name?: string;
  slug?: string;
  description?: string;
  priceCents?: number | null;
  inquiryOnly?: boolean;
  occasions?: string;
  featured?: boolean;
  active?: boolean;
  categoryId?: string;
  images?: { url: string }[];
};

const input =
  "w-full rounded-lg border border-sage bg-white px-3 py-2 text-sm focus:border-leaf focus:outline-none";

export default function ProductForm({
  categories,
  product,
}: {
  categories: CategoryOption[];
  product?: ProductData;
}) {
  const [images, setImages] = useState<{ url: string }[]>(product?.images ?? []);
  const [inquiryOnly, setInquiryOnly] = useState(product?.inquiryOnly ?? false);
  const selectedOccasions = new Set((product?.occasions ?? "").split(",").map((s) => s.trim()));

  return (
    <form action={saveProduct} className="max-w-2xl space-y-5">
      {product?.id && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="imagesJson" value={JSON.stringify(images)} />

      <div>
        <label className="mb-1 block text-sm font-medium text-leaf-dark">Photos</label>
        <div className="flex flex-wrap items-center gap-3">
          {images.map((img, i) => (
            <div key={img.url} className="relative">
              <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-sage-light">
                <Image src={img.url} alt="" fill sizes="80px" className="object-cover" />
              </div>
              <button
                type="button"
                aria-label="Remove image"
                onClick={() => setImages(images.filter((_, j) => j !== i))}
                className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-charcoal text-xs text-white"
              >
                ×
              </button>
            </div>
          ))}
          <Uploader
            folder="products"
            label={images.length ? "+ Add photo" : "Upload photo"}
            onUploaded={(url) => setImages((prev) => [...prev, { url }])}
          />
        </div>
        <p className="mt-1 text-xs text-charcoal/50">First photo is the main one shown in the shop.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-leaf-dark">Name *</label>
          <input id="name" name="name" required defaultValue={product?.name} className={input} />
        </div>
        <div>
          <label htmlFor="categoryId" className="mb-1 block text-sm font-medium text-leaf-dark">Category *</label>
          <select id="categoryId" name="categoryId" required defaultValue={product?.categoryId ?? ""} className={input}>
            <option value="" disabled>Choose…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.parentName ? `${c.parentName} › ${c.name}` : c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-leaf-dark">Description *</label>
        <textarea id="description" name="description" required rows={4} defaultValue={product?.description} className={input} />
      </div>

      <div className="flex flex-wrap items-end gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="inquiryOnly"
            checked={inquiryOnly}
            onChange={(e) => setInquiryOnly(e.target.checked)}
            className="accent-leaf"
          />
          Inquiry only (custom work, no fixed price)
        </label>
        {!inquiryOnly && (
          <div>
            <label htmlFor="price" className="mb-1 block text-sm font-medium text-leaf-dark">Price (USD)</label>
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={product?.priceCents != null ? (product.priceCents / 100).toFixed(2) : ""}
              className={input}
              placeholder="18.00"
            />
          </div>
        )}
      </div>

      <div>
        <p className="mb-1 text-sm font-medium text-leaf-dark">Occasions</p>
        <div className="flex flex-wrap gap-3">
          {site.occasions.map((o) => (
            <label key={o} className="flex items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                name="occasions"
                value={o}
                defaultChecked={selectedOccasions.has(o)}
                className="accent-leaf"
              />
              {o}
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked={product?.active ?? true} className="accent-leaf" />
          Visible in shop
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={product?.featured ?? false} className="accent-leaf" />
          Featured on home page
        </label>
      </div>

      <div>
        <label htmlFor="slug" className="mb-1 block text-sm font-medium text-leaf-dark">
          URL slug <span className="font-normal text-charcoal/50">(optional — auto-generated from name)</span>
        </label>
        <input id="slug" name="slug" defaultValue={product?.slug} className={input} placeholder="lavender-soy-candle" />
      </div>

      <button
        type="submit"
        className="rounded-full bg-olive px-8 py-3 font-semibold text-cream transition-colors hover:bg-olive-dark"
      >
        {product?.id ? "Save changes" : "Create product"}
      </button>
    </form>
  );
}
