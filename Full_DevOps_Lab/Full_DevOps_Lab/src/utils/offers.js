/**
 * Internship offers — epic "Internship Offer Management" (SCRUM-7), story SCRUM-41.
 * User stories covered: create an offer (SCRUM-20), edit an offer (SCRUM-21),
 * search offers (SCRUM-22), filter by location or field (SCRUM-23),
 * view the offers of my company (SCRUM-34).
 */
import { createStore } from './store.js'
import { validate, pick } from './validate.js'
import { findCompany } from './companies.js'

export const OFFER_STATUSES = ['open', 'closed']

export const OFFER_SCHEMA = {
  companyId: { type: 'id', required: true },
  title: { type: 'string', required: true },
  field: { type: 'string', required: true },
  location: { type: 'string', required: true },
  durationWeeks: { type: 'int', min: 1, max: 52, required: true },
  description: { type: 'string' },
  status: { type: 'enum', values: OFFER_STATUSES }
}

const store = createStore([
  { id: 1, companyId: 1, title: 'Data Analyst Intern', field: 'Data', location: 'Paris', durationWeeks: 24, description: 'Build dashboards and analyse customer data with Python and SQL.', status: 'open', publishedAt: '2026-10-20' },
  { id: 2, companyId: 2, title: 'DevOps Engineer Intern', field: 'Cloud', location: 'Lyon', durationWeeks: 20, description: 'Automate CI/CD pipelines and cloud deployments.', status: 'open', publishedAt: '2026-10-22' },
  { id: 3, companyId: 1, title: 'Machine Learning Intern', field: 'AI', location: 'Paris', durationWeeks: 24, description: 'Train and evaluate recommendation models.', status: 'closed', publishedAt: '2026-09-15' }
])

export const resetOffers = () => store.reset()
export const findOffer = id => store.find(id)

/** Adds the company name, so clients do not need a second request. */
export const withCompany = offer => offer && { ...offer, companyName: findCompany(offer.companyId)?.name ?? null }

/**
 * Lists offers with optional search and filters (all case-insensitive):
 * q (in title or description), location, field, status, companyId.
 */
export function listOffers ({ q, location, field, status, companyId } = {}) {
  const lower = s => String(s).toLowerCase()
  return store.list()
    .filter(o =>
      (q === undefined || lower(o.title + ' ' + o.description).includes(lower(q))) &&
      (location === undefined || lower(o.location) === lower(location)) &&
      (field === undefined || lower(o.field) === lower(field)) &&
      (status === undefined || o.status === status) &&
      (companyId === undefined || o.companyId === Number(companyId))
    )
    .map(withCompany)
}

/** True while at least one offer belongs to the company (used to refuse deleting it). */
export const companyHasOffers = companyId => store.list().some(o => o.companyId === Number(companyId))

export const validateOffer = (body, options) => validate(body, OFFER_SCHEMA, options)
export const addOffer = body => store.add({
  description: null,
  status: 'open',
  ...pick(body, OFFER_SCHEMA),
  publishedAt: new Date().toISOString().slice(0, 10)
})
export const updateOffer = (id, body) => store.update(id, pick(body, OFFER_SCHEMA))
export const deleteOffer = id => store.remove(id)
