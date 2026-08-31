// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2025 Collab Digital Twins

import * as THREE from 'three'
import { describe, expect, it, vi } from 'vitest'

import { DEFAULT_PLACEMENT } from '../../../../shared/pointcloud/pointCloudPlacement'

import { fragmentModelTarget } from './fragmentModelTarget'

function stubModel() {
  const object = new THREE.Group()
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2))
  mesh.position.set(3, 0, 0)
  object.add(mesh)
  return object
}

function setUp(object: THREE.Object3D | null = stubModel()) {
  const updateFile = vi.fn().mockResolvedValue(undefined)
  const target = fragmentModelTarget({
    id: '12',
    name: 'tower.frag',
    object: () => object,
    updateFile,
  })
  return { target, updateFile, object }
}

describe('fragmentModelTarget', () => {
  it('can save yaw and position only, matching the File columns', () => {
    const { target } = setUp()

    expect(target.capabilities).toEqual({ rotation: 'yaw', scale: false })
  })

  it('reads the object transform as a placement', () => {
    const { target, object } = setUp()
    object!.position.set(1, 2, 3)
    object!.rotation.y = 0.5

    const placement = target.read()

    expect(placement.position).toEqual([1, 2, 3])
    expect(placement.rotation[1]).toBeCloseTo(0.5)
  })

  it('moves the object on apply', () => {
    const { target, object } = setUp()

    target.apply({ ...DEFAULT_PLACEMENT, position: [4, 5, 6], rotation: [0, 1.2, 0] })

    expect(object!.position.toArray()).toEqual([4, 5, 6])
    expect(object!.rotation.y).toBeCloseTo(1.2)
  })

  it('has no object when the model is not loaded', () => {
    const { target } = setUp(null)

    expect(target.object()).toBeNull()
  })

  it('reports the world centre of its geometry for centre-on-origin', () => {
    const { target } = setUp()

    expect(target.bounds()?.x).toBeCloseTo(3)
  })

  it('commits position and yaw as typed columns, never a transform blob', async () => {
    const { target, updateFile } = setUp()

    await target.commit({ ...DEFAULT_PLACEMENT, position: [1, 2, 3], rotation: [0, 0.8, 0] })

    expect(updateFile).toHaveBeenCalledWith({ x: 1, y: 2, z: 3, bimRotation: 0.8 })
  })

  it('does not send a scale, because there is no column for one', async () => {
    const { target, updateFile } = setUp()

    await target.commit({ ...DEFAULT_PLACEMENT, scale: 3 })

    expect(updateFile.mock.calls[0][0]).not.toHaveProperty('scale')
  })
})
