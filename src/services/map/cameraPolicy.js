// AI-assisted: see docs/AI_LOG.md #57
// Pure camera decisions for the Home map (H-1). No React, no network, no native calls.
// Positions arrive as { lat, lng }; the camera center is [lng, lat].

import {
  CAMERA_ANIMATION_MS,
  NEIGHBORHOOD_ZOOM,
  REDUCED_MOTION_DURATION_MS,
} from '../../config/map';

const isValidPosition = (position) =>
  !!position &&
  typeof position.lat === 'number' &&
  typeof position.lng === 'number' &&
  Number.isFinite(position.lat) &&
  Number.isFinite(position.lng);

// True only for the first valid position; null/invalid positions and later ones do not center.
export function shouldCenterOnFirstFix({ alreadyCentered, position }) {
  return !alreadyCentered && isValidPosition(position);
}

// Camera move for the "My location" button; null without a valid position.
export function recenterAction({ position, reduceMotion }) {
  if (!isValidPosition(position)) return null;
  return {
    center: [position.lng, position.lat],
    zoom: NEIGHBORHOOD_ZOOM,
    duration: reduceMotion ? REDUCED_MOTION_DURATION_MS : CAMERA_ANIMATION_MS,
  };
}
