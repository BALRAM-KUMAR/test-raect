// src/components/utils/mapAngleToPosition.js
import { Position } from 'reactflow';

export function mapAngleToPosition(angle) {
  if (angle >= 45 && angle < 135) {
    return Position.Top;
  } else if (angle >= 135 && angle < 225) {
    return Position.Left;
  } else if (angle >= 225 && angle < 315) {
    return Position.Bottom;
  } else {
    return Position.Right;
  }
}