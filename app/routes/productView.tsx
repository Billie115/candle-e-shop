import { Link, Form, useFetcher } from "react-router";
import Navbar from "~/components/Navbar";
import type { Route } from "./+types/productView";

export async function loader({ request, params }: Route.LoaderArgs) {
    const db = (await import("~/db.server")).default;
    const { getCart, getUserId } = await import("~/session.server");

    const userId = await getUserId(request);

    const product = await db.product.findUnique({
        where: { id: Number(params.id), visible: true },
    });

    if (!product) {
        return { product: null, isLoggedIn: !!userId, inCart: false };
    }

    const safeProduct = {
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
    };

    const cart = await getCart(request);
    const inCart = String(product.id) in cart;

    return { product: safeProduct, isLoggedIn: !!userId, inCart };
}

export async function action({ request, params }: Route.ActionArgs) {
    const { getCart, saveCart } = await import("~/session.server");

    const formData = await request.formData();
    const intent = formData.get("intent");
    const cart = await getCart(request);
    const productId = params.id;

    if (intent === "add") {
        cart[productId] = (cart[productId] || 0) + 1;
    }

    if (intent === "remove") {
        delete cart[productId];
    }

    const cookie = await saveCart(request, cart);
    return new Response(JSON.stringify({ success: true, inCart: intent === "add" }), {
        headers: {
            "Set-Cookie": cookie,
            "Content-Type": "application/json",
        },
    });
}

export default function ProductView({ loaderData }: Route.ComponentProps) {
    const { product, isLoggedIn, inCart } = loaderData;
    const addFetcher = useFetcher();
    const currentlyInCart = addFetcher.data !== undefined
        ? addFetcher.data.inCart
        : inCart;

    if (!product) {
        return (
            <div className="flex flex-col min-h-screen">
                <Navbar isLoggedIn={isLoggedIn} />
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
            <Navbar isLoggedIn={isLoggedIn} />

            <div className="p-8 max-w-2xl mx-auto flex flex-col gap-4 w-full">

                <Link to="/products">
                    <div className="border-2 border-black p-2 text-sm w-fit">← Back to Products</div>
                </Link>

                <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-80 object-cover border-2 border-black"
                />

                <h1 className="text-2xl font-bold">{product.title}</h1>
                <p className="text-gray-600">{product.description}</p>
                <p className="text-xl font-bold">${product.price}</p>

                <addFetcher.Form method="post">
                    <input
                        type="hidden"
                        name="intent"
                        value={currentlyInCart ? "remove" : "add"}
                    />
                    <button
                        type="submit"
                        className={`border-2 p-2 text-sm font-bold transition-colors w-full ${
                            currentlyInCart
                                ? "border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                                : "border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                        }`}
                    >
                        {addFetcher.state === "submitting"
                            ? currentlyInCart ? "Removing..." : "Adding..."
                            : currentlyInCart ? "Remove from Cart" : "Add to Cart"}
                    </button>
                </addFetcher.Form>

            </div>
        </div>
    );
}