import { type RouteConfig, index, route, prefix } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("/products", "routes/products.tsx"),
    route("/products/:id", "routes/productView.tsx"),
    route("/admin", "routes/admin.tsx"),
    ...prefix("/admin/products", [
        index("routes/adminProducts.tsx"),
        route(":id", "routes/adminProductEdit.tsx"),
    ]),
] satisfies RouteConfig;