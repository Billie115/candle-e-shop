import { Form, Link, redirect, useLoaderData } from "react-router";
import { useState } from "react";
import db from "~/db.server";
import NavbarAdmin from "~/components/NavbarAdmin";

export async function loader() {
    const totalProducts = await db.product.count();
    const visibleProducts = await db.product.count({ where: { visible: true } });
    return { totalProducts, visibleProducts };
}

export async function action({ request }: { request: Request }) {
    const formData = await request.formData();

    await db.product.create({
        data: {
            title: String(formData.get("title")),
            description: String(formData.get("description")),
            price: Number(formData.get("price")),
            imageUrl: String(formData.get("imageUrl")),
            visible: formData.get("visible") === "on",
        },
    });

    return redirect("/admin/products");
}

export default function AdminProductAdd() {
    const { totalProducts, visibleProducts } = useLoaderData<typeof loader>();
    const [imageUrl, setImageUrl] = useState("");

    return (
        <div className="flex flex-col min-h-screen">
            <NavbarAdmin totalProducts={totalProducts} visibleProducts={visibleProducts} />

            <div className="flex flex-1">

                {/* Sidebar */}
                <div className="flex flex-col w-48">
                    <div className="border-2 border-black m-1 p-2">
                        <h1 className="text-xl">Add Product</h1>
                    </div>
                    <div className="flex-1"></div>
                    <Link to="/admin/products">
                        <div className="border-2 border-black m-1 p-2">
                            <h1 className="text-xl">← Back</h1>
                        </div>
                    </Link>
                </div>

                {/* Form */}
                <div className="p-4">
                    <Form method="post" className="flex flex-col gap-3 w-80">

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-bold">Title</label>
                            <input
                                name="title"
                                className="border-2 border-black p-1 text-sm"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-bold">Description</label>
                            <textarea
                                name="description"
                                className="border-2 border-black p-1 text-sm"
                                rows={3}
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-bold">Price</label>
                            <input
                                name="price"
                                type="number"
                                step="0.01"
                                className="border-2 border-black p-1 text-sm"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-bold">Image URL</label>
                            <input
                                name="imageUrl"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                className="border-2 border-black p-1 text-sm"
                            />
                            {imageUrl && (
                                <img
                                    src={imageUrl}
                                    alt="Preview"
                                    className="w-full h-40 object-cover border-2 border-black mt-1"
                                />
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="visible"
                                id="visible"
                                defaultChecked={true}
                                className="w-4 h-4"
                            />
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