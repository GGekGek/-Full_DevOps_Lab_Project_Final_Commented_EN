// Lab 5 – 2.5 Modularization: data + functions
export const doctors = ['Dr. Lee', 'Dr. Khan']

export const patients = [
  { id: 1, name: 'Alice', age: 34 },
  { id: 2, name: 'John', age: 45 },
  { id: 3, name: 'Marie', age: 29 }
]

export function addDoctor (name) {
  doctors.push(name)
}

export function findDoctor (name) {
  return doctors.includes(name) ? 'Doctor found' : 'Doctor not found'
}

export function filterByAge (minAge) {
  return patients.filter((p) => p.age > minAge)
}

export function addPatient (name, age) {
  const id = Math.max(0, ...patients.map((p) => p.id)) + 1
  const newPatient = { id, name, age }
  patients.push(newPatient)
  return newPatient
}
