import * as React from 'react';

const IconExpression: React.FC<React.SVGProps<SVGElement>> = (props) => (
    <svg
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 512 512'
        className={props.className}
    >
        <path d='M480 256a224 224 0 1 0-448 0 224 224 0 1 0 448 0M0 256a256 256 0 1 1 512 0 256 256 0 1 1-512 0m129.7 71.2 28.6-14.3c8.7 17.5 41.3 55.2 97.7 55.2s88.9-37.7 97.7-55.2l28.6 14.3C369.7 352.3 327.6 400 256 400s-113.7-47.7-126.3-72.8M152.4 208a24 24 0 1 1 48 0 24 24 0 1 1-48 0m184-24a24 24 0 1 1 0 48 24 24 0 1 1 0-48'></path>
    </svg>
);

export default React.memo(IconExpression);
