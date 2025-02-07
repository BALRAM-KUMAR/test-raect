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
