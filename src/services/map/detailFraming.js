// AI-assisted: see docs/AI_LOG.md #67
// Pure padding for the camera of the trip detail map (A5). The on-screen attribution sits at the bottom
// of the map and grows with the font scale, so the bottom margin adds its height to the base inset: the
// last stretch of the route and the destination marker stay above it. Every side is at least the outer
// radius of the target marker, and top plus bottom never exceed MAX_VERTICAL_SHARE of the frame, so a
// short frame or a huge font still leaves room to draw the route (very short or very long routes only
// change the zoom, never the margins). The route bounds come from routeBounds, untouched.

import { ROUTE_FIT_PADDING } from '../../config/map';
import { mapMarker, space, type } from '../../theme/tokens';

export const MAX_VERTICAL_SHARE = 0.6;

// Outer radius of the target marker: circle plus half of its stroke.
const MARKER_OUTER_RADIUS = mapMarker.targetRadius + mapMarker.targetStroke / 2;

// Height of the attribution box: text line (scaled), vertical padding on both sides and the offset
// from the bottom edge (see TripMap styles).
export function attributionHeight(fontScale) {
  const scale = Number.isFinite(fontScale) && fontScale > 1 ? fontScale : 1;
  return Math.ceil(type.caption.lineHeight * scale) + space[1] * 2 + space[2];
}

// mapHeight: frame height in points. Returns { top, right, bottom, left } in points.
export function detailFitPadding({ mapHeight, fontScale = 1, baseInset = ROUTE_FIT_PADDING }) {
  const inset = Math.max(baseInset, Math.ceil(MARKER_OUTER_RADIUS));
  let top = inset;
  let bottom = inset + attributionHeight(fontScale);
  const maxVertical = Number.isFinite(mapHeight) && mapHeight > 0 ? mapHeight * MAX_VERTICAL_SHARE : Infinity;
  if (top + bottom > maxVertical) {
    // Shrink both proportionally, but never below the marker radius.
    const floor = Math.ceil(MARKER_OUTER_RADIUS);
    const ratio = maxVertical / (top + bottom);
    top = Math.max(floor, Math.floor(top * ratio));
    bottom = Math.max(floor + attributionHeight(fontScale), Math.floor(bottom * ratio));
  }
  return { top, right: inset, bottom, left: inset };
}
