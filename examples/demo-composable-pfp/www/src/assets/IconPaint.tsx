import * as React from 'react';

const IconPaint: React.FC<React.SVGProps<SVGElement>> = (props) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		viewBox='0 0 384 512'
		className={props.className}
	>
		<path d='M128 384H0V0h384v384H256v128H128V384m0-32h32v128h64V352h128v-64H32v64zm224-96V32H224v96h-32V32h-64v128H96V32H32v224z'></path>
	</svg>
);

export default React.memo(IconPaint);
