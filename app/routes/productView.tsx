import { useLoaderData, Link } from "react-router";
import db from "~/db.server";

export async function loader({ params }: { params: { id: string } }) {
    const product = await db.product.findUnique({
        where: { id: Number(params.id), visible: true },
    });
    return { product };
}

export default function ProductView() {
    const { product } = useLoaderData<typeof loader>();

    if (!product) {
        return (
            <div className="p-8">
                <p>Product not found.</p>
                <Link to="/products">← Back to products</Link>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-2xl mx-auto flex flex-col gap-4">

            <Link to="/products">
                <div className="border-2 border-black p-2 text-sm w-fit">← Back</div>
            </Link>

            <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-80 object-cover border-2 border-black"
            />

            <h1 className="text-2xl font-bold">{product.title}</h1>
            <p className="text-gray-600">{product.description}</p>
            <p className="text-xl font-bold">${product.price}</p>

        </div>
    );
}