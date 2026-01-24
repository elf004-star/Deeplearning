import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export const useStore = create((set, get) => ({
    nodes: [],
    connections: [],

    // --- Node Actions ---
    addNode: (type, x, y) => {
        set((state) => {
            let data = {};
            if (type === 'INPUT') {
                // Count existing input nodes to determine index
                const inputCount = state.nodes.filter(n => n.type === 'INPUT').length;
                data = { label: `x${inputCount + 1}`, value: 0 }; // Value is input value (default 0 or user set?) User didn't specify input value control, just x1, x2 label. But maybe for TV plot we iterate x.
                // Actually for TV plot, 'x' is the variable. x1, x2 might be features.
                // User said: "Input neuron ... when adding one shows x1...".
                // For the TV, "Show x, y curve". If 1 input, y = f(x).
                // If 2 inputs, y = f(x1, x2)? 2D curve usually needs 1 variable.
                // Let's assume for now the TV plots output vs FIRST input, or inputs are fixed.
                // Or maybe inputs are constants? No, TV plots relationship.
                // Let's keep data minimal for now.
            } else if (type === 'HIDDEN') {
                data = { k: 1, b: 0 };
            } else if (type === 'OUTPUT') {
                data = { b: 0 };
            }

            const newNode = {
                id: uuidv4(),
                type,
                x,
                y,
                data,
            };
            return { nodes: [...state.nodes, newNode] };
        });
    },

    removeNode: (id) => {
        set((state) => ({
            nodes: state.nodes.filter((n) => n.id !== id),
            connections: state.connections.filter(
                (c) => c.fromNodeId !== id && c.toNodeId !== id
            ),
        }));
        // Re-index inputs if needed?
        // User said: "Adding first shows x1, adding second shows x2".
        // If I delete x1, remaining one should probably become x1? Or stay x2?
        // "Display depends on current existing neuron quantity".
        // So if I have 2, delete 1, the remaining one depends on count?
        // Let's just re-label all inputs on change.
        get().recalculateInputLabels();
    },

    updateNodePosition: (id, x, y) => {
        set((state) => ({
            nodes: state.nodes.map((n) =>
                n.id === id ? { ...n, x, y } : n
            ),
        }));
    },

    updateNodeData: (id, partialData) => {
        set((state) => ({
            nodes: state.nodes.map((n) =>
                n.id === id ? { ...n, data: { ...n.data, ...partialData } } : n
            ),
        }));
    },

    recalculateInputLabels: () => {
        set((state) => {
            let inputIndex = 1;
            const newNodes = state.nodes.map(n => {
                if (n.type === 'INPUT') {
                    return { ...n, data: { ...n.data, label: `x${inputIndex++}` } };
                }
                return n;
            });
            return { nodes: newNodes };
        });
    },

    // --- Connection Actions ---
    addConnection: (fromNodeId, toNodeId) => {
        // Avoid duplicates and self-loops
        const { connections } = get();
        if (fromNodeId === toNodeId) return;
        if (connections.some(c => c.fromNodeId === fromNodeId && c.toNodeId === toNodeId)) return;

        // TODO: Validate valid connection types (Input/Hidden -> Hidden/Output)
        // For now allow all

        set((state) => ({
            connections: [...state.connections, {
                id: uuidv4(),
                fromNodeId,
                toNodeId,
                weight: 1.0, // Default weight
            }],
        }));
    },

    removeConnection: (id) => {
        set((state) => ({
            connections: state.connections.filter((c) => c.id !== id),
        }));
    },

    updateConnectionWeight: (id, weight) => {
        set((state) => ({
            connections: state.connections.map((c) =>
                c.id === id ? { ...c, weight } : c
            ),
        }));
    },
}));
