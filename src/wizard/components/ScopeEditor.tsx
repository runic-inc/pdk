import useStore from '../store';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../primitives/dialog';
import Icon from '../primitives/icon';
import { Label } from '../primitives/label';
import { Input } from '../primitives/input';
import { Button } from '../primitives/button';
import { useState } from 'react';

const ScopeEditor = () => {
    const { scopeConfig, updateScopeConfig } = useStore();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState(scopeConfig.name);

    const checkInvalidChar = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!/[0-9a-zA-Z]/.test(e.key)) {
            e.preventDefault();
        }
    };

    const handleSave = () => {
        updateScopeConfig({
            ...scopeConfig,
            name,
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className='h-full space-x-2'>
                <span>{scopeConfig.name}</span>
                <Icon icon='fa-gear' className='opacity-40' />
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Configure your app</DialogTitle>
                </DialogHeader>
                <DialogDescription className='hidden'>
                    Scopes are application-level Patchwork namespaces for configuring settings and permissions or your app.
                </DialogDescription>
                <div className='flex flex-col gap-4'>
                    <div>
                        <Label htmlFor='scopeName'>Scope name</Label>
                        <Input
                            name='scopeName'
                            id='scopeName'
                            defaultValue={scopeConfig.name}
                            onKeyDown={checkInvalidChar}
                            onChange={(e) => setName(e.target.value)}
                            placeholder='Scope name'
                        />
                        <p data-description className='mt-2 text-sm text-muted-foreground'>
                            Scopes are application-level Patchwork namespaces for configuring settings and permissions or your app.
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        type='submit'
                        onClick={() => {
                            handleSave();
                            setOpen(false);
                        }}
                    >
                        Save changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ScopeEditor;
