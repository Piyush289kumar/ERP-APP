import { Button } from "~/components/ui/button";

import type { Route } from "./+types/home";
import { useNavigate } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-svh flex-col items-center justify-center">
      <Button onClick={() => navigate("/sign-in")}>Click me</Button>
    </div>
  );
}
