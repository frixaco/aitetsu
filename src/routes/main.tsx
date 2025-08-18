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
  getStraightPath,
  EdgeProps,
} from '@xyflow/react';

import { BaseEdge } from '@xyflow/react';

import '@xyflow/react/dist/style.css';

type ChatEdge = Edge<{}, 'chat'>;

export function ChatEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  ...props
}: EdgeProps<ChatEdge>) {
  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const { label, labelStyle, markerStart, markerEnd, interactionWidth } = props;

  return (
    <BaseEdge
      path={edgePath}
      label={label}
      labelStyle={labelStyle}
      markerEnd={markerEnd}
      markerStart={markerStart}
      interactionWidth={interactionWidth}
    />
  );
}

type ChatNode = Node<{ message: string }, 'chat'>;

function ChatNode({ data }: NodeProps<ChatNode>) {
  return (
    <div className="px-4 py-2 shadow-md rounded-sm bg-bg-alt border border-bg-highlight">
      <div className="flex flex-col">
        <div className="text-lg font-bold">{data.message}</div>
        <textarea rows={4} className="resize-none w-40 h-16" />
        <button onClick={() => {}}>FOCUS</button>
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

const edgeTypes = {
  chat: ChatEdge,
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
    position: { x: 0, y: 200 },
    data: { message: 'Message 2' },
  },
];
const initialEdges: Array<ChatEdge> = [
  {
    id: 'n1-n2',
    source: 'n1',
    target: 'n2',
  },
];

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
      className="w-screen h-screen text-white"
      // style={{ width: "100vw", height: "100vh" }}
    >
      <ReactFlow
        // colorMode="dark"
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        nodesFocusable={true}
        edgesFocusable={false}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        className="bg-bg"
      />
    </div>
  );
}
