import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("/admin","routes/admin.tsx"),
    route("/admin/products", "routes/adminProducts.tsx"),
] satisfies RouteConfig;
