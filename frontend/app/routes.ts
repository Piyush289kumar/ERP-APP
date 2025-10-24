import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"), // Home Route
    route("sign-up", "signup/page.tsx"), // /signup
    route("sign-in", "signin/page.tsx"), // /signup

] satisfies RouteConfig;
