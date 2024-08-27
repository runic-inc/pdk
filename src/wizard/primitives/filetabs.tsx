import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as React from 'react';

import { cn } from '@wizard/lib/utils';

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<React.ElementRef<typeof TabsPrimitive.List>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>>(
    ({ className, ...props }, ref) => (
        <TabsPrimitive.List
            ref={ref}
            className={cn('flex sticky top-0 -mb-[1px] w-full items-stretch justify-start text-muted-foreground', className)}
            {...props}
        />
    ),
);
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>>(
    ({ className, ...props }, ref) => (
        <TabsPrimitive.Trigger
            ref={ref}
            className={cn(
                'inline-flex items-center dotted justify-center rounded-t whitespace-nowrap px-6 py-3 text-muted-foreground text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-muted-border border-b-border data-[state=active]:text-foreground data-[state=active]:!border-b-transparent mr-1 data-[state=active]:border-border bg-muted data-[state=active]:bg-background data-[state=active]:bg-none',
                className,
            )}
            {...props}
        />
    ),
);
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Content>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>>(
    ({ className, ...props }, ref) => (
        <TabsPrimitive.Content
            ref={ref}
            className={cn(
                'min-h-0 min-w-0 ring-offset-background focus-visible:outline-none shadow-lg focus-visible:ring-2 rounded border-border bg-background border focus-visible:ring-ring focus-visible:ring-offset-2',
                className,
            )}
            {...props}
        />
    ),
);
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsContent, TabsList, TabsTrigger };
