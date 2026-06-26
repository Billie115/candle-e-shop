import { useLoaderData, Link } from "react-router";
import db from "~/db.server";
import Navbar from "~/components/Navbar";

export async function loader() {
    const products = await db.product.findMany({
        where: { visible: true },
        take: 5,
    });
    return { products };
}

export default function Home() {
    const { products } = useLoaderData<typeof loader>();

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />

            <div className="flex flex-col items-center p-8 gap-8">

                <div className="border-2 border-black p-8 w-64 text-center">
                    <h1 className="text-3xl font-bold">Candle Shop</h1>
                    <p className="text-sm text-gray-600 mt-1">An agorazeis apo emas, den eisai gay</p>
                </div>

                <div className="w-full max-w-4xl">
                    <h2 className="text-xl font-bold mb-4">Featured Products</h2>

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
                                        <p className="text-sm">${product.price}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    <div className="mt-4">
                        <Link to="/products">
                            <div className="border-2 border-black p-2 text-center">
                                <p className="text-sm font-bold">View all products →</p>
                            </div>
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}