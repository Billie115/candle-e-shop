import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [reactRouter()],
    ssr: {
        external: ["@prisma/client", ".prisma/client"],
    },
    optimizeDeps: {
        exclude: ["@prisma/client"],
    },
});