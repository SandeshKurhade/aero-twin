import { Layout } from "@/components/Layout";
import { EngineSimulationProvider } from "@/hooks/useEngineSimulation";
import DashboardPage from "@/pages/DashboardPage";
import MissionPage from "@/pages/MissionPage";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

const rootRoute = createRootRoute({
  component: () => (
    <EngineSimulationProvider>
      <Layout />
    </EngineSimulationProvider>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardPage,
});

const missionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/mission",
  component: MissionPage,
});

const routeTree = rootRoute.addChildren([indexRoute, missionRoute]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
