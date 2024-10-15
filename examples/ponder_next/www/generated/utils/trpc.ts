import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../../../ponder/src/api';

export const trpc = createTRPCReact<AppRouter>();
