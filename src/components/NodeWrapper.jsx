import React from 'react';
import { useStore } from '../store/useStore';
import { X } from 'lucide-react';

export const NodeWrapper = ({ node, children, onMouseDown }) => {
    const removeNode = useStore((state) => state.removeNode);

    const style = {
        position: 'absolute',
        left: node.x,
        top: node.y,
        width: '200px', // Fixed width for now, or auto?
        // height: 'auto',
        backgroundColor: 'white',
        border: 'var(--border-width) solid var(--color-border)',
        borderRadius: 'var(--border-radius)',
        boxShadow: 'var(--box-shadow)',
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 10,
        userSelect: 'none',
        cursor: 'grab',
    };

    return (
        <div
            className="node-wrapper hover-scale"
            style={style}
            onMouseDown={(e) => onMouseDown(e, node.id)}
        >
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '5px' }}>
                <button
                    className="hover-scale"
                    onClick={(e) => { e.stopPropagation(); removeNode(node.id); }}
                    style={{
                        background: 'var(--color-accent)',
                        border: '2px solid black',
                        width: '24px',
                        height: '24px',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        cursor: 'pointer'
                    }}
                >
                    <X size={14} color="white" strokeWidth={3} />
                </button>
            </div>
            {children}
        </div>
    );
};
