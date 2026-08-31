// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2025 Collab Digital Twins

import * as THREE from 'three'

import { DEFAULT_PLACEMENT } from '../../../../shared/pointcloud/pointCloudPlacement'
import { YAW_ONLY_PLACEMENT } from '../placementTarget'

import type { DbFile } from '../../../../../../types/dbTypes'
import type { PlacementTarget } from '../placementTarget'

export interface ObjectTargetSetup {
  id: string
  name: string
  object: () => THREE.Object3D | null
  updateFile: (patch: Partial<DbFile>) => Promise<unknown>
}

/**
 * Placement for anything that is one `Object3D` backed by a `DbFile` — a fragment model, a
 * loaded GLB, a DXF group. No scale and no pitch/roll column, so only position and yaw save.
 */
export function objectTarget({ id, name, object, updateFile }: ObjectTargetSetup): PlacementTarget {
  return {
    id,
    name,
    capabilities: YAW_ONLY_PLACEMENT,
    object,
    read: () => {
      const root = object()
      if (!root) return { ...DEFAULT_PLACEMENT }
      const { x, y, z } = root.position
      return { ...DEFAULT_PLACEMENT, position: [x, y, z], rotation: [0, root.rotation.y, 0] }
    },
    apply: (placement) => {
      const root = object()
      if (!root) return
      root.position.set(...placement.position)
      root.rotation.y = placement.rotation[1]
      root.updateMatrixWorld(true)
    },
    bounds: () => {
      const root = object()
      if (!root) return null
      const box = new THREE.Box3().setFromObject(root)
      return box.isEmpty() ? null : box.getCenter(new THREE.Vector3())
    },
    commit: async (placement) => {
      const [x, y, z] = placement.position
      await updateFile({ x, y, z, bimRotation: placement.rotation[1] } as Partial<DbFile>)
    },
  }
}
