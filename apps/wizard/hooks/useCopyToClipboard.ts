import { useCallback, useState } from 'react';

type CopiedValue = string | null;
type CopyFn = (text: string) => Promise<boolean>;
type useCopyToClipboardProps = {
    timeout?: number;
};

const useCopyToClipboard = (props?: useCopyToClipboardProps): [CopiedValue, CopyFn, boolean] => {
    const [copiedText, setCopiedText] = useState<CopiedValue>(null);
    const [wasCopied, setWasCopied] = useState<boolean>(false);
    const timeout = props?.timeout || 2000;

    const copy: CopyFn = useCallback(async (text) => {
        if (!navigator?.clipboard) {
            console.warn('Clipboard not supported');
            return false;
        }

        try {
            await navigator.clipboard.writeText(text);
            setCopiedText(text);
            setWasCopied(true);
            setTimeout(() => {
                setWasCopied(false);
            }, timeout);
            return true;
        } catch (error) {
            console.warn('Copy failed', error);
            setCopiedText(null);
            return false;
        }
    }, []);

    return [copiedText, copy, wasCopied];
};

export default useCopyToClipboard;
