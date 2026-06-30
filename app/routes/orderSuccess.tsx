import { Link } from "react-router";
import Navbar from "~/components/Navbar";
import type { Route } from "./+types/orderSuccess";

export async function loader({ request }: Route.LoaderArgs) {
    const { getUserId } = await import("~/session.server");
    const userId = await getUserId(request);
    return { isLoggedIn: !!userId };
}

export default function OrderSuccess({ loaderData }: Route.ComponentProps) {
    const { isLoggedIn } = loaderData;

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar isLoggedIn={isLoggedIn} />
            <div className="flex flex-col items-center justify-center flex-1 gap-4">
                <h1 className="text-2xl font-bold">Order Placed!</h1>
                <p className="text-gray-600">Thank you for your order. We'll be in touch soon.</p>
                <Link to="/products">
                    <div className="border-2 border-black p-2 text-sm">Continue Shopping</div>
                </Link>
            </div>
        </div>
    );
}