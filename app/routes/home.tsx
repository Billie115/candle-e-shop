import { Link } from "react-router";
import Navbar from "~/components/Navbar";
import type { Route } from "./+types/home";

export async function loader({ request }: Route.LoaderArgs) {
    const db = (await import("~/db.server")).default;
    const { getUserId } = await import("~/session.server");

    const products = await db.product.findMany({
        where: { visible: true },
        take: 5,
    });

    const safeProducts = products.map((product) => ({
        id: product.id,
        title: product.title,
        price: product.price,
        imageUrl: product.imageUrl,
    }));

    const userId = await getUserId(request);
    let isAdmin = false;

    if (userId) {
        const user = await db.user.findUnique({ where: { id: userId } });
        isAdmin = user?.isAdmin ?? false;
    }

    return { products: safeProducts, isAdmin, isLoggedIn: !!userId };
}

export default function Home({ loaderData }: Route.ComponentProps) {
    const { products, isAdmin, isLoggedIn } = loaderData;

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar isLoggedIn={isLoggedIn} />

            <div className="flex flex-col items-center p-8 gap-8">

                <div className="border-2 border-black p-8 w-64 text-center">
                    <h1 className="text-3xl font-bold">Candle Shop</h1>
                    <p className="text-sm text-gray-600 mt-1">An agorazeis apo emas, den eisai gay</p>
                </div>

                {isAdmin && (
                    <Link to="/admin">
                        <div className="border-2 border-black p-2 bg-black text-white text-sm font-bold">
                            Admin View
                        </div>
                    </Link>
                )}

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