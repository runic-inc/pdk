import { RefObject, useRef } from 'react';
import { motion, useMotionValue } from 'motion/react';
import { Trait } from '#/assets/traits';

interface TraitImageProps {
	item: Trait;
	onDragEnd: (id: number) => void;
	onPositionUpdate: (id: number, isOverDropZone: boolean) => void;
	dropZoneRef: RefObject<HTMLDivElement>;
	containerRef: RefObject<HTMLDivElement>;
}

function isPointInDrop(
	point: { x: number; y: number },
	drop: DOMRect
): boolean {
	const circleCenter = {
		x: drop.left + drop.width / 2,
		y: drop.top + drop.height / 2,
	};
	const distance = Math.sqrt(
		Math.pow(point.x - circleCenter.x, 2) +
			Math.pow(point.y - circleCenter.y, 2)
	);
	const radius = drop.width / 2;
	return distance <= radius;
}

export function TraitImage({
	item,
	onDragEnd,
	onPositionUpdate,
	dropZoneRef,
	containerRef,
}: TraitImageProps) {
	const elementRef = useRef<HTMLDivElement>(null);
	const x = useMotionValue(Math.random() * (window.innerWidth - 112) + 28);
	const y = useMotionValue(Math.random() * (window.innerHeight - 112) + 28);
	const r = useMotionValue(`${30 - Math.random() * 60}deg`);

	const handleDrag = (event: React.PointerEvent<HTMLDivElement>) => {
		if (!dropZoneRef.current) return;

		const dropRect = dropZoneRef.current.getBoundingClientRect();

		const mousePoint = { x: event.clientX, y: event.clientY };
		const isIntersecting = isPointInDrop(mousePoint, dropRect);

		onPositionUpdate(item.id, isIntersecting);
	};

	const imgUrl = new URL(`../../../assets/${item.image}`, import.meta.url)
		.href;

	return (
		<motion.div
			ref={elementRef}
			drag
			dragMomentum={true}
			dragConstraints={containerRef}
			onDragEnd={() => onDragEnd(item.id)}
			onPointerMove={handleDrag}
			className='w-14 bg-white group aspect-square shadow-lg shadow-gray-950/10 top-0 left-0 rounded-xl border border-black cursor-grab active:cursor-grabbing absolute'
			whileHover={{
				scale: 1.15,
				transition: {
					type: 'spring',
					bounce: 0.6,
					duration: 0.5,
				},
			}}
			whileDrag={{ scale: 0.95 }}
			style={{
				x,
				y,
				rotate: r,
			}}
			transition={{
				type: 'spring',
				bounce: 1,
				damping: 10,
				duration: 0.1,
			}}
		>
			<img src={imgUrl} className='pointer-events-none' />
			<div className='bg-black pointer-events-none transition-all scale-75 group-hover:opacity-100 group-hover:scale-100 opacity-0 text-[10px] font-medium text-white px-1.5 py-0.5 whitespace-nowrap rounded-md absolute top-full mt-1 left-1/2 -translate-x-1/2'>
				{item.name}
			</div>
		</motion.div>
	);
}
