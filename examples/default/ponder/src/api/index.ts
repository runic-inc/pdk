import { ponder } from "@/generated";
import { trpcServer } from "@hono/trpc-server";
import { api } from "../generated/api";
import { router } from "../generated/trpc";

const appRouter = router({
    ...api,
});

export type AppRouter = typeof appRouter;

ponder.use(
    "/trpc/*",
    trpcServer({
        router: appRouter,
        createContext: (_, c) => c.var,
    }),
);
