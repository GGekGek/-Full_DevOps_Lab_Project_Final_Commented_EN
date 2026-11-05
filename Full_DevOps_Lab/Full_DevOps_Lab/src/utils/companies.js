/**
 * Companies — epic "Company Management" (SCRUM-11), story SCRUM-40.
 * User stories covered: create a company profile (SCRUM-32), update company
 * information (SCRUM-33), manage contact information (SCRUM-35).
 */
import { createStore } from './store.js'
import { validate, pick } from './validate.js'

export const COMPANY_SCHEMA = {
  name: { type: 'string', required: true },
  sector: { type: 'string', required: true },
  city: { type: 'string', required: true },
  website: { type: 'url' },
  contactName: { type: 'string' },
  contactEmail: { type: 'email', required: true },
  contactPhone: { type: 'string' }
}

const store = createStore([
  { id: 1, name: 'DataNova', sector: 'Data & AI', city: 'Paris', website: 'https://datanova.example.com', contactName: 'Claire Dubois', contactEmail: 'recrutement@datanova.example.com', contactPhone: '+33 1 23 45 67 89' },
  { id: 2, name: 'CloudWorks', sector: 'Cloud', city: 'Lyon', website: null, contactName: 'Marc Leroy', contactEmail: 'jobs@cloudworks.example.com', contactPhone: null }
])

export const resetCompanies = () => store.reset()
export const findCompany = id => store.find(id)

/** All companies, optionally filtered by city (case-insensitive). */
export function listCompanies ({ city } = {}) {
  return store.list().filter(c => city === undefined || c.city.toLowerCase() === city.toLowerCase())
}

export const validateCompany = (body, options) => validate(body, COMPANY_SCHEMA, options)
export const addCompany = body => store.add({ website: null, contactName: null, contactPhone: null, ...pick(body, COMPANY_SCHEMA) })
export const updateCompany = (id, body) => store.update(id, pick(body, COMPANY_SCHEMA))
export const deleteCompany = id => store.remove(id)
