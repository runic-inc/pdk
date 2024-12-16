import * as React from 'react';

const IconClothing: React.FC<React.SVGProps<SVGElement>> = (props) => (
    <svg
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 640 512'
        className={props.className}
    >
        <path d='M172.6 0h-6.1L162 4l-20.5 18.2-72 64-53.8 47.9-12 10.6 10.6 12L110 264.3l10.6 12 12-10.6 27.4-24.4V512h320V241.3l27.3 24.3 12 10.6 10.6-12 95.7-107.6 10.6-12-12-10.6-53.7-47.8-72-64L478 4l-4.5-4H172.6m79.5 32h135.8C378 60 351.3 80 320 80s-58-20-67.9-48m-86.7 161.7-.2.2-41.9 37.2-74.4-83.8 41.9-37.2 72-64L178.7 32h40.1c10.8 45.9 52 80 101.2 80s90.4-34.1 101.2-80h40.1l15.9 14.1 72 64 41.9 37.2-74.4 83.7-41.9-37.2-.2-.1L448 170v310H192V170.1l-26.6 23.7z'></path>
    </svg>
);

export default React.memo(IconClothing);
