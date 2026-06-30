import { Form, Link, redirect, useFetcher, useActionData, useSearchParams } from "react-router";
import { useState } from "react";
import db from "~/db.server";
import NavbarAdmin from "~/components/NavbarAdmin";
import type { Route } from "./+types/adminProductEdit";
import { requireAdmin } from "~/session.server";

const DEFAULT_IMAGE = "https://placehold.co/400x250";

export async function loader({ request, params }: Route.LoaderArgs) {
    await requireAdmin(request);
    
    const product = await db.product.findUnique({
        where: { id: Number(params.id) },
    });

    const safeProduct = product ? {
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
        visible: product.visible,
        categoryId: product.categoryId,
    } : null;

    const totalProducts = await db.product.count();
    const visibleProducts = await db.product.count({ where: { visible: true } });
    const categories = await db.category.findMany();

    return { product: safeProduct, totalProducts, visibleProducts, categories };
}

export async function action({ request, params }: Route.ActionArgs) {
    const formData = await request.formData();
    const intent = formData.get("intent");

    if (intent === "delete") {
        await db.product.delete({
            where: { id: Number(params.id) },
        });
        return redirect("/admin/products");
    }

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

    await db.product.update({
        where: { id: Number(params.id) },
        data: {
            title,
            description,
            price,
            imageUrl,
            visible: formData.get("visible") === "on",
            categoryId: categoryId ? Number(categoryId) : null,
        },
    });

    return redirect("/admin/products");
}

export default function AdminProductEdit({ loaderData }: Route.ComponentProps) {
    const { product, totalProducts, visibleProducts, categories } = loaderData;
    const actionData = useActionData<typeof action>();
    const [searchParams] = useSearchParams();
    const backLink = searchParams.toString() ? `/admin/products?${searchParams.toString()}` : "/admin/products";
    const [imageMode, setImageMode] = useState<"url" | "upload">("url");
    const [imageUrl, setImageUrl] = useState(product?.imageUrl || "");
    const [preview, setPreview] = useState(product?.imageUrl || "");
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
                        <h1 className="text-xl">Edit</h1>
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
                            <input
                                name="title"
                                defaultValue={product?.title}
                                className="border-2 border-black p-1 text-sm"
                            />
                            {actionData?.errors?.title && (
                                <p className="text-xs text-red-600">{actionData.errors.title}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-bold">Description</label>
                            <textarea
                                name="description"
                                defaultValue={product?.description}
                                className="border-2 border-black p-1 text-sm"
                                rows={3}
                            />
                            {actionData?.errors?.description && (
                                <p className="text-xs text-red-600">{actionData.errors.description}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-bold">Price</label>
                            <input
                                name="price"
                                type="number"
                                step="0.01"
                                defaultValue={product?.price}
                                className="border-2 border-black p-1 text-sm"
                            />
                            {actionData?.errors?.price && (
                                <p className="text-xs text-red-600">{actionData.errors.price}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-bold">Category</label>
                            <select
                                name="categoryId"
                                defaultValue={product?.categoryId ?? ""}
                                className="border-2 border-black p-1 text-sm"
                            >
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
                                {!uploadedFilename && product?.imageUrl && (
                                    <input type="hidden" name="imageUrl" value={product.imageUrl} />
                                )}
                                {uploadFetcher.state === "submitting" && (
                                    <p className="text-xs text-gray-500">Uploading...</p>
                                )}
                            </div>
                        )}

                        <img
                            src={preview || DEFAULT_IMAGE}
                            alt="Preview"
                            className="w-full h-40 object-cover border-2 border-black"
                        />

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="visible"
                                id="visible"
                                defaultChecked={product?.visible}
                                className="w-4 h-4"
                            />
                            <label htmlFor="visible" className="text-sm font-bold">Visible in store</label>
                        </div>

                        <button
                            type="submit"
                            name="intent"
                            value="save"
                            className="border-2 border-black p-1 text-sm font-bold"
                        >
                            Save
                        </button>

                    </Form>

                    <Form
                        method="post"
                        className="mt-2 w-80"
                        onSubmit={(e) => {
                            if (!confirm("Are you sure you want to delete this product?")) {
                                e.preventDefault();
                            }
                        }}
                    >
                        <input type="hidden" name="intent" value="delete" />
                        <button
                            type="submit"
                            className="border-2 border-red-600 p-1 text-sm font-bold text-red-600 w-full"
                        >
                            Delete Product
                        </button>
                    </Form>

                </div>
            </div>
        </div>
    );
}