import { Form, Link, redirect, useFetcher, useActionData, useSearchParams } from "react-router";
import { useState } from "react";
import db from "~/db.server";
import NavbarAdmin from "~/components/NavbarAdmin";
import type { Route } from "./+types/adminProductAdd";

const DEFAULT_IMAGE = "https://placehold.co/400x250";

export async function loader() {
    const totalProducts = await db.product.count();
    const visibleProducts = await db.product.count({ where: { visible: true } });
    const categories = await db.category.findMany();
    return { totalProducts, visibleProducts, categories };
}

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();

    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const priceRaw = String(formData.get("price") || "").trim();
    const imageUrl = String(formData.get("imageUrl") || "").trim() || DEFAULT_IMAGE;
    const categoryId = formData.get("categoryId");

    const errors: Record<string, string> = {};

    if (!title) errors.title = "Title is required.";
    if (!description) errors.description = "Description is required.";

    const price = Number(priceRaw);
    if (!priceRaw) {
        errors.price = "Price is required.";
    } else if (isNaN(price)) {
        errors.price = "Price must be a number.";
    } else if (price <= 0) {
        errors.price = "Price must be greater than 0.";
    }

    if (Object.keys(errors).length > 0) {
        return { errors };
    }

    await db.product.create({
        data: {
            title,
            description,
            price,
            imageUrl,
            visible: formData.get("visible") === "on",
            categoryId: categoryId ? Number(categoryId) : null,
        },
    });

    const url = new URL(request.url);
    const redirectUrl = url.search ? `/admin/products${url.search}` : "/admin/products";
    return redirect(redirectUrl);
}

export default function AdminProductAdd({ loaderData }: Route.ComponentProps) {
    const { totalProducts, visibleProducts, categories } = loaderData;
    const actionData = useActionData<typeof action>();
    const [searchParams] = useSearchParams();
    const backLink = searchParams.toString() ? `/admin/products?${searchParams.toString()}` : "/admin/products";
    const [imageMode, setImageMode] = useState<"url" | "upload">("url");
    const [imageUrl, setImageUrl] = useState("");
    const [preview, setPreview] = useState("");
    const uploadFetcher = useFetcher();

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        uploadFetcher.submit(formData, {
            method: "post",
            action: "/upload",
            encType: "multipart/form-data",
        });

        setPreview(URL.createObjectURL(file));
    }

    const uploadedFilename = uploadFetcher.data?.filename;
    const hasErrors = actionData?.errors && Object.keys(actionData.errors).length > 0;

    return (
        <div className="flex flex-col min-h-screen">
            <NavbarAdmin totalProducts={totalProducts} visibleProducts={visibleProducts} />

            <div className="flex flex-1">

                <div className="flex flex-col w-48">
                    <div className="border-2 border-black m-1 p-2">
                        <h1 className="text-xl">Add Product</h1>
                    </div>
                    <div className="flex-1"></div>
                    <Link to={backLink}>
                        <div className="border-2 border-black m-1 p-2">
                            <h1 className="text-xl">← Back</h1>
                        </div>
                    </Link>
                </div>

                <div className="p-4">

                    {hasErrors && (
                        <div className="border-2 border-red-600 bg-red-50 text-red-700 text-sm p-2 mb-3 w-80">
                            Please fix the errors below before submitting.
                        </div>
                    )}

                    <Form method="post" className="flex flex-col gap-3 w-80">

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-bold">Title</label>
                            <input name="title" className="border-2 border-black p-1 text-sm" />
                            {actionData?.errors?.title && (
                                <p className="text-xs text-red-600">{actionData.errors.title}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-bold">Description</label>
                            <textarea name="description" className="border-2 border-black p-1 text-sm" rows={3} />
                            {actionData?.errors?.description && (
                                <p className="text-xs text-red-600">{actionData.errors.description}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-bold">Price</label>
                            <input name="price" type="number" step="0.01" className="border-2 border-black p-1 text-sm" />
                            {actionData?.errors?.price && (
                                <p className="text-xs text-red-600">{actionData.errors.price}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-bold">Category</label>
                            <select name="categoryId" className="border-2 border-black p-1 text-sm">
                                <option value="">No category</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setImageMode("url")}
                                className={`border-2 border-black p-1 text-sm flex-1 ${imageMode === "url" ? "bg-black text-white" : ""}`}
                            >
                                URL
                            </button>
                            <button
                                type="button"
                                onClick={() => setImageMode("upload")}
                                className={`border-2 border-black p-1 text-sm flex-1 ${imageMode === "upload" ? "bg-black text-white" : ""}`}
                            >
                                Upload
                            </button>
                        </div>

                        {imageMode === "url" ? (
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-bold">Image URL (optional)</label>
                                <input
                                    name="imageUrl"
                                    value={imageUrl}
                                    placeholder="Leave empty to use default image"
                                    onChange={(e) => {
                                        setImageUrl(e.target.value);
                                        setPreview(e.target.value);
                                    }}
                                    className="border-2 border-black p-1 text-sm"
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-bold">Upload Image (optional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="border-2 border-black p-1 text-sm"
                                />
                                {uploadedFilename && (
                                    <input type="hidden" name="imageUrl" value={`/images/${uploadedFilename}`} />
                                )}
                                {uploadFetcher.state === "submitting" && (
                                    <p className="text-xs text-gray-500">Uploading...</p>
                                )}
                            </div>
                        )}

                        {imageMode === "url" && imageUrl && (
                            <input type="hidden" name="imageUrl" value={imageUrl} />
                        )}

                        <img
                            src={preview || DEFAULT_IMAGE}
                            alt="Preview"
                            className="w-full h-40 object-cover border-2 border-black"
                        />

                        <div className="flex items-center gap-2">
                            <input type="checkbox" name="visible" id="visible" defaultChecked={true} className="w-4 h-4" />
                            <label htmlFor="visible" className="text-sm font-bold">Visible in store</label>
                        </div>

                        <button type="submit" className="border-2 border-black p-1 text-sm font-bold">
                            Add Product
                        </button>

                    </Form>
                </div>

            </div>
        </div>
    );
}