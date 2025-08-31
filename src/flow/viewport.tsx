import { useCallback, useState } from 'react';
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Connection,
  OnNodesChange,
  OnEdgesChange,
  Node,
  Edge,
  EdgeProps,
  getStraightPath,
  BaseEdge,
  NodeProps,
  Handle,
  Position,
} from '@xyflow/react';
import { Card, useAitetsuStore } from './store';

type CardEdge = Edge<{}, 'chat'>;

export function CardEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  ...props
}: EdgeProps<CardEdge>) {
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

type CardNode = Node<Card, 'chat'>;

function CardNode({ data: { id, title, content } }: NodeProps<CardNode>) {
  const setActiveCard = useAitetsuStore((s) => s.setActiveCard);

  return (
    <div
      className="px-4 py-2 shadow-md rounded-2xl bg-[#e7eef3] w-56 h-80"
      onClick={() => {
        setActiveCard(id);
      }}
    >
      <div className="flex flex-col">
        <h1 className="text-lg font-bold">{title}</h1>
        <p>{content}</p>
      </div>

      <Handle
        type="target"
        position={Position.Top}
        className="bg-gray-400 rounded-full border-none"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="bg-gray-400 rounded-full border-none"
      />
    </div>
  );
}

const nodeTypes = {
  chat: CardNode,
};

const edgeTypes = {
  chat: CardEdge,
};

function generate200Cards() {
  const nodes: Array<CardNode> = [];
  const edges: Array<CardEdge> = [];

  const gridCols = 20;
  const cardWidth = 350;
  const cardHeight = 400;

  for (let i = 0; i < 200; i++) {
    const row = Math.floor(i / gridCols);
    const col = i % gridCols;

    nodes.push({
      id: `n${i + 1}`,
      type: 'chat',
      position: {
        x: col * cardWidth,
        y: row * cardHeight,
      },
      data: {
        id: crypto.randomUUID(),
        title: `Card ${i + 1}`,
        content: `This is the content for card number ${i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
      },
    });

    if (i > 0 && i % gridCols !== 0) {
      edges.push({
        id: `n${i}-n${i + 1}`,
        source: `n${i}`,
        target: `n${i + 1}`,
      });
    }
  }

  return { initialNodes: nodes, initialEdges: edges };
}

const initialCards = generate200Cards();

const initialNodes: Array<CardNode> = initialCards.initialNodes;
// [
//   {
//     id: 'n1',
//     type: 'chat',
//     position: { x: 0, y: 0 },
//     data: {
//       id: crypto.randomUUID(),
//       title: 'Hello World',
//       content:
//         'Lorem2== aljalsdjalksjd alkjsdlas djaljd lajkdjalskjd lakjsd kajskld jalsjd kad',
//     },
//   },
//   {
//     id: 'n2',
//     type: 'chat',
//     position: { x: 0, y: 400 },
//     data: {
//       id: crypto.randomUUID(),
//       title: 'How are you doing?',
//       content:
//         'LK JLSDJKL LJkjdal sjdljwlkqjlkqjlejwejqlwj df90 230jr0 3j2 93j 2jr 03j0r3j',
//     },
//   },
// ];

const initialEdges: Array<CardEdge> = initialCards.initialEdges;
// [
//   {
//     id: 'n1-n2',
//     source: 'n1',
//     target: 'n2',
//   },
// ];

export function Viewport() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    []
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    []
  );
  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    []
  );

  return (
    <div id="viewport" className="relative flex-1 overflow-hidden size-full">
      <ReactFlow
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
        proOptions={{ hideAttribution: true }}
      />
    </div>
  );
}
