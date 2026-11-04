// Lab 5 – 2.5 Modularization: entry point
// Run with: node main.js
import {
  doctors,
  addDoctor,
  findDoctor,
  filterByAge,
  addPatient,
  patients
} from './hospitalData.js'

addDoctor('Dr. Martin')
console.log('Updated doctors:', doctors)
console.log(`findDoctor('Dr. Martin'):`, findDoctor('Dr. Martin'))

addPatient('Lucas', 52)
console.log('All patients:', patients)
console.log('Patients older than 30:', filterByAge(30))
