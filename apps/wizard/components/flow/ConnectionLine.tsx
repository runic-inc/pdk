import { ConnectionLineComponentProps, Position, getSmoothStepPath } from 'reactflow';


const ConnectionLine = ({ fromX, fromY, toX, toY, fromHandle }: ConnectionLineComponentProps) => {
    const [path] = getSmoothStepPath({
        sourceX: fromX,
        sourceY: fromY,
        sourcePosition: fromHandle?.position,
        targetX: toX,
        targetY: toY,
        targetPosition: fromHandle?.position == Position.Left ? Position.Right : Position.Left,
        borderRadius: 32,
        offset: 40,
    });

    const rectSize = 40;
    const pxTweak = fromHandle?.position == Position.Left ? 4 : 0;

    return (
        <g>
            <path
                fill="none"
                stroke="#000"
                strokeWidth={1.25}
                className="animated"
                d={path}
            />
            <rect
                width={rectSize}
                height={rectSize}
                x={toX - pxTweak - rectSize / 2}
                y={toY - 2.15 - rectSize / 2}
                rx={6}
                fill="#0000"
                stroke="#000"
                strokeWidth={1.25}
            />
        </g>
    );
};

export default ConnectionLine;
