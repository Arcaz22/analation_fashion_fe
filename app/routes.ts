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
    route("catalog/new", "routes/new-item.tsx"),
    route("catalog/:itemId", "routes/item-detail.tsx"),
    route("onboarding", "routes/onboarding.tsx"),
    route("profile", "routes/profile.tsx"),
    route("profile/skin-tone", "routes/profile-skin-tone.tsx"),
    route("profile/body-shape", "routes/profile-body-shape.tsx"),
    route("recommendations", "routes/recommendations.tsx"),
    route(
      "recommendations/history/:historyId",
      "routes/recommendation-history-detail.tsx"
    ),
  ]),
] satisfies RouteConfig;
