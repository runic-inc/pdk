import { defaultShouldDehydrateQuery, isServer, QueryClient } from '@tanstack/react-query';
import superjson from 'superjson';

let browserQueryClient: QueryClient;

export function getQueryClient() {
    if (isServer) {
        return makeQueryClient();
    }
    return (browserQueryClient ??= makeQueryClient());
}

export function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 5 * 1000,
            },
            dehydrate: {
                serializeData: superjson.serialize,
                shouldDehydrateQuery: (query) => defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
            },
            hydrate: {
                deserializeData: superjson.deserialize,
            },
        },
    });
}
