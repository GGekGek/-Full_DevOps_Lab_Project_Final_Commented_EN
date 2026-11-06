# DevOps Lab – Student Project (Node.js + Jira/GitHub + CI/CD)

This repository is a **teaching template** for a 4-student DevOps mini-project.
It demonstrates a realistic workflow: **PLAN (Jira) → CODE (Git/VS Code) → BUILD/TEST (GitHub Actions) → REVIEW (PRs) → DEPLOY (optional)**.

> **What you get here**
> - Minimal **Express** API with auto-mounted routes
> - **Vitest + Supertest** for integration & unit tests
> - Coverage thresholds enforced in CI
> - **GitHub Actions** workflow for lint + tests + coverage artifact
> - Clear file layout for a team of 4

---

## Quickstart

```bash
npm ci
npm run dev          # http://localhost:3000
npm test -- --coverage
```

Open `coverage/index.html` for a visual coverage report (locally).

---

## Routes

- `GET /` – basic JSON greeting
- `GET /health` – health check (200 OK)
- `GET /version` – returns `{ version }` from `package.json`
- `GET /info` – returns `{ name, version, node, uptime }`
- `GET /boom` – triggers an error to test the global error handler

### Internship Application API (Jira project SCRUM)

Every entity exposes the same CRUD pattern: `GET /api/<entity>`, `GET /api/<entity>/:id`, `POST`, `PUT /:id` (partial update) and `DELETE /:id`. Errors are `{ error: true, message }` with 400 (invalid body), 404 (unknown id) or 409 (conflict).

| Entity | Route | Epic | Extra |
|---|---|---|---|
| Student | `/api/students` | SCRUM-6 Student Profile Management (SCRUM-39) | filters `?program=`, `?skill=`; 409 if the email is already used or (on delete) while it has applications |
| Company | `/api/companies` | SCRUM-11 Company Management (SCRUM-40) | filter `?city=`; `GET /api/companies/:id/offers`; 409 on delete while it has offers |
| Offer | `/api/offers` | SCRUM-7 Internship Offer Management (SCRUM-41) | search `?q=`, filters `?location=`, `?field=`, `?status=`, `?companyId=`; 404 if the company does not exist; 409 on delete while it has applications |
| Application | `/api/applications` | SCRUM-8 Application Management (SCRUM-42) | filters `?studentId=`, `?offerId=`, `?companyId=`, `?status=`; POST starts as `pending`, 409 if the offer is closed or the student already applied; PUT changes `status` (pending / accepted / rejected) or `message` |
| Monitoring | `GET /api/monitoring/students` | SCRUM-10 School Monitoring (SCRUM-43) | read-only; `internshipStatus` = placed / applying / searching, computed from the applications; `?status=searching` lists students without an internship; `?program=` |
| Metrics | `GET /api/metrics` | (DEVOPS-12, adapted in SCRUM-43) | uptime status + counts of students, students without internship, companies, offers and applications |

The Postman collection is `postman/Internship Application API.postman_collection.json` (v2.1). Import it, start the API with `npm run dev`, then run the whole collection (in order: later requests reuse the ids created earlier).

The hospital example (doctors, patients, appointments) used in the first lab sessions was replaced by this API in SCRUM-43; it remains in the git history (DEVOPS-9 to DEVOPS-16).

Lab 5 JavaScript exercises are in `js-practice.js`, plus `hospitalData.js` and `main.js` (run with `node js-practice.js` and `node main.js`).

Routes are **auto-mounted** from `src/routes/auto/*.route.js` so each student can add a file without touching `src/app.js` (fewer merge conflicts).

---

## Tests

- **Integration tests** (Supertest) target HTTP endpoints in `test/*.test.js`.
- **Unit tests** target internal logic in `test/unit/*.test.js`.

Coverage thresholds (Lines/Functions/Statements ≥ 80%, Branches ≥ 70%) are set in `package.json`.  
If coverage drops below thresholds, CI fails and blocks the merge (quality gate).

---

## Branch & Commit Convention (Jira-friendly)

- Branch: `feature/<ISSUE-KEY>-<short-desc>` → e.g., `feature/SHMS-12-info-endpoint`
- Commit: `feat(<ISSUE-KEY>): <what>` → e.g., `feat(SHMS-12): implement /info endpoint`
- PR title: `<ISSUE-KEY> | <title>` → e.g., `SHMS-12 | Add /info endpoint`

If you install **GitHub for Jira**, issues will link automatically when the key appears in branch/commit/PR.

---

## CI (GitHub Actions)

A workflow is included at `.github/workflows/ci.yml` that runs on pushes and PRs to `main`:

- Install Node and deps
- `npm run lint`
- `npm test -- --coverage`
- Upload `coverage/` as an artifact

> Badge (enable after first run):
>
> ```md
> ![CI](https://github.com/<org>/<repo>/actions/workflows/ci.yml/badge.svg)
> ```

---

## Project layout

```
src/
  app.js          # Express app (auto-mount + global error handler)
  index.js        # server entry (not used by tests)
  routes/auto/    # students add *.route.js files here
  utils/          # small testable helpers
test/
  *.test.js       # integration (HTTP) tests
  unit/*.test.js  # pure unit tests
```

---

## Useful scripts

- `npm run dev` – start dev server with nodemon
- `npm test` – run all tests (Vitest)
- `npm test -- --coverage` – with coverage
- `npm run lint` – ESLint check

Enjoy the lab!
