import { useLoaderData, useFetcher, Link } from "react-router";
import db from "~/db.server";

export async function loader() {
    const products = await db.product.findMany();
    return { products };
}

export async function action({ request }: { request: Request }) {
    const formData = await request.formData();
    const id = Number(formData.get("id"));
    const visible = formData.get("visible") === "true";

    await db.product.update({
        where: { id },
        data: { visible: !visible },
    });

    return null;
}

export default function AdminProducts() {
    const { products } = useLoaderData<typeof loader>();
    const fetcher = useFetcher();

    return (
        <div className="flex h-screen">

            <div className="flex flex-col w-48">
                <div className="border-2 border-black m-1 p-2">
                    <h1 className="text-xl">Products</h1>
                </div>
                <div className="flex-1"></div>
                <Link to="/admin">
                    <div className="border-2 border-black m-1 p-2">
                        <h1 className="text-xl">← Back</h1>
                    </div>
                </Link>
            </div>
            <div className="p-4 grid grid-cols-3 gap-3 flex-1 overflow-y-auto content-start">
                {products.map((product) => (
                    <div key={product.id} className="border-2 border-black p-2 flex flex-col gap-1">
                        <Link to={`/admin/products/${product.id}`}>
                            <img
                                src={product.imageUrl}
                                alt={product.title}
                                className="w-full h-40 object-cover border-2 border-black"
                            />
                            <h1 className="text-base font-bold">{product.title}</h1>
                            <p className="text-xs text-gray-600">{product.description}</p>
                            <p className="text-sm">${product.price}</p>
                        </Link>

                        <fetcher.Form method="post">
                            <input type="hidden" name="id" value={product.id} />
                            <input type="hidden" name="visible" value={String(product.visible)} />
                            <button
                                type="submit"
                                className={`border-2 border-black p-1 w-full text-sm text-white ${
                                    product.visible ? "bg-green-500" : "bg-red-500"
                                }`}
                            >
                                {product.visible ? "Visible" : "Hidden"}
                            </button>
                        </fetcher.Form>
                    </div>
                ))}
            </div>

        </div>
    );
}