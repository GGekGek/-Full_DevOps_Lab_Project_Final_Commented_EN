/**
 * Unit tests for src/utils/store.js (generic in-memory store).
 */
import { describe, it, expect } from 'vitest'
import { createStore } from '../../src/utils/store.js'

describe('createStore', () => {
  const seed = [{ id: 1, name: 'A', tags: ['x'] }, { id: 2, name: 'B', tags: [] }]

  it('lists and finds items by numeric or string id', () => {
    const store = createStore(seed)
    expect(store.list()).toHaveLength(2)
    expect(store.find('2').name).toBe('B')
    expect(store.find(9)).toBeUndefined()
  })

  it('adds with the next id, updates and removes', () => {
    const store = createStore(seed)
    expect(store.add({ name: 'C' })).toEqual({ id: 3, name: 'C' })
    expect(store.update(3, { name: 'C2' })).toEqual({ id: 3, name: 'C2' })
    expect(store.update(42, { name: 'X' })).toBeUndefined()
    expect(store.remove(3)).toBe(true)
    expect(store.remove(3)).toBe(false)
  })

  it('starts at id 1 when empty', () => {
    expect(createStore([]).add({ name: 'first' }).id).toBe(1)
  })

  it('reset restores a deep copy of the seed', () => {
    const store = createStore(seed)
    store.find(1).tags.push('y')
    store.remove(2)
    store.reset()
    expect(store.list()).toEqual(seed)
    expect(seed[0].tags).toEqual(['x'])
  })
})
