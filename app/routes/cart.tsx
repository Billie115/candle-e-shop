import { Form, Link, useFetcher } from "react-router";
import db from "~/db.server";
import Navbar from "~/components/Navbar";
import type { Route } from "./+types/cart";

export async function loader({ request }: Route.LoaderArgs) {
    const { getCart, getUserId } = await import("~/session.server");
    const userId = await getUserId(request);
    const cart = await getCart(request);

    const productIds = Object.keys(cart).map(Number);

    const products = await db.product.findMany({
        where: { id: { in: productIds } },
    });

    const items = products.map((product) => ({
        id: product.id,
        title: product.title,
        price: product.price,
        imageUrl: product.imageUrl,
        quantity: cart[product.id] || 0,
    }));

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return { items, total, isLoggedIn: !!userId };
}

export async function action({ request }: Route.ActionArgs) {
    const { getCart, saveCart } = await import("~/session.server");
    const formData = await request.formData();
    const intent = formData.get("intent");
    const productId = String(formData.get("productId"));

    const cart = await getCart(request);

    if (intent === "remove") {
        delete cart[productId];
    }

    if (intent === "increase") {
        cart[productId] = (cart[productId] || 0) + 1;
    }

    if (intent === "decrease") {
        cart[productId] = (cart[productId] || 0) - 1;
        if (cart[productId] <= 0) delete cart[productId];
    }

    const cookie = await saveCart(request, cart);
    return new Response(null, {
        headers: { "Set-Cookie": cookie },
    });
}

export default function Cart({ loaderData }: Route.ComponentProps) {
    const { items, total, isLoggedIn } = loaderData;
    const fetcher = useFetcher();

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar isLoggedIn={isLoggedIn} />

            <div className="p-8 max-w-3xl mx-auto w-full">
                <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

                {items.length === 0 ? (
                    <div className="border-2 border-black p-8 text-center">
                        <p className="text-gray-600">Your cart is empty.</p>
                        <Link to="/products">
                            <div className="border-2 border-black p-2 text-sm mt-4 w-fit mx-auto">Browse Products</div>
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {items.map((item) => (
                            <div key={item.id} className="flex items-center gap-3 border-2 border-black p-2">
                                <img
                                    src={item.imageUrl}
                                    alt={item.title}
                                    className="w-16 h-16 object-cover border-2 border-black"
                                />
                                <div className="flex-1">
                                    <p className="font-bold">{item.title}</p>
                                    <p className="text-sm text-gray-600">${item.price} each</p>
                                </div>

                                <fetcher.Form method="post" className="flex items-center gap-2">
                                    <input type="hidden" name="productId" value={item.id} />
                                    <button name="intent" value="decrease" className="border-2 border-black w-6 h-6 text-sm">-</button>
                                    <span className="text-sm w-6 text-center">{item.quantity}</span>
                                    <button name="intent" value="increase" className="border-2 border-black w-6 h-6 text-sm">+</button>
                                </fetcher.Form>

                                <p className="font-bold w-16 text-right">${(item.price * item.quantity).toFixed(2)}</p>

                                <fetcher.Form method="post">
                                    <input type="hidden" name="productId" value={item.id} />
                                    <button name="intent" value="remove" className="text-red-600 text-sm hover:underline">Remove</button>
                                </fetcher.Form>
                            </div>
                        ))}

                        <div className="flex justify-between items-center border-t-2 border-black pt-3 mt-2">
                            <p className="text-xl font-bold">Total: ${total.toFixed(2)}</p>
                            <Link to="/checkout">
                                <div className="border-2 border-black p-2 bg-black text-white text-sm font-bold">
                                    Checkout
                                </div>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}