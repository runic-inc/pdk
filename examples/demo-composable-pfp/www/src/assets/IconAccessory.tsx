import * as React from 'react';

const IconAccessory: React.FC<React.SVGProps<SVGElement>> = (props) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		viewBox='0 0 578 512'
		className={props.className}
	>
		<path d='m67.7 32.5 14.5 2.6 72.7 13.2 15.7 2.9-5.7 31.5-15.7-2.9L91 69.2 44.5 243.4c24.2-22 56.3-35.4 91.5-35.4 55.1 0 102.6 32.8 124 80h56.1c21.3-47.2 68.8-80 124-80 35.3 0 67.4 13.4 91.5 35.4L485 69.2l-58.1 10.5-15.7 2.9-5.7-31.5 15.7-2.9L493.9 35l14.5-2.6 3.8 14.2 63.3 237.2.5 2v58.1c0 75.1-60.9 136-136 136s-136-60.9-136-136q0-12.3 2.1-24h-36.2q2.1 11.7 2.1 24c0 75.1-60.9 136-136 136S0 419.1 0 344v-58.1l.5-2L63.9 46.7zM544 344a104 104 0 1 0-208 0 104 104 0 1 0 208 0M136 448a104 104 0 1 0 0-208 104 104 0 1 0 0 208'></path>
	</svg>
);

export default React.memo(IconAccessory);
