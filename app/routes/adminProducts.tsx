import { useFetcher, Link, useSearchParams, Form } from "react-router";
import db from "~/db.server";
import NavbarAdmin from "~/components/NavbarAdmin";
import type { Route } from "./+types/adminProducts";

const PAGE_SIZE = 5;

const SORT_LABELS: Record<string, string> = {
    "price-asc": "Price: Low to High",
    "price-desc": "Price: High to Low",
    "name-asc": "Name: A to Z",
    "name-desc": "Name: Z to A",
};

export async function loader({ request }: Route.LoaderArgs) {
    const url = new URL(request.url);
    const requestedPage = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const search = url.searchParams.get("search") || "";
    const sort = url.searchParams.get("sort") || "default";
    const categoryIds = url.searchParams.getAll("category").map(Number);

    const where: any = {};
    if (search) where.title = { contains: search };
    if (categoryIds.length > 0) where.categoryId = { in: categoryIds };

    let orderBy: any = undefined;
    if (sort === "price-asc") orderBy = { price: "asc" as const };
    if (sort === "price-desc") orderBy = { price: "desc" as const };
    if (sort === "name-asc") orderBy = { title: "asc" as const };
    if (sort === "name-desc") orderBy = { title: "desc" as const };

    const totalCount = await db.product.count({ where });
    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    const page = Math.min(requestedPage, totalPages);

    const products = await db.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: { category: true },
    });

    const safeProducts = products.map((product) => ({
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
        visible: product.visible,
        categoryName: product.category?.name ?? null,
    }));

    const categories = await db.category.findMany();
    const categoriesWithCounts = await Promise.all(
        categories.map(async (category) => {
            const count = await db.product.count({ where: { categoryId: category.id } });
            return { ...category, count };
        })
    );

    const totalProductsCount = await db.product.count();
    const visibleProductsCount = await db.product.count({ where: { visible: true } });

    return {
        products: safeProducts,
        totalProducts: totalProductsCount,
        visibleProducts: visibleProductsCount,
        page,
        totalPages,
        search,
        sort,
        categories: categoriesWithCounts,
        selectedCategoryIds: categoryIds,
    };
}

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const id = Number(formData.get("id"));
    const visible = formData.get("visible") === "true";

    await db.product.update({
        where: { id },
        data: { visible: !visible },
    });

    return null;
}

export default function AdminProducts({ loaderData }: Route.ComponentProps) {
    const { products, totalProducts, visibleProducts, page, totalPages, search, sort, categories, selectedCategoryIds } = loaderData;
    const fetcher = useFetcher();
    const [searchParams, setSearchParams] = useSearchParams();

    function pageLink(p: number) {
        const params = new URLSearchParams(searchParams);
        params.set("page", String(p));
        return `?${params.toString()}`;
    }

    function toggleCategory(id: number) {
        const params = new URLSearchParams(searchParams);
        params.delete("category");
        const next = selectedCategoryIds.includes(id)
            ? selectedCategoryIds.filter(c => c !== id)
            : [...selectedCategoryIds, id];
        next.forEach(c => params.append("category", String(c)));
        params.set("page", "1");
        setSearchParams(params);
    }

    function setSort(value: string) {
        const params = new URLSearchParams(searchParams);
        if (value === "default") {
            params.delete("sort");
        } else {
            params.set("sort", value);
        }
        params.set("page", "1");
        setSearchParams(params);
    }

    const queryString = searchParams.toString();
    const addLink = queryString ? `/admin/products/add?${queryString}` : "/admin/products/add";

    return (
        <div className="flex flex-col min-h-screen">
            <NavbarAdmin totalProducts={totalProducts} visibleProducts={visibleProducts} />

            <div className="flex flex-1">

                <div className="flex flex-col w-48">
                    <Link to={addLink}>
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

                <div className="flex flex-col flex-1 p-4 gap-2">

                    <div className="flex gap-2">
                        <Form method="get" className="flex-1 flex gap-2">
                            {selectedCategoryIds.map((id) => (
                                <input key={id} type="hidden" name="category" value={id} />
                            ))}
                            {sort !== "default" && <input type="hidden" name="sort" value={sort} />}
                            <input
                                type="text"
                                name="search"
                                placeholder="Search products..."
                                defaultValue={search}
                                className="border-2 border-black p-1 text-sm flex-1"
                            />
                        </Form>

                        <select
                            value=""
                            onChange={(e) => toggleCategory(Number(e.target.value))}
                            className="border-2 border-black p-1 text-sm"
                        >
                            <option value="">Category</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {selectedCategoryIds.includes(category.id) ? "✓ " : ""}{category.name} ({category.count})
                                </option>
                            ))}
                        </select>

                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="border-2 border-black p-1 text-sm"
                        >
                            <option value="default">Sort: Default</option>
                            {Object.entries(SORT_LABELS).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </div>

                    {(selectedCategoryIds.length > 0 || sort !== "default") && (
                        <div className="flex gap-1 flex-wrap items-center">
                            {selectedCategoryIds.map((id) => {
                                const category = categories.find(c => c.id === id);
                                if (!category) return null;
                                return (
                                    <div key={id} className="flex items-center gap-1 bg-gray-100 border-2 border-black text-xs px-2 py-1">
                                        <span>{category.name}</span>
                                        <button onClick={() => toggleCategory(id)} className="font-bold hover:text-red-600">×</button>
                                    </div>
                                );
                            })}
                            {sort !== "default" && (
                                <div className="flex items-center gap-1 bg-gray-100 border-2 border-black text-xs px-2 py-1">
                                    <span>{SORT_LABELS[sort]}</span>
                                    <button onClick={() => setSort("default")} className="font-bold hover:text-red-600">×</button>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-3 gap-3 mt-1">
                        {products.length === 0 ? (
                            <p className="text-gray-600 text-sm col-span-3">No products found.</p>
                        ) : (
                            products.map((product) => (
                                <div key={product.id} className="border-2 border-black p-2 flex flex-col gap-1">
                                    <Link to={`/admin/products/${product.id}?${queryString}`}>
                                        <img
                                            src={product.imageUrl}
                                            alt={product.title}
                                            className="w-full h-40 object-cover border-2 border-black"
                                        />
                                        <h1 className="text-base font-bold">{product.title}</h1>
                                        {product.categoryName && (
                                            <p className="text-xs text-gray-500">{product.categoryName}</p>
                                        )}
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

                    {totalPages > 1 && (
                        <div className="flex gap-2 mt-2 justify-center">
                            <Link
                                to={page > 1 ? pageLink(page - 1) : "#"}
                                className={`border-2 border-black px-3 py-1 text-sm ${page <= 1 ? "opacity-30 pointer-events-none" : ""}`}
                            >
                                ← Prev
                            </Link>
                            <p className="text-sm self-center">Page {page} of {totalPages}</p>
                            <Link
                                to={page < totalPages ? pageLink(page + 1) : "#"}
                                className={`border-2 border-black px-3 py-1 text-sm ${page >= totalPages ? "opacity-30 pointer-events-none" : ""}`}
                            >
                                Next →
                            </Link>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}