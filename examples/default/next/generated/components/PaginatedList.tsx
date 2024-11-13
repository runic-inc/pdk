import { TRPCClientErrorLike } from '@trpc/client';
import { UseTRPCQueryResult } from '@trpc/react-query/shared';
import React, { useState } from 'react';
import { AppRouter } from '../../../ponder/src/api'; // Adjust this import path

interface PaginatedItem {
    id: string;
    [key: string]: any;
}

type PaginatedData<T extends PaginatedItem> = {
    items: T[];
    nextTimestamp?: number;
};

interface PaginatedListProps<T extends PaginatedItem> {
    useQueryHook: (
        input: {
            limit?: number;
            lastTimestamp?: number;
        },
        options?: any
    ) => UseTRPCQueryResult<PaginatedData<T>, TRPCClientErrorLike<AppRouter>>;
    itemsPerPage?: number;
    renderItem: (item: T) => React.ReactNode;
    title: string;
}

function PaginatedList<T extends PaginatedItem>({
    useQueryHook,
    itemsPerPage = 10,
    renderItem,
    title,
}: PaginatedListProps<T>): React.ReactElement {
    const [lastTimestamp, setLastTimestamp] = useState<number | undefined>(undefined);

    const { data, isLoading, error, refetch } = useQueryHook(
        {
            limit: itemsPerPage,
            lastTimestamp,
        },
        {
            // You can add additional options here if needed
        }
    );

    const handleNextPage = () => {
        if (data?.nextTimestamp) {
            setLastTimestamp(data.nextTimestamp);
        }
    };

    const handlePreviousPage = () => {
        // Implement logic to go to the previous page
        // This might require keeping track of previous timestamps
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div>
            <h2>{title}</h2>
            {data?.items.map(renderItem)}
            <div>
                <button onClick={handlePreviousPage} disabled={!lastTimestamp}>
                    Previous Page
                </button>
                <button onClick={handleNextPage} disabled={!data?.nextTimestamp}>
                    Next Page
                </button>
            </div>
        </div>
    );
}

export default PaginatedList;