import React, { useRef, useState } from 'react';
import { useStore } from './store/useStore';
import { NodeWrapper } from './components/NodeWrapper';
import { NeuronNode } from './components/NeuronNode';
import { InputNode, OutputNode } from './components/InputOutputNodes';
import { ConnectionLine } from './components/ConnectionLine';
import { Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const {
    nodes,
    connections,
    addNode,
    updateNodePosition,
    addConnection
  } = useStore();

  // Interaction State
  const [draggingNode, setDraggingNode] = useState(null);
  const [connectionStart, setConnectionStart] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // --- Handlers ---

  const handleMouseDown = (e, nodeId) => {
    // Check if clicking input/control (prevent drag)
    if (['INPUT', 'BUTTON'].includes(e.target.tagName)) return;

    // Check if clicking a port
    const port = e.target.closest('.port');
    if (port) {
      const pNodeId = port.getAttribute('data-node-id');
      const pType = port.getAttribute('data-port-type');
      if (pNodeId && pType) {
        setConnectionStart({ nodeId: pNodeId, type: pType, x: e.clientX, y: e.clientY }); // Screen coords initially, but we need relative
      }
      return;
    }

    // Start Dragging Node
    // Calculate offset
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setDraggingNode({
        id: nodeId,
        offsetX: e.clientX - node.x,
        offsetY: e.clientY - node.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const bounds = containerRef.current.getBoundingClientRect();
    const x = e.clientX - bounds.left; // relative to canvas
    const y = e.clientY - bounds.top;

    setMousePos({ x, y });

    if (draggingNode) {
      let newX = e.clientX - draggingNode.offsetX;
      let newY = e.clientY - draggingNode.offsetY;
      updateNodePosition(draggingNode.id, newX, newY);
    }

    // Magnetic snapping for connection dragging
    if (connectionStart) {
      // Find all ports
      const ports = document.querySelectorAll('.port');
      let closestPort = null;
      let minDistance = 30; // Snap threshold in pixels

      ports.forEach(port => {
        const portRect = port.getBoundingClientRect();
        const portCenterX = portRect.left + portRect.width / 2 - bounds.left;
        const portCenterY = portRect.top + portRect.height / 2 - bounds.top;

        const distance = Math.sqrt(
          Math.pow(x - portCenterX, 2) + Math.pow(y - portCenterY, 2)
        );

        if (distance < minDistance) {
          const portNodeId = port.getAttribute('data-node-id');
          const portType = port.getAttribute('data-port-type');

          // Check if it's a valid connection target
          if (portNodeId !== connectionStart.nodeId) {
            if ((connectionStart.type === 'output' && portType === 'input') ||
              (connectionStart.type === 'input' && portType === 'output')) {
              minDistance = distance;
              closestPort = { nodeId: portNodeId, type: portType, x: portCenterX, y: portCenterY };
            }
          }
        }
      });

      // Update mouse position to snap to port if found
      if (closestPort) {
        setMousePos({ x: closestPort.x, y: closestPort.y });
      }
    }
  };

  const handleMouseUp = (e) => {
    // If dropping a connection
    if (connectionStart) {
      const port = e.target.closest('.port');
      if (port) {
        const pNodeId = port.getAttribute('data-node-id');
        const pType = port.getAttribute('data-port-type');

        if (pNodeId && pType && pNodeId !== connectionStart.nodeId) {
          let from, to;
          if (connectionStart.type === 'output' && pType === 'input') {
            from = connectionStart.nodeId;
            to = pNodeId;
          } else if (connectionStart.type === 'input' && pType === 'output') {
            from = pNodeId;
            to = connectionStart.nodeId;
          }

          if (from && to) {
            addConnection(from, to);
          }
        }
      }
    }

    setDraggingNode(null);
    setConnectionStart(null);
  };

  // Helper to get preview line coords
  const getPreviewLine = () => {
    if (!connectionStart) return null;
    // Start Point: dependent on node
    const startNode = nodes.find(n => n.id === connectionStart.nodeId);
    if (!startNode) return null;

    // Approximate port position
    // If type is input, it's on the left. Output on right.
    const isInput = connectionStart.type === 'input';
    const sx = isInput ? startNode.x : startNode.x + 200; // Left or Right edge
    const sy = startNode.y + 75; // Center Y

    return { x1: sx, y1: sy, x2: mousePos.x, y2: mousePos.y };
  };

  const preview = getPreviewLine();

  return (
    <div
      className="app-container"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden', // Infinite canvas? For now fixed screen.
      }}
    >
      {/* SVG Layer for Connections */}
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'visiblePainted' }}>
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="black" />
          </marker>
        </defs>

        {connections.map(conn => {
          const from = nodes.find(n => n.id === conn.fromNodeId);
          const to = nodes.find(n => n.id === conn.toNodeId);
          if (!from || !to) return null;
          return (
            <ConnectionLine
              key={conn.id}
              connection={conn}
              fromNode={from}
              toNode={to}
            />
          );
        })}

        {/* Drag Preview Line */}
        {preview && (
          <line
            x1={preview.x1}
            y1={preview.y1}
            x2={preview.x2}
            y2={preview.y2}
            stroke="var(--color-accent)"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        )}
      </svg>

      {/* Nodes Layer */}
      {nodes.map(node => (
        <NodeWrapper
          key={node.id}
          node={node}
          onMouseDown={handleMouseDown}
        >
          {node.type === 'NEURON' && <NeuronNode node={node} />}
          {node.type === 'HIDDEN' && <NeuronNode node={node} />} {/* Alias */}
          {node.type === 'INPUT' && <InputNode node={node} />}
          {node.type === 'OUTPUT' && <OutputNode node={node} />}
        </NodeWrapper>
      ))}

      {/* Toolbar */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '20px',
        background: 'white',
        padding: '10px 20px',
        borderRadius: '16px',
        boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
        border: '2px solid black'
      }}>
        <button onClick={() => addNode('INPUT', 100, 100)} title="Add Input">
          <Plus size={20} /> Input
        </button>
        <button onClick={() => addNode('HIDDEN', 350, 200)} title="Add Hidden Neuron">
          <div style={{ width: 14, height: 14, background: 'black', borderRadius: '50%', display: 'inline-block', marginRight: 5 }}></div>
          Neuron
        </button>
        <button onClick={() => addNode('OUTPUT', 600, 100)} title="Add Output">
          <Plus size={20} /> Output
        </button>
      </div>

      {/* Help/Instructions */}
      <div style={{ position: 'absolute', top: 20, left: 20, opacity: 0.5, pointerEvents: 'none' }}>
        <h2>Neural Playground</h2>
        <p>Drag ports to connect • Click arrows to set weight</p>
      </div>
    </div>
  );
}

export default App;
