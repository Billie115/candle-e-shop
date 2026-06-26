import { useLoaderData, Link } from "react-router";
import db from "~/db.server";
import NavbarAdmin from "~/components/NavbarAdmin";

export async function loader() {
    const totalProducts = await db.product.count();
    const visibleProducts = await db.product.count({ where: { visible: true } });
    return { totalProducts, visibleProducts };
}

export default function Admin() {
    const { totalProducts, visibleProducts } = useLoaderData<typeof loader>();

    return (
        <div className="flex flex-col min-h-screen">
            <NavbarAdmin totalProducts={totalProducts} visibleProducts={visibleProducts} />

            <div className="p-8 flex flex-col gap-4">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <Link to="/admin/products">
                    <div className="border-2 border-black p-4 w-48 hover:bg-gray-50">
                        <h1 className="text-xl">Products</h1>
                        <p className="text-sm text-gray-600 mt-1">{totalProducts} total</p>
                    </div>
                </Link>
            </div>
        </div>
    );
}