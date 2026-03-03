# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Production build → dist/
npm run build

# Lint
npm run lint

# Preview production build
npm run preview

# Python backend (placeholder)
python main.py
```

No test runner is configured.

## Architecture

**Neural Playground** is an interactive, browser-based neural network visualizer. Users drag nodes onto a canvas, wire them together by dragging connection ports, and adjust weights/biases.

### Stack
- **React 19** + **Vite** (no TypeScript — plain JSX)
- **Zustand** (`src/store/useStore.js`) — single global store, no Redux
- **Recharts** — used in `TVScreen` for output visualization
- **Lucide React** — icons
- **Python** (`main.py`, `pyproject.toml`) — minimal placeholder, not integrated with the frontend

### Data Model (Zustand store)

```
Node: { id, type, x, y, data }
  type = 'INPUT'  → data: { label: 'x1', value }
  type = 'HIDDEN' → data: { k, b }       (slope k, bias b)
  type = 'OUTPUT' → data: { b }
  type = 'NEURON' is an alias for 'HIDDEN' (rendered identically)

Connection: { id, fromNodeId, toNodeId, weight }
```

Store actions: `addNode`, `removeNode`, `updateNodePosition`, `updateNodeData`, `recalculateInputLabels`, `addConnection`, `removeConnection`, `updateConnectionWeight`.

### Component Roles

| File | Role |
|------|------|
| `App.jsx` | Full-screen canvas; owns drag state, connection-drawing state, SVG preview line, and the toolbar |
| `store/useStore.js` | All global state and mutations |
| `NodeWrapper.jsx` | Absolutely-positioned wrapper that handles `onMouseDown` for drag initiation |
| `NeuronNode.jsx` | Renders HIDDEN/NEURON nodes with input/output ports (`.port` elements with `data-node-id` / `data-port-type` attributes) |
| `InputOutputNodes.jsx` | Renders INPUT (xN label) and OUTPUT nodes |
| `ConnectionLine.jsx` | SVG `<path>` between two nodes; renders the weight label |
| `TVScreen.jsx` | Chart visualization of the network's output (uses Recharts) |

### Canvas Interaction Pattern

`App.jsx` manages all mouse events on a single `onMouseMove`/`onMouseUp` listener on the root `div`. Ports are identified via DOM attributes (`.port[data-node-id][data-port-type]`). Magnetic snapping to nearby ports (30 px threshold) is done in `handleMouseMove` by querying `document.querySelectorAll('.port')`.

Connections are directional: `output → input` only. Duplicates and self-loops are rejected in `addConnection`.
