import React from 'react';
import { useStore } from '../store/useStore';

export const InputNode = ({ node }) => {
    // Only Output Port
    const { label } = node.data;

    return (
        <div style={{ position: 'relative', textAlign: 'center', padding: '10px' }}>
            <div style={{
                fontSize: '24px',
                fontWeight: '900',
                color: 'var(--color-primary)',
                marginBottom: '5px'
            }}>
                {label}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Input Node</div>

            {/* Output Port */}
            <div
                className="port"
                data-node-id={node.id}
                data-port-type="output"
                style={{
                    width: '16px',
                    height: '16px',
                    backgroundColor: 'var(--color-primary)',
                    border: '2px solid black',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: '50%',
                    right: '-18px', // Compensate for wrapper padding
                    transform: 'translateY(-50%)',
                    cursor: 'crosshair',
                    zIndex: 20
                }}
            />
        </div>
    );
};

export const OutputNode = ({ node }) => {
    const updateNodeData = useStore((state) => state.updateNodeData);
    const { b } = node.data;

    const increment = (step = 0.1) => {
        const currentValue = node.data.b || 0;
        updateNodeData(node.id, { b: parseFloat((currentValue + step).toFixed(2)) });
    };

    const decrement = (step = 0.1) => {
        const currentValue = node.data.b || 0;
        updateNodeData(node.id, { b: parseFloat((currentValue - step).toFixed(2)) });
    };

    return (
        <div style={{ position: 'relative', textAlign: 'center' }}>
            {/* Input Port */}
            <div
                className="port"
                data-node-id={node.id}
                data-port-type="input"
                style={{
                    width: '16px',
                    height: '16px',
                    backgroundColor: 'var(--color-secondary)',
                    border: '2px solid black',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: '50%',
                    left: '-18px',
                    transform: 'translateY(-50%)',
                    cursor: 'crosshair',
                    zIndex: 20
                }}
            />

            <div style={{
                width: '100%',
                height: '40px',
                border: '2px solid black',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#eee',
                marginBottom: '10px',
                fontWeight: 'bold'
            }}>
                OUTPUT
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', minWidth: '15px' }}>b:</label>
                <button
                    className="btn-decrement"
                    onClick={(e) => { e.stopPropagation(); decrement(); }}
                    title="Decrease b"
                >
                    ↓
                </button>
                <input
                    type="number"
                    step="0.1"
                    value={b}
                    onChange={(e) => updateNodeData(node.id, { b: parseFloat(e.target.value) || 0 })}
                    onClick={(e) => e.stopPropagation()}
                    style={{ width: '60px', border: '2px solid black', borderRadius: '4px', padding: '4px', textAlign: 'center' }}
                />
                <button
                    className="btn-increment"
                    onClick={(e) => { e.stopPropagation(); increment(); }}
                    title="Increase b"
                >
                    ↑
                </button>
            </div>
        </div>
    );
};
