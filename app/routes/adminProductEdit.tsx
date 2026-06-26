import { useLoaderData, Form, Link, redirect } from "react-router";
import { useState } from "react";
import db from "~/db.server";
import NavbarAdmin from "~/components/NavbarAdmin";

export async function loader({ params }: { params: { id: string } }) {
    const product = await db.product.findUnique({
        where: { id: Number(params.id) },
    });
    const totalProducts = await db.product.count();
    const visibleProducts = await db.product.count({ where: { visible: true } });
    return { product, totalProducts, visibleProducts };
}

export async function action({ request, params }: { request: Request, params: { id: string } }) {
    const formData = await request.formData();
    const intent = formData.get("intent");

    if (intent === "delete") {
        await db.product.delete({
            where: { id: Number(params.id) },
        });
        return redirect("/admin/products");
    }

    await db.product.update({
        where: { id: Number(params.id) },
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

export default function AdminProductEdit() {
    const { product, totalProducts, visibleProducts } = useLoaderData<typeof loader>();
    const [imageUrl, setImageUrl] = useState(product?.imageUrl || "");

    return (
        <div className="flex flex-col min-h-screen">
            <NavbarAdmin totalProducts={totalProducts} visibleProducts={visibleProducts} />

            <div className="flex flex-1">

                {/* Sidebar */}
                <div className="flex flex-col w-48">
                    <div className="border-2 border-black m-1 p-2">
                        <h1 className="text-xl">Edit</h1>
                    </div>
                    <div className="flex-1"></div>
                    <Link to="/admin/products">
                        <div className="border-2 border-black m-1 p-2">
                            <h1 className="text-xl">← Back</h1>
                        </div>
                    </Link>
                </div>

                {/* Edit form */}
                <div className="p-4">
                    <Form method="post" className="flex flex-col gap-3 w-80">

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-bold">Title</label>
                            <input
                                name="title"
                                defaultValue={product?.title}
                                className="border-2 border-black p-1 text-sm"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-bold">Description</label>
                            <textarea
                                name="description"
                                defaultValue={product?.description}
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
                                defaultValue={product?.price}
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

                    {/* Delete form */}
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