import React, { useEffect, useState, useCallback } from 'react';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  ControlButton,
  getSmoothStepPath,
  Position,
  useNodes,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';

const initialData = [
    {
      task: "docs1",
      children: [
        { key_value: "section1" },
        { key_value: "section2" },
        { key_value: "section3" },
        { key_value: "section4" }
      ]
    },
    {
      task: "docs2",
      children: [
        { key_value: "section1" },
        { key_value: "section5" },
        { key_value: "section6" },
        { key_value: "section7" }
      ]
    },
    {
      task: "docs3",
      children: [
        { key_value: "section2" },
        { key_value: "section8" },
        { key_value: "section9" }
      ]
    },
    {
      task: "docs4",
      children: [
        { key_value: "section3" },
        { key_value: "section10" },
        { key_value: "section11" }
      ]
    },
    {
      task: "docs5",
      children: [
        { key_value: "section4" },
        { key_value: "section12" },
        { key_value: "section13" },
        { key_value: "section1" }
      ]
    },
    {
      task: "docs6",
      children: [
        { key_value: "section5" },
        { key_value: "section14" },
        { key_value: "section15" }]
    },
    {
      task: "docs7",
      children: [
        { key_value: "section6" },
        { key_value: "section16" },
        { key_value: "section17" }]
    },
    {
      task: "docs8",
      children: [
        { key_value: "section7" },
        { key_value: "section18" },
        { key_value: "section19" }]
    },
    {
      task: "docs9",
      children: [
        { key_value: "section8" },
        { key_value: "section20" },
        { key_value: "section21" }]
    },
    {
      task: "docs10",
      children: [
        { key_value: "section9" },
        { key_value: "section22" },
        { key_value: "section23" }]
    },
    {
      task: "docs11",
      children: [
        { key_value: "section10" },
        { key_value: "section24" },
        { key_value: "section25" }]
    },
    {
      task: "docs12",
      children: [
        { key_value: "section11" },
        { key_value: "section26" },
        { key_value: "section27" }]
    },
    {
      task: "docs13",
      children: [
        { key_value: "section12" },
        { key_value: "section28" },
        { key_value: "section29" }]
    },
    {
      task: "docs14",
      children: [
        { key_value: "section13" },
        { key_value: "section30" },
        { key_value: "section31" }]
    },
    {
      task: "docs15",
      children: [
        { key_value: "section14" },
        { key_value: "section32" },
        { key_value: "section33" }]
    }
  ];
  

  
  const getNodeIntersection = (intersectionNode, sourceNode) => {
    const intersectionNodePosition = intersectionNode.position;
    const sourcePosition = sourceNode.position;
  
    const intersectionNodeHalfWidth = (intersectionNode.width || 0) / 2;
    const intersectionNodeHalfHeight = (intersectionNode.height || 0) / 2;
  
    const sourceNodeHalfWidth = (sourceNode.width || 0) / 2;
    const sourceNodeHalfHeight = (sourceNode.height || 0) / 2;
  
    const intersectionNodeCenterX = intersectionNodePosition.x + intersectionNodeHalfWidth;
    const intersectionNodeCenterY = intersectionNodePosition.y + intersectionNodeHalfHeight;
  
    const sourceNodeCenterX = sourcePosition.x + sourceNodeHalfWidth;
    const sourceNodeCenterY = sourcePosition.y + sourceNodeHalfHeight;
  
    const xx1 = (sourceNodeCenterX - intersectionNodeCenterX) / (2 * intersectionNodeHalfWidth) -
                (sourceNodeCenterY - intersectionNodeCenterY) / (2 * intersectionNodeHalfHeight);
  
    const yy1 = (sourceNodeCenterX - intersectionNodeCenterX) / (2 * intersectionNodeHalfWidth) +
                (sourceNodeCenterY - intersectionNodeCenterY) / (2 * intersectionNodeHalfHeight);
  
    const a = 1 / (Math.abs(xx1) + Math.abs(yy1) || 1);
    const xx3 = a * xx1;
    const yy3 = a * yy1;
  
    return {
      x: intersectionNodeHalfWidth * (xx3 + yy3) + intersectionNodeCenterX,
      y: intersectionNodeHalfHeight * (-xx3 + yy3) + intersectionNodeCenterY
    };
  };
  
  // Utility function to determine edge position
  const getEdgePosition = (node, intersectionPoint) => {
    const nx = Math.round(node.position.x);
    const ny = Math.round(node.position.y);
    const px = Math.round(intersectionPoint.x);
    const py = Math.round(intersectionPoint.y);
  
    if (px <= nx + 1) return Position.Left;
    if (px >= nx + (node.width || 0) - 1) return Position.Right;
    if (py <= ny + 1) return Position.Top;
    if (py >= ny + (node.height || 0) - 1) return Position.Bottom;
    return Position.Top;
  };
  
  const CustomEdge = ({ id, source, target, markerEnd, ...props }) => {
    const nodes = useNodes();
    const sourceNode = nodes.find(n => n.id === source);
    const targetNode = nodes.find(n => n.id === target);
  
    if (!sourceNode || !targetNode) return null;
  
    // Calculate node centers
    const getNodeCenter = (node) => ({
      x: node.position.x + (node.width || 0) / 2,
      y: node.position.y + (node.height || 0) / 2
    });
  
    const sourceCenter = getNodeCenter(sourceNode);
    const targetCenter = getNodeCenter(targetNode);
  
    // Calculate direction vector
    const deltaX = targetCenter.x - sourceCenter.x;
    const deltaY = targetCenter.y - sourceCenter.y;
  
    // Determine connection positions
    let sourcePosition, targetPosition;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      sourcePosition = deltaX > 0 ? Position.Right : Position.Left;
      targetPosition = deltaX > 0 ? Position.Left : Position.Right;
    } else {
      sourcePosition = deltaY > 0 ? Position.Bottom : Position.Top;
      targetPosition = deltaY > 0 ? Position.Top : Position.Bottom;
    }
  
    // Get edge start/end points
    const getEdgePoint = (node, position) => {
      const x = node.position.x;
      const y = node.position.y;
      const width = node.width || 0;
      const height = node.height || 0;
  
      switch (position) {
        case Position.Left: return { x: x, y: y + height / 2 };
        case Position.Right: return { x: x + width, y: y + height / 2 };
        case Position.Top: return { x: x + width / 2, y: y };
        case Position.Bottom: return { x: x + width / 2, y: y + height };
        default: return { x: x + width / 2, y: y + height / 2 };
      }
    };
  
    const sourcePoint = getEdgePoint(sourceNode, sourcePosition);
    const targetPoint = getEdgePoint(targetNode, targetPosition);
  
    // Generate smooth step path
    const [edgePath] = getSmoothStepPath({
      sourceX: sourcePoint.x,
      sourceY: sourcePoint.y,
      targetX: targetPoint.x,
      targetY: targetPoint.y,
      sourcePosition,
      targetPosition,
      borderRadius: 20, // Increased for smoother corners
    });
  
    return <path id={id} className="react-flow__edge-path" d={edgePath} markerEnd={markerEnd} {...props} />;
  };
 


