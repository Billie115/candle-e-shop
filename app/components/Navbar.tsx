import { Link } from "react-router";

export default function Navbar() {
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
            </div>
        </div>
    );
}