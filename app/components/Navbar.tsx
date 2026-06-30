import { Link, Form } from "react-router";

interface NavbarProps {
    isLoggedIn?: boolean;
}

export default function Navbar({ isLoggedIn = false }: NavbarProps) {
    return (
        <div className="flex items-center gap-8 border-b-2 border-black p-3">
            <Link to="/">
                <h1 className="text-xl font-bold">Candle Shop</h1>
            </Link>
            <div className="flex gap-4">
                <Link to="/">
                    <p className="text-sm hover:underline">Home</p>
                </Link>
                <Link to="/products">
                    <p className="text-sm hover:underline">Products</p>
                </Link>
                <Link to="/cart">
                    <p className="text-sm hover:underline">Cart</p>
                </Link>
            </div>
            <div className="ml-auto">
                {isLoggedIn ? (
                    <Form method="post" action="/logout">
                        <button type="submit" className="text-sm border-2 border-black px-2 py-1">
                            Logout
                        </button>
                    </Form>
                ) : (
                    <Link to="/login">
                        <p className="text-sm hover:underline">Login</p>
                    </Link>
                )}
            </div>
        </div>
    );
}