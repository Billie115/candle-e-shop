import { useLoaderData, useFetcher, Link } from "react-router";
import { useState } from "react";
import db from "~/db.server";
import NavbarAdmin from "~/components/NavbarAdmin";

export async function loader() {
    const products = await db.product.findMany();
    const totalProducts = products.length;
    const visibleProducts = products.filter(p => p.visible).length;
    return { products, totalProducts, visibleProducts };
}

export async function action({ request }: { request: Request }) {
    const formData = await request.formData();
    const id = Number(formData.get("id"));
    const visible = formData.get("visible") === "true";

    await db.product.update({
        where: { id },
        data: { visible: !visible },
    });

    return null;
}

export default function AdminProducts() {
    const { products, totalProducts, visibleProducts } = useLoaderData<typeof loader>();
    const fetcher = useFetcher();
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("default");

    const filtered = products
        .filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => {
            if (sort === "price-asc") return a.price - b.price;
            if (sort === "price-desc") return b.price - a.price;
            if (sort === "name-asc") return a.title.localeCompare(b.title);
            if (sort === "name-desc") return b.title.localeCompare(a.title);
            return 0;
        });

    return (
        <div className="flex flex-col min-h-screen">
            <NavbarAdmin totalProducts={totalProducts} visibleProducts={visibleProducts} />

            <div className="flex flex-1">

                {/* Sidebar */}
                <div className="flex flex-col w-48">
                    <Link to="/admin/products/add">
                        <div className="border-2 border-black m-1 p-2">
                            <h1 className="text-xl">+ Add</h1>
                        </div>
                    </Link>
                    <div className="flex-1"></div>
                    <Link to="/admin">
                        <div className="border-2 border-black m-1 p-2">
                            <h1 className="text-xl">← Back</h1>
                        </div>
                    </Link>
                </div>

                {/* Main content */}
                <div className="flex flex-col flex-1 p-4 gap-3">

                    {/* Search and sort */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="border-2 border-black p-1 text-sm flex-1"
                        />
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="border-2 border-black p-1 text-sm"
                        >
                            <option value="default">Sort: Default</option>
                            <option value="price-asc">Price: Low to High</option>
                            <option value="price-desc">Price: High to Low</option>
                            <option value="name-asc">Name: A to Z</option>
                            <option value="name-desc">Name: Z to A</option>
                        </select>
                    </div>

                    {/* Products grid */}
                    <div className="grid grid-cols-3 gap-3">
                        {filtered.length === 0 ? (
                            <p className="text-gray-600 text-sm col-span-3">No products found.</p>
                        ) : (
                            filtered.map((product) => (
                                <div key={product.id} className="border-2 border-black p-2 flex flex-col gap-1">
                                    <Link to={`/admin/products/${product.id}`}>
                                        <img
                                            src={product.imageUrl}
                                            alt={product.title}
                                            className="w-full h-40 object-cover border-2 border-black"
                                        />
                                        <h1 className="text-base font-bold">{product.title}</h1>
                                        <p className="text-xs text-gray-600">{product.description}</p>
                                        <p className="text-sm">${product.price}</p>
                                    </Link>
                                    <fetcher.Form method="post">
                                        <input type="hidden" name="id" value={product.id} />
                                        <input type="hidden" name="visible" value={String(product.visible)} />
                                        <button
                                            type="submit"
                                            className={`border-2 border-black p-1 w-full text-sm text-white ${
                                                product.visible ? "bg-green-500" : "bg-red-500"
                                            }`}
                                        >
                                            {product.visible ? "Visible" : "Hidden"}
                                        </button>
                                    </fetcher.Form>
                                </div>
                            ))
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}