import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"), // Home Route

    // Public routes (only for logged-out users)
    layout("routes/public/authLayout.tsx", [
        route("sign-up", "routes/public/sign-up-wrapper.tsx"),
        route("sign-in", "routes/public/sign-in-wrapper.tsx"),
    ]),

    // Admin routes with AdminLayout wrapper
    route("admin", "admin/layout.tsx", [

        // Dashboard Route.
        route("dashboard", "routes/protected/dashboard-wrapper.tsx"),


        // Category Routes
        layout("routes/protected/ProtectedLayout.tsx", [
            route("category", "features/category/index.tsx"),
            // ✅ Create Wrapper (unique file)
            route("category/create", "features/category/create-wrapper.tsx"),
            // ✅ Edit Wrapper (unique file)
            route("category/edit/:id", "features/category/edit-wrapper.tsx"),
        ]),

        // User Routes
        route("users/profile", "routes/protected/user-wrapper.tsx"),
    ]),



] satisfies RouteConfig;
