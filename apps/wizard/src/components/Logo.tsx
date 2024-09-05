import type { SVGProps } from 'react';
import useStore from '../store';
const Icon = (props: SVGProps<SVGSVGElement>) => {
    const { setEditor, scopeConfig } = useStore();
    function set() {
        setEditor(scopeConfig.name);
    }

    return (
    <svg xmlns='http://www.w3.org/2000/svg' width={54} height={72} viewBox='0 0 54 72' onClick={() => set()} fill='none' {...props}>
        <path fill='currentColor' d='M12 0v30H0v42h42V42h12V0zm18 60H12V30h12V12h18v30H30z' />
    </svg>
)};
export default Icon;
