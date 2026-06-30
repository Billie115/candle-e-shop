import { Link } from "react-router";
import db from "~/db.server";
import Navbar from "~/components/Navbar";
import type { Route } from "./+types/productView";

export async function loader({ params }: Route.LoaderArgs) {
    const product = await db.product.findUnique({
        where: { id: Number(params.id), visible: true },
    });

    if (!product) {
        return { product: null };
    }

    const safeProduct = {
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
    };

    return { product: safeProduct };
}

export default function ProductView({ loaderData }: Route.ComponentProps) {
    const { product } = loaderData;

    if (!product) {
        return (
            <div className="flex flex-col min-h-screen">
                <Navbar />
                <div className="p-8">
                    <p className="text-gray-600">Product not found.</p>
                    <Link to="/products">
                        <div className="border-2 border-black p-2 text-sm w-fit mt-4">← Back to products</div>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />

            <div className="p-8 max-w-2xl mx-auto flex flex-col gap-4 w-full">

                <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-80 object-cover border-2 border-black"
                />

                <h1 className="text-2xl font-bold">{product.title}</h1>
                <p className="text-gray-600">{product.description}</p>
                <p className="text-xl font-bold">${product.price}</p>

                <button className="border-2 border-black p-2 text-sm font-bold hover:bg-black hover:text-white transition-colors">
                    Add to Cart
                </button>

            </div>
        </div>
    );
}