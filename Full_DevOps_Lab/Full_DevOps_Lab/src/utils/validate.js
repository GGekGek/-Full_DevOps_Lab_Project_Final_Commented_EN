/**
 * Schema-based validation shared by every entity.
 *
 * A schema lists the fields of an entity and their rule, e.g.
 *   { email: { type: 'email', required: true }, skills: { type: 'stringArray' } }
 *
 * - validate(body, schema)                    → for POST: required fields must be present
 * - validate(body, schema, { partial: true }) → for PUT: at least one known field
 * Both return an error message (→ HTTP 400) or null when the body is valid.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const URL = /^https?:\/\/\S+$/

const rules = {
  string: { check: v => typeof v === 'string' && v.trim() !== '', hint: () => 'a non-empty string' },
  email: { check: v => typeof v === 'string' && EMAIL.test(v), hint: () => 'a valid email address' },
  url: { check: v => v === null || (typeof v === 'string' && URL.test(v)), hint: () => 'an http(s) URL or null' },
  stringArray: {
    check: v => Array.isArray(v) && v.every(s => typeof s === 'string' && s.trim() !== ''),
    hint: () => 'an array of non-empty strings'
  },
  int: {
    check: (v, r) => Number.isInteger(v) && v >= (r.min ?? -Infinity) && v <= (r.max ?? Infinity),
    hint: r => `an integer between ${r.min} and ${r.max}`
  },
  id: { check: v => Number.isInteger(Number(v)) && Number(v) > 0, hint: () => 'a positive integer id' },
  enum: { check: (v, r) => r.values.includes(v), hint: r => `one of: ${r.values.join(', ')}` }
}

export function validate (body, schema, { partial = false } = {}) {
  const data = body ?? {}
  const fields = Object.keys(schema)
  const sent = fields.filter(field => data[field] !== undefined)

  if (partial && sent.length === 0) {
    return `Provide at least one field to update: ${fields.join(', ')}`
  }
  if (!partial) {
    const missing = fields.filter(field => schema[field].required && data[field] === undefined)
    if (missing.length > 0) return `Missing required fields: ${missing.join(', ')}`
  }
  for (const field of sent) {
    const rule = schema[field]
    const { check, hint } = rules[rule.type]
    if (!check(data[field], rule)) return `${field} must be ${hint(rule)}`
  }
  return null
}

/** Keeps only the schema's fields, trims strings and converts ids to numbers. */
export function pick (body, schema) {
  const out = {}
  for (const [field, rule] of Object.entries(schema)) {
    const value = body?.[field]
    if (value === undefined) continue
    if (rule.type === 'id') out[field] = Number(value)
    else if (typeof value === 'string') out[field] = value.trim()
    else if (rule.type === 'stringArray') out[field] = value.map(s => s.trim())
    else out[field] = value
  }
  return out
}
