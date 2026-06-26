import { useLoaderData, Link } from "react-router";
import db from "~/db.server";
import Navbar from "~/components/Navbar";

export async function loader() {
    const products = await db.product.findMany({
        where: { visible: true },
    });
    return { products };
}

export default function Products() {
    const { products } = useLoaderData<typeof loader>();

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />

            <div className="p-8">
                <h1 className="text-2xl font-bold mb-6">All Products</h1>

                {products.length === 0 ? (
                    <div className="border-2 border-black p-8 text-center">
                        <p className="text-gray-600">No products available right now. Check back soon!</p>
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
                                    <p className="text-xs text-gray-600">{product.description}</p>
                                    <p className="text-sm">${product.price}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}