import * as React from 'react';

const IconBody: React.FC<React.SVGProps<SVGElement>> = (props) => (
    <svg
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 448 512'
        className={props.className}
    >
        <path d='M320 128a96 96 0 1 0-192 0 96 96 0 1 0 192 0m-224 0a128 128 0 1 1 256 0 128 128 0 1 1-256 0M43.3 480h361.3l-44.2-144H87.6zM64 304h320l54.2 176 9.8 32H0l9.8-32z'></path>
    </svg>
);

export default React.memo(IconBody);
