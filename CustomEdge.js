// src/components/CustomEdge.jsx
import React from 'react';
import { getBezierPath, getMarkerEnd } from 'reactflow';
import './CustomEdge.css'; // Import the CSS for styling
import { calculateAngle } from './calculateAngle'; // Adjust the path as needed
import { mapAngleToPosition } from './mapAngleToPosition'; // Adjust the path as needed

const CustomEdge = ({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  markerEnd,
  style = {},
  ...props
}) => {
  // Calculate center positions of source and target nodes
  const sourceNodeCenter = { x: sourceX, y: sourceY };
  const targetNodeCenter = { x: targetX, y: targetY };

  // Calculate angle from source to target
  const angle = calculateAngle(sourceNodeCenter, targetNodeCenter);

  // Map angle to positions
  const sourcePosition = mapAngleToPosition(angle);
  const targetPosition = mapAngleToPosition((angle + 180) % 360); // Opposite direction for target

  // Generate the smooth Bezier path
  const edgePath = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 0,
  });

  // Determine the marker end, if any
  const marker = markerEnd || getMarkerEnd('arrow');

  return (
    <>
      <path
        id={id}
        className="custom-edge-path"
        d={edgePath}
        style={{
          ...style,
          strokeDasharray: '5,5', // Dotted line
        }}
        markerEnd={marker}
        {...props}
      />
      <path
        d={edgePath}
        className="custom-edge-animation"
        style={{
          stroke: '#ff0000', // Animation color
          strokeWidth: 2,
          fill: 'none',
          strokeDasharray: '5,5',
        }}
      />
    </>
  );
};

export default CustomEdge;