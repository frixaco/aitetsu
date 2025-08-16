import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/main')({
  component: RouteComponent,
});

import { useState, useCallback } from 'react';
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Node,
  Edge,
  MarkerType,
  Handle,
  Position,
  NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

type ChatNode = Node<{ message: string }, 'chat'>;

function ChatNode({ data }: NodeProps<ChatNode>) {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
      <div className="flex">
        <div className="text-lg font-bold">{data.message}</div>
        <textarea rows={4} className="resize-none w-80 h-32" />
      </div>

      <Handle
        type="target"
        position={Position.Top}
        className="bg-teal-500 rounded-none invisible top-1"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="bg-teal-500 rounded-none invisible bottom-1"
      />
    </div>
  );
}

const nodeTypes = {
  chat: ChatNode,
};

const initialNodes: Array<ChatNode> = [
  {
    id: 'n1',
    type: 'chat',
    position: { x: 0, y: 0 },
    data: { message: 'Message 1' },
  },
  {
    id: 'n2',
    type: 'chat',
    position: { x: 0, y: 100 },
    data: { message: 'Message 2' },
  },
];
const initialEdges: Array<Edge> = [{ id: 'n1-n2', source: 'n1', target: 'n2' }];

function RouteComponent() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const onNodesChange = useCallback(
    (changes) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    []
  );
  const onEdgesChange = useCallback(
    (changes) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    []
  );
  const onConnect = useCallback(
    (params) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    []
  );

  return (
    <div
      className="w-screen h-screen"
      // style={{ width: "100vw", height: "100vh" }}
    >
      <ReactFlow
        // colorMode="dark"
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        nodesFocusable={true}
        edgesFocusable={false}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        className="bg-teal-50"
      />
    </div>
  );
}
