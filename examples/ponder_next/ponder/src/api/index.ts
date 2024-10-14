import { ponder } from '@/generated';
import { trpcServer } from '@hono/trpc-server';
import { graphql } from '@ponder/core';
import { z } from 'zod';
import { publicProcedure, router } from './trpc';

ponder.use('/graphql', graphql());
ponder.use('/', graphql());

const appRouter = router({
    helloWorld: publicProcedure.input(z.string()).query(async ({ input, ctx }) => {
        return { hello: 'world' };
    }),
});

ponder.use(
    '/trpc/*',
    trpcServer({
        router: appRouter,
        createContext: (_, c) => c.var,
    }),
);

export type AppRouter = typeof appRouter;
