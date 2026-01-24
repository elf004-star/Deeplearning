import React, { useRef } from 'react';
import { useStore } from '../store/useStore';

export const ConnectionLine = ({ connection, fromNode, toNode }) => {
    // Calculate path
    const startX = fromNode.x + 210; // Width 200 + 10 padding/margin
    const startY = fromNode.y + 75; // Approx half height

    const endX = toNode.x - 10;
    const endY = toNode.y + 75;

    // Bezier Control Points
    const dist = Math.abs(endX - startX) * 0.5;
    const cp1x = startX + dist;
    const cp1y = startY;
    const cp2x = endX - dist;
    const cp2y = endY;

    const path = `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;

    // Midpoint for Weight Label
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;

    const updateWeight = useStore(state => state.updateConnectionWeight);
    const removeConnection = useStore(state => state.removeConnection);

    const handleDoubleClick = (e) => {
        e.stopPropagation();
        if (window.confirm('确定要删除这条连接线吗？\nAre you sure you want to delete this connection?')) {
            removeConnection(connection.id);
        }
    };

    const increment = () => {
        updateWeight(connection.id, parseFloat((connection.weight + 0.1).toFixed(2)));
    };

    const decrement = () => {
        updateWeight(connection.id, parseFloat((connection.weight - 0.1).toFixed(2)));
    };

    return (
        <g>
            <path
                d={path}
                stroke="black"
                strokeWidth="3"
                fill="none"
                markerEnd="url(#arrowhead)"
                onDoubleClick={handleDoubleClick}
                style={{ cursor: 'pointer' }}
            />

            {/* Interactive Thick Invisible Path for easier clicking */}
            <path
                d={path}
                stroke="transparent"
                strokeWidth="15"
                fill="none"
                onDoubleClick={handleDoubleClick}
                style={{ cursor: 'pointer' }}
            />

            {/* Weight Control Group */}
            <foreignObject x={midX - 75} y={midY - 20} width="150" height="40" style={{ overflow: 'visible', pointerEvents: 'auto' }}>
                <div
                    className="hover-scale"
                    onClick={(e) => e.stopPropagation()}
                    onDoubleClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        background: 'white',
                        padding: '4px',
                        borderRadius: '8px',
                        border: '2px solid black',
                        boxShadow: 'var(--box-shadow)',
                        width: 'fit-content',
                        margin: '0 auto',
                        pointerEvents: 'auto'
                    }}
                >
                    <button
                        className="btn-decrement"
                        onClick={(e) => { e.stopPropagation(); decrement(); }}
                        onMouseDown={(e) => e.stopPropagation()}
                        title="Decrease weight"
                        style={{ width: '24px', height: '24px', fontSize: '14px' }}
                    >
                        ↓
                    </button>
                    <input
                        type="number"
                        step="0.1"
                        value={connection.weight}
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        onChange={(e) => updateWeight(connection.id, parseFloat(e.target.value) || 0)}
                        style={{
                            width: '50px',
                            height: '24px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            textAlign: 'center',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            padding: '2px'
                        }}
                    />
                    <button
                        className="btn-increment"
                        onClick={(e) => { e.stopPropagation(); increment(); }}
                        onMouseDown={(e) => e.stopPropagation()}
                        title="Increase weight"
                        style={{ width: '24px', height: '24px', fontSize: '14px' }}
                    >
                        ↑
                    </button>
                </div>
            </foreignObject>
        </g>
    );
};
