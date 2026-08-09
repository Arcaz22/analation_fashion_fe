import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  layout("routes/auth.tsx", [
    route("login", "routes/login.tsx"),
    route("register", "routes/register.tsx"),
  ]),
  layout("routes/app.tsx", [
    route("catalog", "routes/catalog.tsx"),
    route("onboarding", "routes/onboarding.tsx"),
  ]),
] satisfies RouteConfig;
