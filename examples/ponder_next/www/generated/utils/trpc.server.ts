"use server";

import { createTRPCClient, httpBatchLink } from "@trpc/client";
// import { createTRPCQueryUtils } from '@trpc/react-query';
import { createServerSideHelpers } from "@trpc/react-query/server";
import { cache } from "react";
import superjson from "superjson";
import type { AppRouter } from "../../../ponder/src/api";
import { makeQueryClient } from "./queryclient";

export const getQueryClient = cache(makeQueryClient);

const client = createTRPCClient<AppRouter>({
	links: [
		httpBatchLink({
			transformer: superjson,
			url: `${process.env.SYNC_URL}/trpc`,
		}),
	],
});

const helpers = createServerSideHelpers<AppRouter>({
	client,
	queryClient: getQueryClient(),
});

export { helpers as trpc };
