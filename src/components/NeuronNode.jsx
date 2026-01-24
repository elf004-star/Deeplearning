import React from 'react';
import { useStore } from '../store/useStore';

const Port = ({ type, nodeId, isInput }) => {
    // Port logic will be handled by parent or here?
    // For connection dragging, we need a handler on the port.
    // We'll add class "port" and data attributes for the interaction handler in App.
    // Style:
    const style = {
        width: '16px',
        height: '16px',
        backgroundColor: isInput ? 'var(--color-secondary)' : 'var(--color-primary)',
        border: '2px solid black',
        borderRadius: '50%',
        position: 'absolute',
        top: '50%',
        [isInput ? 'left' : 'right']: '-10px', // Hang off the edge
        transform: 'translateY(-50%)',
        cursor: 'crosshair',
        zIndex: 20,
    };

    return (
        <div
            className="port"
            data-node-id={nodeId}
            data-port-type={isInput ? 'input' : 'output'}
            style={style}
            title={isInput ? 'Input' : 'Output'}
        />
    );
};

export const NeuronNode = ({ node }) => {
    const updateNodeData = useStore((state) => state.updateNodeData);
    const { k, b } = node.data;

    const handleChange = (key, value) => {
        updateNodeData(node.id, { [key]: parseFloat(value) || 0 });
    };

    const increment = (key, step = 0.1) => {
        const currentValue = node.data[key] || 0;
        updateNodeData(node.id, { [key]: parseFloat((currentValue + step).toFixed(2)) });
    };

    const decrement = (key, step = 0.1) => {
        const currentValue = node.data[key] || 0;
        updateNodeData(node.id, { [key]: parseFloat((currentValue - step).toFixed(2)) });
    };

    return (
        <div style={{ position: 'relative', textAlign: 'center' }}>
            {/* Input Port */}
            <Port nodeId={node.id} isInput={true} />

            {/* Visual: Black Circle */}
            <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: 'black',
                borderRadius: '50%',
                margin: '0 auto 10px',
                border: '2px solid black'
            }} />

            {/* Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* K Parameter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', minWidth: '15px' }}>k:</label>
                    <button
                        className="btn-decrement"
                        onClick={(e) => { e.stopPropagation(); decrement('k'); }}
                        title="Decrease k"
                    >
                        ↓
                    </button>
                    <input
                        type="number"
                        step="0.1"
                        value={k}
                        onChange={(e) => handleChange('k', e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        style={{ width: '60px', border: '2px solid black', borderRadius: '4px', padding: '4px', textAlign: 'center' }}
                    />
                    <button
                        className="btn-increment"
                        onClick={(e) => { e.stopPropagation(); increment('k'); }}
                        title="Increase k"
                    >
                        ↑
                    </button>
                </div>

                {/* B Parameter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', minWidth: '15px' }}>b:</label>
                    <button
                        className="btn-decrement"
                        onClick={(e) => { e.stopPropagation(); decrement('b'); }}
                        title="Decrease b"
                    >
                        ↓
                    </button>
                    <input
                        type="number"
                        step="0.1"
                        value={b}
                        onChange={(e) => handleChange('b', e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        style={{ width: '60px', border: '2px solid black', borderRadius: '4px', padding: '4px', textAlign: 'center' }}
                    />
                    <button
                        className="btn-increment"
                        onClick={(e) => { e.stopPropagation(); increment('b'); }}
                        title="Increase b"
                    >
                        ↑
                    </button>
                </div>
            </div>

            {/* Output Port */}
            <Port nodeId={node.id} isInput={false} />
        </div>
    );
};
