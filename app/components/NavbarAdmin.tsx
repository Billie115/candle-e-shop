import { Link, Form } from "react-router";

interface NavbarAdminProps {
    totalProducts: number;
    visibleProducts: number;
}

export default function NavbarAdmin({ totalProducts, visibleProducts }: NavbarAdminProps) {
    return (
        <div className="flex items-center gap-8 border-b-2 border-black p-3">
            <Link to="/admin">
                <h1 className="text-xl font-bold">Admin Panel</h1>
            </Link>
            <div className="flex gap-4">
                <Link to="/admin/products">
                    <p className="text-sm hover:underline">Products</p>
                </Link>
            </div>
            <div className="flex gap-4 text-sm text-gray-600">
                <p>Total: <span className="font-bold text-black">{totalProducts}</span></p>
                <p>Visible: <span className="font-bold text-green-600">{visibleProducts}</span></p>
                <p>Hidden: <span className="font-bold text-red-600">{totalProducts - visibleProducts}</span></p>
            </div>
            <div className="ml-auto flex gap-2">
                <Link to="/">
                    <div className="text-sm border-2 border-black px-3 py-1">
                        ← Site
                    </div>
                </Link>
                <Form method="post" action="/logout">
                    <button type="submit" className="text-sm border-2 border-black px-3 py-1">
                        Logout
                    </button>
                </Form>
            </div>
        </div>
    );
}