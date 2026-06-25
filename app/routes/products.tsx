import { useLoaderData, Link } from "react-router";
import db from "~/db.server";

export async function loader() {
    const products = await db.product.findMany({
        where: { visible: true },
    });
    return { products };
}

export default function Products() {
    const { products } = useLoaderData<typeof loader>();

    return (
        <div className="p-8">

            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">All Products</h1>
                <Link to="/">
                    <div className="border-2 border-black p-2 text-sm">← Back</div>
                </Link>
            </div>

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

        </div>
    );
}