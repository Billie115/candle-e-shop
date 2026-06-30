import { Form, Link } from "react-router";
import Navbar from "~/components/Navbar";
import type { Route } from "./+types/checkout";

export async function loader({ request }: Route.LoaderArgs) {
    const { redirect } = await import("react-router");
    const db = (await import("~/db.server")).default;
    const { getCart, getUserId } = await import("~/session.server");

    const userId = await getUserId(request);

    if (!userId) {
        throw redirect("/login?redirectTo=/checkout");
    }

    const cart = await getCart(request);
    const productIds = Object.keys(cart).map(Number);

    if (productIds.length === 0) {
        throw redirect("/cart");
    }

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

    return { items, total, isLoggedIn: true };
}

export async function action({ request }: Route.ActionArgs) {
    console.log("ACTION CALLED");
    const { redirect } = await import("react-router");
    const db = (await import("~/db.server")).default;
    const { getCart, saveCart, getUserId } = await import("~/session.server");

    const userId = await getUserId(request);

    if (!userId) {
        throw redirect("/login?redirectTo=/checkout");
    }

    const formData = await request.formData();
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const address = String(formData.get("address") || "").trim();
    const phone = String(formData.get("phone") || "").trim();

    const errors: Record<string, string> = {};

    if (!name) errors.name = "Name is required.";
    if (!email) errors.email = "Email is required.";
    if (!address) errors.address = "Address is required.";
    if (!phone) errors.phone = "Phone is required.";

    if (Object.keys(errors).length > 0) {
        const cart = await getCart(request);
        const productIds = Object.keys(cart).map(Number);
        const products = await db.product.findMany({ where: { id: { in: productIds } } });
        const items = products.map((p) => ({ id: p.id, title: p.title, price: p.price, imageUrl: p.imageUrl, quantity: cart[p.id] || 0 }));
        const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        return { errors, items, total, isLoggedIn: true };
    }

    const cart = await getCart(request);
    const productIds = Object.keys(cart).map(Number);
    const products = await db.product.findMany({ where: { id: { in: productIds } } });
    const items = products.map((p) => ({
        id: p.id,
        title: p.title,
        price: p.price,
        quantity: cart[p.id] || 0,
    }));
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const itemList = items
        .map((item) => `${item.title} x${item.quantity} — $${(item.price * item.quantity).toFixed(2)}`)
        .join("\n");

    try {
        const result = await resend.emails.send({
            from: "onboarding@resend.dev",
            to: process.env.SHOP_EMAIL!,
            subject: `New Order from ${name}`,
            text: `
New order received!

Customer Details:
Name: ${name}
Email: ${email}
Phone: ${phone}
Address: ${address}

Order:
${itemList}

Total: $${total.toFixed(2)}
            `.trim(),
        });
        console.log("Email result:", result);
    } catch (err) {
        console.error("Email error:", err);
    }

    const cookie = await saveCart(request, {});

    return redirect("/order-success", {
        headers: { "Set-Cookie": cookie },
    });
}

export default function Checkout({ loaderData, actionData }: Route.ComponentProps) {
    const { items, total, isLoggedIn } = loaderData;
    const errors = actionData?.errors;

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar isLoggedIn={isLoggedIn} />

            <div className="p-8 max-w-3xl mx-auto w-full flex flex-col gap-6">
                <h1 className="text-2xl font-bold">Checkout</h1>

                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-bold">Order Summary</h2>
                    {items.map((item) => (
                        <div key={item.id} className="flex justify-between border-2 border-black p-2 text-sm">
                            <span>{item.title} x{item.quantity}</span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                    <div className="flex justify-between border-t-2 border-black pt-2 font-bold">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                </div>

                {errors && Object.keys(errors).length > 0 && (
                    <div className="border-2 border-red-600 bg-red-50 text-red-700 text-sm p-2">
                        Please fix the errors below.
                    </div>
                )}

                <Form method="post" className="flex flex-col gap-3">

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-bold">Full Name</label>
                        <input name="name" className="border-2 border-black p-1 text-sm" />
                        {errors?.name && <p className="text-xs text-red-600">{errors.name}</p>}
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-bold">Email</label>
                        <input name="email" type="email" className="border-2 border-black p-1 text-sm" />
                        {errors?.email && <p className="text-xs text-red-600">{errors.email}</p>}
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-bold">Phone</label>
                        <input name="phone" className="border-2 border-black p-1 text-sm" />
                        {errors?.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-bold">Address</label>
                        <textarea name="address" rows={3} className="border-2 border-black p-1 text-sm" />
                        {errors?.address && <p className="text-xs text-red-600">{errors.address}</p>}
                    </div>

                    <button type="submit" className="border-2 border-black p-2 text-sm font-bold bg-black text-white">
                        Place Order
                    </button>

                </Form>

                <Link to="/cart">
                    <div className="border-2 border-black p-2 text-sm w-fit">← Back to Cart</div>
                </Link>

            </div>
        </div>
    );
}