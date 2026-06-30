import { Link, useSearchParams, Form } from "react-router";
import Navbar from "~/components/Navbar";
import type { Route } from "./+types/products";

const PAGE_SIZE = 5;

const SORT_LABELS: Record<string, string> = {
    "price-asc": "Price: Low to High",
    "price-desc": "Price: High to Low",
    "name-asc": "Name: A to Z",
    "name-desc": "Name: Z to A",
};

export async function loader({ request }: Route.LoaderArgs) {
    const db = (await import("~/db.server")).default;
    const { getUserId } = await import("~/session.server");

    const userId = await getUserId(request);
    const url = new URL(request.url);
    const requestedPage = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const search = url.searchParams.get("search") || "";
    const sort = url.searchParams.get("sort") || "default";
    const categoryIds = url.searchParams.getAll("category").map(Number);

    const where: any = { visible: true };
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
        categoryName: product.category?.name ?? null,
    }));

    const categories = await db.category.findMany();
    const categoriesWithCounts = await Promise.all(
        categories.map(async (category) => {
            const count = await db.product.count({ where: { categoryId: category.id, visible: true } });
            return { ...category, count };
        })
    );

    return {
        products: safeProducts,
        page,
        totalPages,
        search,
        sort,
        categories: categoriesWithCounts,
        selectedCategoryIds: categoryIds,
        isLoggedIn: !!userId,
    };
}

export default function Products({ loaderData }: Route.ComponentProps) {
    const { products, page, totalPages, search, sort, categories, selectedCategoryIds, isLoggedIn } = loaderData;
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

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar isLoggedIn={isLoggedIn} />

            <div className="p-8">
                <h1 className="text-2xl font-bold mb-6">All Products</h1>

                <div className="flex gap-2 mb-2">
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
                    <div className="flex gap-1 flex-wrap items-center mb-6">
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

                {products.length === 0 ? (
                    <div className="border-2 border-black p-8 text-center">
                        <p className="text-gray-600">No products found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-4">
                        {products.map((product) => (
                            <Link to={`/products/${product.id}`} key={product.id}>
                                <div className="border-2 border-black p-2 flex flex-col gap-1 hover:bg-gray-50">
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
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="flex gap-2 mt-6 justify-center">
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
    );
}