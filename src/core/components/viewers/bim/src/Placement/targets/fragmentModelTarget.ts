// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2025 Collab Digital Twins

import * as THREE from 'three'

import { DEFAULT_PLACEMENT } from '../../../../shared/pointcloud/pointCloudPlacement'
import { YAW_ONLY_PLACEMENT } from '../placementTarget'

import type { PlacementTarget } from '../placementTarget'
import type { DbFile } from '../../../../../../types/dbTypes'

export interface FragmentModelTargetSetup {
  id: string
  name: string
  object: () => THREE.Object3D | null
  updateFile: (patch: Partial<DbFile>) => Promise<unknown>
}

/**
 * Placement for a loaded fragment model or scene object. `DbFile` has no scale and no
 * pitch/roll, so only position and yaw survive a save.
 */
export function fragmentModelTarget({ id, name, object, updateFile }: FragmentModelTargetSetup): PlacementTarget {
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
