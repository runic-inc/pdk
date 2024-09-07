import { Input } from '../primitives/input';
import { Label } from '../primitives/label';
import { Switch } from '../primitives/switch';
import useStore, { Store } from '../store';

const ScopeEditor = () => {
    const { scopeConfig, updateScopeConfig, setEditor } = useStore();
    const scopeName = useStore((state: Store) =>
        state.scopeConfig.name
            .replace(/[^a-zA-Z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .toLowerCase(),
    );

    const checkInvalidChar = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!/[0-9a-zA-Z]/.test(e.key)) {
            //e.preventDefault();
        }
    };

    const handleSetName = (name: string) => {
        updateScopeConfig({
            ...scopeConfig,
            name,
        });
    };

    const handleToggle = (key: string, value: boolean) => {
        updateScopeConfig({
            ...scopeConfig,
            [key]: value,
        });
    };

    return (
        <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-4'>
                <div>
                    <Label htmlFor='scopeName'>Project name</Label>
                    <Input
                        name='scopeName'
                        id='scopeName'
                        defaultValue={scopeConfig.name}
                        onKeyDown={checkInvalidChar}
                        onChange={(e) => handleSetName(e.target.value)}
                        placeholder='Scope name'
                    />
                    <div data-description className='rounded text-sm text-muted-foreground bg-muted mt-3 p-3'>
                        <p className='text-foreground mb-2'>
                            Your Scope name will be <b>{scopeName}</b>
                        </p>
                        <p>Scopes are Patchwork namespaces for organizing and configuring your app within the protocol.</p>
                    </div>
                </div>
            </div>

            <div className='flex flex-col gap-4'>
                <h3 className='font-medium -mx-6 text-[14px] border-b border-muted-foreground/50 dottedd px-6 py-3 bg-background sticky top-0 z-[1]'>
                    App permissions
                </h3>

                <div>
                    <Label htmlFor='scopeName'>Additional Operators</Label>
                    <Input name='scopeName' id='scopeName' placeholder='0x...' />
                    <p data-description className='mt-2 text-sm text-muted-foreground'>
                        Accounts that are permitted to make protocol state changes on behalf of your app. We'll automatically add your Assignee and Patch
                        contracts as Operators.
                    </p>
                </div>

                <div>
                    <Label htmlFor='scopeName'>Bankers</Label>
                    <Input name='scopeName' id='scopeName' placeholder='0x...' />
                    <p data-description className='mt-2 text-sm text-muted-foreground'>
                        Accounts that are allowed to withdraw funds from your app's mint fee collector
                    </p>
                </div>
            </div>

            <div className='flex flex-col gap-4'>
                <h3 className='font-medium -mx-6 text-[14px] border-b border-muted-foreground/50 dottedd px-6 py-3 bg-background sticky top-0 z-[1]'>
                    App rules
                </h3>

                <div className='grid grid-cols-[1fr_min-content] gap-x-4'>
                    <Label htmlFor='scopeName' className='grow'>
                        Require whitelist
                    </Label>
                    <div className='row-span-2'>
                        <Switch defaultChecked={scopeConfig.whitelist} onCheckedChange={(v) => handleToggle('whitelist', v)} />
                    </div>
                    <p data-description className='text-sm text-muted-foreground'>
                        Requires any contract that claims to be part of your app to be whitelisted. Prevents spoofing when enabled, but can be disabled when
                        spoofing isn't a concern.
                    </p>
                </div>

                <div className='grid grid-cols-[1fr_min-content] gap-x-4'>
                    <Label htmlFor='scopeName' className='grow'>
                        Allow user assign
                    </Label>
                    <div className='row-span-2'>
                        <Switch defaultChecked={scopeConfig.userAssign} onCheckedChange={(v) => handleToggle('userAssign', v)} />
                    </div>
                    <p data-description className='text-sm text-muted-foreground'>
                        Allows accounts to directly make protocol calls to trigger assignments & unassignments. Usually you'll leave this unchecked and handle
                        assignment logic in your contracts.
                    </p>
                </div>

                <div className='grid grid-cols-[1fr_min-content] gap-x-4'>
                    <Label htmlFor='scopeName' className='grow'>
                        Allow user patch
                    </Label>
                    <div className='row-span-2'>
                        <Switch defaultChecked={scopeConfig.userPatch} onCheckedChange={(v) => handleToggle('userPatch', v)} />
                    </div>
                    <p data-description className='text-sm text-muted-foreground'>
                        Allows accounts to directly make protocol calls to mint Patches. Usually you'll leave this unchecked and handle Patching logic in your
                        contracts.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ScopeEditor;
