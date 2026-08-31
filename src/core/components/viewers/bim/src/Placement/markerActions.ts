// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2025 Collab Digital Twins

import type { PlacementCapabilities } from './placementTarget'
import type { FileMarkerAction } from '../../../../ui/FilesManager/src/PlacementActionsCard'

/** The viewport menu offers only what the target can save, matching the placement card. */
export function markerActionsFor(capabilities: PlacementCapabilities): FileMarkerAction[] {
  const actions: FileMarkerAction[] = ['move', 'rotate']
  if (capabilities.scale) actions.push('scale')
  return actions
}
