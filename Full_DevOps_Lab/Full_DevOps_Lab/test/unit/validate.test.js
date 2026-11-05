/**
 * Unit tests for src/utils/validate.js (schema-based validation).
 */
import { describe, it, expect } from 'vitest'
import { validate, pick } from '../../src/utils/validate.js'

const schema = {
  name: { type: 'string', required: true },
  email: { type: 'email', required: true },
  site: { type: 'url' },
  tags: { type: 'stringArray' },
  weeks: { type: 'int', min: 1, max: 52 },
  ownerId: { type: 'id' },
  state: { type: 'enum', values: ['open', 'closed'] }
}

describe('validate (POST)', () => {
  it('lists the missing required fields', () => {
    expect(validate(undefined, schema)).toBe('Missing required fields: name, email')
    expect(validate({ name: 'A' }, schema)).toBe('Missing required fields: email')
  })

  it('checks each rule type', () => {
    const ok = { name: 'A', email: 'a@b.fr' }
    expect(validate(ok, schema)).toBeNull()
    expect(validate({ ...ok, name: ' ' }, schema)).toBe('name must be a non-empty string')
    expect(validate({ ...ok, email: 'nope' }, schema)).toBe('email must be a valid email address')
    expect(validate({ ...ok, site: 'ftp://x' }, schema)).toBe('site must be an http(s) URL or null')
    expect(validate({ ...ok, site: null }, schema)).toBeNull()
    expect(validate({ ...ok, tags: ['ok', ''] }, schema)).toBe('tags must be an array of non-empty strings')
    expect(validate({ ...ok, weeks: 60 }, schema)).toBe('weeks must be an integer between 1 and 52')
    expect(validate({ ...ok, ownerId: 'abc' }, schema)).toBe('ownerId must be a positive integer id')
    expect(validate({ ...ok, ownerId: '3' }, schema)).toBeNull()
    expect(validate({ ...ok, state: 'draft' }, schema)).toBe('state must be one of: open, closed')
  })
})

describe('validate (PUT, partial)', () => {
  it('needs at least one known field', () => {
    expect(validate({ other: 1 }, schema, { partial: true })).toMatch(/^Provide at least one field to update: name, email/)
  })
  it('does not require the required fields', () => {
    expect(validate({ weeks: 12 }, schema, { partial: true })).toBeNull()
    expect(validate({ email: 'x' }, schema, { partial: true })).toBe('email must be a valid email address')
  })
})

describe('pick', () => {
  it('keeps schema fields only, trims strings and converts ids', () => {
    expect(pick({ name: ' A ', tags: [' x '], ownerId: '4', weeks: 3, extra: 'drop' }, schema))
      .toEqual({ name: 'A', tags: ['x'], ownerId: 4, weeks: 3 })
    expect(pick(undefined, schema)).toEqual({})
  })
})
