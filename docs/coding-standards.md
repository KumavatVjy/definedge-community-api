# Coding Standards

## Naming

Controllers

CategoryController

Services

CategoryService

Repositories

CategoryRepository

---

## API

Always

/api/v1/

Never expose NodeBB internal APIs.

---

## Responses

All APIs must return

{
    success,
    message,
    data,
    errors
}

---

## Controllers

Controllers must never contain business logic.

---

## Services

Services contain business logic only.

---

## Repository

Repository communicates with NodeBB only.

---

## Logging

Every error must be logged.

---

## Versioning

Semantic Versioning.
