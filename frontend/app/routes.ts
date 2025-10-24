import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"), // Home Route
    route("signup", "signup/page.tsx"), // /signup

] satisfies RouteConfig;