// Layout Calculation
const calculateLayout = (showMidLevel) => {
    const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const baseRadiusX = window.innerWidth * 0.4;
    const baseRadiusY = window.innerHeight * 0.3;
  
    const taskCount = initialData.length;
    const sectionMap = new Map();
    const taskChildrenMap = new Map();
  
    initialData.forEach(task => {
      taskChildrenMap.set(task.task, task.children.map(c => c.key_value));
      task.children.forEach(child => {
        if (!sectionMap.has(child.key_value)) {
          sectionMap.set(child.key_value, new Set());
        }
        sectionMap.get(child.key_value).add(task.task);
      });
    });
  
    const level2Sections = [];
    const level3Sections = [];
    sectionMap.forEach((tasks, section) => {
      tasks.size > 1 ? level3Sections.push(section) : level2Sections.push(section);
    });
  
    // **Updated Levels Configuration**
    // Make Level 3 (Core Sections) the outermost
    // Make Level 1 (Tasks) the second level
    // Level 2 (Middle Layer) remains optional based on showMidLevel
  
    const levels = [
      { // Level 3: Core sections (outermost)
        radiusX: baseRadiusX,
        radiusY: baseRadiusY,
        color: '#10b981'
      },
      { // Level 1: Tasks (second level)
        radiusX: baseRadiusX * 0.7,
        radiusY: baseRadiusY * 0.7,
        color: '#6366f1'
      },
      { // Level 2: Middle layer (optional)
        radiusX: showMidLevel ? baseRadiusX * 0.4 : baseRadiusX * 0.7,
        radiusY: showMidLevel ? baseRadiusY * 0.4 : baseRadiusY * 0.7,
        color: '#f59e0b',
        visible: showMidLevel
      }
    ];
  
    const nodes = [];
  
    // **Level 3: Core Sections (Outermost Layer)**
    level3Sections.forEach((section, i) => {
      const angle = (Math.PI * 2 * i) / level3Sections.length - Math.PI / 2;
      nodes.push({
        id: section,
        data: { label: section },
        position: {
          x: center.x + levels[0].radiusX * Math.cos(angle),
          y: center.y + levels[0].radiusY * Math.sin(angle)
        },
        style: {
          background: levels[0].color,
          color: 'white',
          padding: 10,
          borderRadius: 20,
        },
        type: 'coreSection',
        width: 80,
        height: 80
      });
    });
  
    // **Level 1: Tasks (Second Layer)**
    initialData.forEach((task, i) => {
      const angle = (Math.PI * 2 * i) / taskCount - Math.PI / 2;
      nodes.push({
        id: task.task,
        data: { label: task.task },
        position: {
          x: center.x + levels[1].radiusX * Math.cos(angle),
          y: center.y + levels[1].radiusY * Math.sin(angle)
        },
        style: {
          background: levels[1].color,
          color: 'white',
          fontSize: 12,
          padding: 10,
          borderRadius: 6,
        },
        type: 'task',
        width: 120,
        height: 40
      });
    });
  
    // **Level 2: Middle Layer (Optional)**
    if (showMidLevel && level2Sections.length > 0) {
      level2Sections.forEach((section, i) => {
        const angle = (Math.PI * 2 * i) / level2Sections.length - Math.PI / 2;
        nodes.push({
          id: section,
          data: { label: section },
          position: {
            x: center.x + levels[2].radiusX * Math.cos(angle),
            y: center.y + levels[2].radiusY * Math.sin(angle)
          },
          style: {
            background: levels[2].color,
            color: 'white',
            padding: 8,
            borderRadius: 4,
          },
          type: 'midLevel',
          width: 100,
          height: 30
        });
      });
    }
  
    return { nodes, edges: [], taskChildrenMap, sectionMap };
  };
 
  export default function RadialFlow() {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges] = useEdgesState([]);
    const [showMidLevel, setShowMidLevel] = useState(false);
    const [highlighted, setHighlighted] = useState({ nodes: new Set(), edges: new Set() });
    const [layoutData, setLayoutData] = useState({ taskChildrenMap: new Map(), sectionMap: new Map() });
    const [showOnlyHighlightedEdges, setShowOnlyHighlightedEdges] = useState(false);
  
    useEffect(() => {
      const updateLayout = () => {
        const result = calculateLayout(showMidLevel);
        const newEdges = [];
  
        initialData.forEach(task => {
          task.children.forEach(child => {
            const isCore = result.sectionMap.get(child.key_value).size > 1;
            if (showMidLevel || isCore) {
              const edgeId = `${task.task}-${child.key_value}`;
              const edgeHidden = showOnlyHighlightedEdges && !highlighted.edges.has(edgeId);
  
              newEdges.push({
                id: edgeId,
                source: task.task,
                target: child.key_value,
                type: 'custom',
                style: {
                  stroke: highlighted.edges.has(edgeId) ? '#ff0000' : '#64748b',
                  strokeWidth: highlighted.edges.has(edgeId) ? 3 : 1.5,
                },
                zIndex: isCore ? 1 : 0,
                hidden: edgeHidden,
              });
            }
          });
        });
  
        const newNodes = result.nodes.map(node => ({
          ...node,
          style: {
            ...node.style,
            border: highlighted.nodes.has(node.id) ? '2px solid #ff0000' : 'none',
            boxShadow: highlighted.nodes.has(node.id) ? '0 0 10px rgba(255,0,0,0.5)' : 'none',
          },
        }));
  
        setNodes(newNodes);
        setEdges(newEdges);
        setLayoutData({
          taskChildrenMap: result.taskChildrenMap,
          sectionMap: result.sectionMap,
        });
      };
  
      updateLayout();
      window.addEventListener('resize', updateLayout);
      return () => window.removeEventListener('resize', updateLayout);
    }, [showMidLevel, highlighted, showOnlyHighlightedEdges]);
  
    const handleNodeClick = (event, node) => {
      if (node.type === 'task') {
        const relatedSections = layoutData.taskChildrenMap.get(node.id) || [];
        const relatedEdges = edges.filter(e => e.source === node.id).map(e => e.id);
  
        const connectedTasks = new Set();
        relatedSections.forEach(section => {
          if (layoutData.sectionMap.get(section)?.size > 1) {
            layoutData.sectionMap.get(section).forEach(task => {
              if (task !== node.id) connectedTasks.add(task);
            });
          }
        });
  
        const connectedTaskEdges = [];
        connectedTasks.forEach(taskId => {
          edges.forEach(edge => {
            if (edge.source === taskId && relatedSections.includes(edge.target)) {
              connectedTaskEdges.push(edge.id);
            }
          });
        });
  
        setHighlighted({
          nodes: new Set([node.id, ...relatedSections, ...connectedTasks]),
          edges: new Set([
            ...relatedEdges,
            ...connectedTaskEdges,
          ]),
        });
      }
    };
  
    const handleNodeDoubleClick = useCallback((event, node) => {
        // Find all edges connected to this node
        const connectedEdges = edges.filter(edge =>
          edge.source === node.id || edge.target === node.id
        );
        const connectedEdgeIds = new Set(connectedEdges.map(edge => edge.id));
    
        // Collect connected nodes (sources and targets)
        const connectedNodeIds = new Set();
        connectedEdges.forEach(edge => {
          connectedNodeIds.add(edge.source);
          connectedNodeIds.add(edge.target);
        });
    
        // Update highlighted state
        setHighlighted({
          nodes: connectedNodeIds,
          edges: connectedEdgeIds,
        });
    
        // Activate edge filtering
        setShowOnlyHighlightedEdges(true);
      }, [edges]); // Include 'edges' in the dependency array

  
    
      return (
        <div style={{ width: '100vw', height: '100vh' }}>
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={() => { }}
              onNodeClick={handleNodeClick}
              onNodeDoubleClick={handleNodeDoubleClick}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              proOptions={{ hideAttribution: true }}
              edgeTypes={{ custom: CustomEdge }}
              nodesDraggable={false}
              minZoom={0.1}
              maxZoom={2}
            >
              <Background variant="dots" gap={40} size={1} />
              <Controls>
                <ControlButton
                  onClick={() => setShowMidLevel(!showMidLevel)}
                  title="Toggle Middle Level"
                >
                  {showMidLevel ? '◉' : '◎'}
                </ControlButton>
                <ControlButton
                  onClick={() => {
                    setHighlighted({ nodes: new Set(), edges: new Set() });
                    setShowOnlyHighlightedEdges(false);
                  }}
                  title="Clear Highlights"
                >
                  ✕
                </ControlButton>
              </Controls>
            </ReactFlow>
          </ReactFlowProvider>
        </div>
      );
    }
