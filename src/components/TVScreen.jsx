import React, { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

// Forward pass computation
const computeNetwork = (nodes, connections, inputValue) => {
    const nodeValues = {};

    // Initialize Inputs
    nodes.filter(n => n.type === 'INPUT').forEach((n, idx) => {
        if (n.data.label === 'x1') {
            nodeValues[n.id] = inputValue;
        } else {
            nodeValues[n.id] = 0;
        }
    });

    // Pull approach:
    const getValue = (nodeId, depth = 0) => {
        if (depth > 10) return 0; // Cycle protection
        if (nodeValues[nodeId] !== undefined) return nodeValues[nodeId];

        const node = nodes.find(n => n.id === nodeId);
        if (!node) return 0;

        if (node.type === 'INPUT') return 0; // Should be set already if x1

        // Sum inputs
        const incoming = connections.filter(c => c.toNodeId === nodeId);
        let sum = 0;
        incoming.forEach(conn => {
            sum += getValue(conn.fromNodeId, depth + 1) * conn.weight;
        });

        // Activation
        let result = sum;
        if (node.type === 'HIDDEN') {
            result = (node.data.k || 1) * sum + (node.data.b || 0);
        } else if (node.type === 'OUTPUT') {
            result = sum + (node.data.b || 0);
        } else if (node.type === 'TV') {
            result = sum; // TV nodes just pass through the sum
        }

        nodeValues[nodeId] = result;
        return result;
    }

    // Compute all outputs
    const outputs = {};
    nodes.filter(n => n.type === 'OUTPUT' || n.type === 'TV').forEach(n => {
        outputs[n.id] = getValue(n.id);
    });

    return outputs;
};

export const TVScreen = ({ node }) => {
    const { nodes, connections } = useStore();

    // Local state for view configuration
    const [config, setConfig] = React.useState({
        xMin: -10,
        xMax: 10,
        yMin: -10,
        yMax: 10,
        width: 300,
        height: 240
    });

    const [isResizing, setIsResizing] = React.useState(false);

    // Check if connected (has incoming connections)
    const isConnected = useMemo(() => {
        return connections.some(c => c.toNodeId === node.id);
    }, [connections, node.id]);

    // Generate data points
    const data = useMemo(() => {
        if (!isConnected) return [];

        const points = [];
        const step = (config.xMax - config.xMin) / 20; // 20 points resolution

        for (let x = config.xMin; x <= config.xMax; x += step) {
            const cleanX = Math.round(x * 100) / 100;
            const outputs = computeNetwork(nodes, connections, cleanX);
            const val = outputs[node.id];
            points.push({ x: cleanX, y: val });
        }
        return points;
    }, [nodes, connections, config.xMin, config.xMax, isConnected, node.id]);

    // Resize handlers
    const handleMouseDown = (e) => {
        e.stopPropagation();
        setIsResizing(true);
    };

    React.useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isResizing) return;
            setConfig(prev => ({
                ...prev,
                width: Math.max(200, prev.width + e.movementX),
                height: Math.max(150, prev.height + e.movementY)
            }));
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        if (isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    const adjustConfig = (key, delta) => {
        setConfig(prev => ({
            ...prev,
            [key]: prev[key] + delta
        }));
    };

    return (
        <div style={{
            background: '#2d3436',
            padding: '15px',
            borderRadius: '20px',
            border: '4px solid #636e72',
            boxShadow: 'inset 0 0 20px #000',
            width: `${config.width}px`,
            height: `${config.height}px`,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
        }}
            className="no-hover-scale"
        >
            {/* Left Input Port */}
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
                    top: '40%',
                    left: '-10px',
                    transform: 'translateY(-50%)',
                    cursor: 'crosshair',
                    zIndex: 20
                }}
            />

            {/* Right Input Port */}
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
                    top: '60%',
                    left: '-10px',
                    transform: 'translateY(-50%)',
                    cursor: 'crosshair',
                    zIndex: 20
                }}
            />

            {/* Antenna */}
            <div style={{ position: 'absolute', top: -10, left: '50%', width: 2, height: 20, background: '#636e72', transform: 'rotate(-15deg)' }}></div>
            <div style={{ position: 'absolute', top: -10, left: '50%', width: 2, height: 20, background: '#636e72', transform: 'rotate(15deg)' }}></div>

            {/* Screen */}
            <div style={{ flex: 1, background: '#dfe6e9', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                {isConnected ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#b2bec3" />
                            <XAxis
                                dataKey="x"
                                type="number"
                                domain={[config.xMin, config.xMax]}
                                tickCount={5}
                            />
                            <YAxis
                                domain={[config.yMin, config.yMax]}
                                allowDataOverflow={false}
                            />
                            <Line type="monotone" dataKey="y" stroke="var(--color-primary)" strokeWidth={3} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                        {/* Clean Axis View */}
                        <div style={{ position: 'absolute', bottom: '20px', left: '20px', width: '2px', height: 'calc(100% - 40px)', background: '#636e72' }}></div>
                        <div style={{ position: 'absolute', bottom: '20px', left: '20px', width: 'calc(100% - 40px)', height: '2px', background: '#636e72' }}></div>
                        <div style={{ position: 'absolute', bottom: '5px', right: '5px', color: '#636e72', fontSize: '12px' }}>x</div>
                        <div style={{ position: 'absolute', top: '5px', left: '25px', color: '#636e72', fontSize: '12px' }}>y</div>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#b2bec3', fontSize: '14px' }}>NO SIGNAL</div>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div
                onMouseDown={(e) => e.stopPropagation()}
                style={{ height: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}
            >
                {/* X Range */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', justifyContent: 'center' }}>
                    <span style={{ color: 'white', fontSize: '10px', minWidth: '12px' }}>X:</span>
                    <button className="btn-decrement" onClick={() => adjustConfig('xMin', -1)} style={{ width: '20px', height: '20px', fontSize: '12px' }}>↓</button>
                    <input
                        type="number"
                        value={config.xMin}
                        onChange={e => setConfig({ ...config, xMin: Number(e.target.value) })}
                        onClick={(e) => e.stopPropagation()}
                        style={{ width: '35px', fontSize: '9px', padding: '2px', borderRadius: '4px', textAlign: 'center', border: '1px solid #ccc' }}
                    />
                    <button className="btn-increment" onClick={() => adjustConfig('xMin', 1)} style={{ width: '20px', height: '20px', fontSize: '12px' }}>↑</button>
                    <span style={{ color: 'white', fontSize: '10px' }}>-</span>
                    <button className="btn-decrement" onClick={() => adjustConfig('xMax', -1)} style={{ width: '20px', height: '20px', fontSize: '12px' }}>↓</button>
                    <input
                        type="number"
                        value={config.xMax}
                        onChange={e => setConfig({ ...config, xMax: Number(e.target.value) })}
                        onClick={(e) => e.stopPropagation()}
                        style={{ width: '35px', fontSize: '9px', padding: '2px', borderRadius: '4px', textAlign: 'center', border: '1px solid #ccc' }}
                    />
                    <button className="btn-increment" onClick={() => adjustConfig('xMax', 1)} style={{ width: '20px', height: '20px', fontSize: '12px' }}>↑</button>
                </div>

                {/* Y Range */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', justifyContent: 'center' }}>
                    <span style={{ color: 'white', fontSize: '10px', minWidth: '12px' }}>Y:</span>
                    <button className="btn-decrement" onClick={() => adjustConfig('yMin', -1)} style={{ width: '20px', height: '20px', fontSize: '12px' }}>↓</button>
                    <input
                        type="number"
                        value={config.yMin}
                        onChange={e => setConfig({ ...config, yMin: Number(e.target.value) })}
                        onClick={(e) => e.stopPropagation()}
                        style={{ width: '35px', fontSize: '9px', padding: '2px', borderRadius: '4px', textAlign: 'center', border: '1px solid #ccc' }}
                    />
                    <button className="btn-increment" onClick={() => adjustConfig('yMin', 1)} style={{ width: '20px', height: '20px', fontSize: '12px' }}>↑</button>
                    <span style={{ color: 'white', fontSize: '10px' }}>-</span>
                    <button className="btn-decrement" onClick={() => adjustConfig('yMax', -1)} style={{ width: '20px', height: '20px', fontSize: '12px' }}>↓</button>
                    <input
                        type="number"
                        value={config.yMax}
                        onChange={e => setConfig({ ...config, yMax: Number(e.target.value) })}
                        onClick={(e) => e.stopPropagation()}
                        style={{ width: '35px', fontSize: '9px', padding: '2px', borderRadius: '4px', textAlign: 'center', border: '1px solid #ccc' }}
                    />
                    <button className="btn-increment" onClick={() => adjustConfig('yMax', 1)} style={{ width: '20px', height: '20px', fontSize: '12px' }}>↑</button>
                </div>
            </div>

            {/* Resizer Handle */}
            <div
                onMouseDown={handleMouseDown}
                style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    width: '20px',
                    height: '20px',
                    cursor: 'nwse-resize',
                    background: 'linear-gradient(135deg, transparent 50%, #636e72 50%)',
                    zIndex: 20
                }}
            />
        </div>
    );
};
