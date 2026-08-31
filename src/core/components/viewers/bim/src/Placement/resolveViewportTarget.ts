// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2025 Collab Digital Twins

import { FULL_PLACEMENT, YAW_ONLY_PLACEMENT } from './placementTarget'

import type { PlacementCapabilities } from './placementTarget'
import type { DbFile } from '../../../../../types/dbTypes'

export interface FragmentHit {
  distance: number
  modelId?: string
}

export interface CloudHit {
  distance: number
  id: string
}

export interface ViewportTarget {
  file: DbFile
  kind: 'model' | 'cloud'
  capabilities: PlacementCapabilities
}

export interface ResolveViewportTargetInput {
  files: DbFile[]
  fragment: FragmentHit | null
  cloud: CloudHit | null
}

/** What sits under the cursor, or null when nothing placeable does. */
export function resolveViewportTarget({ files, fragment, cloud }: ResolveViewportTargetInput): ViewportTarget | null {
  // Ties go to the fragment, which draws a snap marker the user is already aiming at.
  const fragmentWins = fragment && (!cloud || fragment.distance <= cloud.distance)

  if (fragmentWins && fragment.modelId) {
    const file = files.find((candidate) => candidate.name === fragment.modelId)
    if (file) return { file, kind: 'model', capabilities: YAW_ONLY_PLACEMENT }
  }

  if (cloud) {
    const file = files.find((candidate) => String(candidate.id) === cloud.id)
    if (file) return { file, kind: 'cloud', capabilities: FULL_PLACEMENT }
  }

  return null
}
