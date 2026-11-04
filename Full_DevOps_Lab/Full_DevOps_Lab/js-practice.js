// Lab 5 – Part 2: JavaScript Practice
// Run with: node js-practice.js

// ---------------------------------------------------------------------------
// 2.1 Variables and Data Types
// ---------------------------------------------------------------------------
const hospitalName = 'Central Hospital'
let numberOfDoctors = 12
let isOpen = true

function logHospitalStatus () {
  if (isOpen) {
    console.log(
      `Welcome to ${hospitalName}! We have ${numberOfDoctors} doctors currently available.`
    )
  } else {
    console.log(`Sorry, ${hospitalName} is currently closed. Please come back later.`)
  }
}

console.log('=== 2.1 Variables and Data Types ===')
logHospitalStatus()
isOpen = false // change the Boolean
logHospitalStatus()
console.log(
  'Types:',
  typeof hospitalName,
  typeof numberOfDoctors,
  typeof isOpen
)

// ---------------------------------------------------------------------------
// 2.2 Working with Arrays and Loops
// ---------------------------------------------------------------------------
console.log('\n=== 2.2 Arrays and Loops ===')
const doctors = ['Dr. Lee', 'Dr. Khan', 'Dr. Martin', 'Dr. Nguyen', 'Dr. Rossi']

for (const [index, doctor] of doctors.entries()) {
  console.log(`Doctor #${index + 1}: ${doctor}`)
}

doctors.push('Dr. Dubois')
numberOfDoctors = doctors.length
console.log(`A new doctor joined. Total doctors: ${doctors.length}`)

function findDoctor (name) {
  return doctors.includes(name) ? 'Doctor found' : 'Doctor not found'
}

console.log(`findDoctor('Dr. Khan')  ->`, findDoctor('Dr. Khan'))
console.log(`findDoctor('Dr. House') ->`, findDoctor('Dr. House'))

// ---------------------------------------------------------------------------
// 2.3 Objects and Nested Data
// ---------------------------------------------------------------------------
console.log('\n=== 2.3 Objects and Nested Data ===')
const patient = {
  name: 'Alice Martin',
  age: 34,
  conditions: ['diabetes', 'hypertension'],
  doctor: { name: 'Dr. Lee', specialty: 'Cardiology' }
}

console.log('Doctor name:', patient.doctor.name)
console.log('Number of conditions:', patient.conditions.length)
console.log(
  `${patient.name} is treated by ${patient.doctor.name} (${patient.doctor.specialty}).`
)

patient.conditions.push('anxiety') // add a condition dynamically
console.log('Updated patient:', JSON.stringify(patient, null, 2))

// ---------------------------------------------------------------------------
// 2.4 Functions and Array Filtering
// ---------------------------------------------------------------------------
console.log('\n=== 2.4 Functions and Array Filtering ===')
const patients = [
  { id: 1, name: 'Alice', age: 34 },
  { id: 2, name: 'John', age: 45 },
  { id: 3, name: 'Marie', age: 29 }
]

const filterByAge = (minAge) => patients.filter((p) => p.age > minAge)

function addPatient (name, age) {
  const id = Math.max(0, ...patients.map((p) => p.id)) + 1
  const newPatient = { id, name, age }
  patients.push(newPatient)
  return newPatient
}

console.log('Patients older than 30:', filterByAge(30))
addPatient('Lucas', 52)
addPatient('Emma', 23)
console.log('Updated patient list:', patients)

// ---------------------------------------------------------------------------
// 2.5 Modularization -> see hospitalData.js and main.js (run: node main.js)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// 2.6 Error Handling and Validation
// ---------------------------------------------------------------------------
console.log('\n=== 2.6 Error Handling and Validation ===')
function createAppointment (doctor, patient, date) {
  if (!doctor || !patient || !date) {
    throw new Error('Missing required fields')
  }
  return { doctor, patient, date }
}

try {
  console.log(createAppointment('Dr. Lee', 'Alice', '2025-03-15'))
  console.log(createAppointment('Dr. Lee')) // should trigger error
} catch (err) {
  console.error('Error:', err.message)
}

// ---------------------------------------------------------------------------
// 2.7 Asynchronous Code
// ---------------------------------------------------------------------------
function getHospitalData () {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ name: hospitalName, uptime: 1234 })
    }, 1000)
  })
}

async function showData () {
  console.log('\n=== 2.7 Asynchronous Code ===')
  console.log('Fetching hospital data...')
  const data = await getHospitalData()
  console.log('Data loaded:', data)
}

showData()
