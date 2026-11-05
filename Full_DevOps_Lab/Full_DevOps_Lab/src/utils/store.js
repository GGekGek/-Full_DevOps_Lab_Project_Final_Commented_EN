/**
 * Generic in-memory store used by every entity of the Internship Application API.
 * Each entity (students, companies, offers, applications) creates its own store
 * from seed data. Swapping this file for a MongoDB implementation would not
 * change the routes, which only call these functions.
 */
export function createStore (seed) {
  const fresh = () => seed.map(item => structuredClone(item))
  let items = fresh()

  const find = id => items.find(item => item.id === Number(id))

  return {
    /** All items (the live array: callers filter, they do not mutate it). */
    list: () => items,

    /** One item by id (number or numeric string), or undefined. */
    find,

    /** Adds an item with the next id (highest id + 1) and returns it. */
    add (data) {
      const item = { id: Math.max(0, ...items.map(i => i.id)) + 1, ...data }
      items.push(item)
      return item
    },

    /** Merges changes into an item. Returns the item, or undefined if not found. */
    update (id, changes) {
      const item = find(id)
      if (!item) return undefined
      Object.assign(item, changes)
      return item
    },

    /** Removes an item. Returns true if it existed. */
    remove (id) {
      const index = items.findIndex(item => item.id === Number(id))
      if (index === -1) return false
      items.splice(index, 1)
      return true
    },

    /** Restores the seed data (used by tests to start from a known state). */
    reset () {
      items = fresh()
    }
  }
}
