import * as React from 'react';
import { Input } from './input';
import { Label } from './label';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@wizard/lib/utils';

const inputSetVariants = cva(
    'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
    {
        variants: {
            layout: {
                default: 'flex flex-col gap-1 items-start',
                horizontal: '',
            },
        },
        defaultVariants: {
            layout: 'default',
        },
    },
);

interface InputSetProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof inputSetVariants> {}

const InputSet = React.forwardRef<HTMLDivElement, InputSetProps>(({ className, layout, ...props }, ref) => {
    return (
        <div className={cn(inputSetVariants({ layout, className }))} ref={ref} {...props}>
            <Label htmlFor=''>Scope name</Label>
            <Input name='' id='' defaultValue={''} onChange={() => {}} placeholder='' />
            <p data-description className='mt-2 text-sm text-muted-foreground min-w-0 max-w-full whitespace-normal'>
                Scopes are application-level Patchwork namespaces for configuring settings and permissions or your app.
            </p>
        </div>
    );
});

export { InputSet };
