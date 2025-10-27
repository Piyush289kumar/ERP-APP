import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"), // Home Route

    // Public routes (only for logged-out users)
    route("sign-up", "routes/public/sign-up-wrapper.tsx"),
    route("sign-in", "routes/public/sign-in-wrapper.tsx"),

    // Admin routes with AdminLayout wrapper
    route("admin", "admin/layout.tsx", [
        route("dashboard", "routes/protected/dashboard-wrapper.tsx"),
        route("users/profile", "routes/protected/user-wrapper.tsx"),
    ]),



] satisfies RouteConfig;
