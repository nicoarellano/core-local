// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2025 Collab Digital Twins

import { describe, expect, it } from 'vitest'

import { markerActionsFor } from './markerActions'
import { FULL_PLACEMENT, YAW_ONLY_PLACEMENT } from './placementTarget'

describe('markerActionsFor', () => {
  it('offers scale to a target that can save one', () => {
    expect(markerActionsFor(FULL_PLACEMENT)).toEqual(['move', 'rotate', 'scale'])
  })

  it('withholds scale from a target that cannot save one', () => {
    expect(markerActionsFor(YAW_ONLY_PLACEMENT)).toEqual(['move', 'rotate'])
  })

  it('always offers move and rotate', () => {
    expect(markerActionsFor(YAW_ONLY_PLACEMENT)).toContain('move')
    expect(markerActionsFor(YAW_ONLY_PLACEMENT)).toContain('rotate')
  })
})
