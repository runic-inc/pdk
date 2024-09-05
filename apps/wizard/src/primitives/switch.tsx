import * as SwitchPrimitives from '@radix-ui/react-switch';
import * as React from 'react';

import { cn } from '../lib/utils';

const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitives.Root>, React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>>(
    ({ className, ...props }, ref) => (
        <SwitchPrimitives.Root
            className={cn(
                'peer inline-flex h-4 w-7 shrink-0 cursor-pointer items-center rounded-full ring-1 ring-primary border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input/0',
                className,
            )}
            {...props}
            ref={ref}
        >
            <SwitchPrimitives.Thumb
                className={cn(
                    'pointer-events-none block h-3 w-3 rounded-full data-[state=unchecked]:bg-primary ring-0 bg-background shadow-lg transition-transform data-[state=checked]:translate-x-3 data-[state=unchecked]:translate-x-0',
                )}
            />
        </SwitchPrimitives.Root>
    ),
);
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
