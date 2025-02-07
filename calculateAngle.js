// src/components/utils/calculateAngle.js
export function calculateAngle(source, target) {
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const theta = Math.atan2(dy, dx); // Radians
    let angle = (theta * 180) / Math.PI; // Convert to degrees
    if (angle < 0) angle += 360; // Ensure angle is between 0-360
    return angle;
  }