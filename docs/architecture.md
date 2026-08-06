# Definedge Community API Architecture

## Purpose

Provide a stable communication layer between NodeBB and external applications.

---

## Principle

External applications must never communicate directly with NodeBB.

Instead:

Next.js

↓

Definedge Community API

↓

NodeBB Core

---

## Benefits

- Upgrade Safety
- Stable APIs
- Better Security
- Better Performance
- Business Logic Isolation
- Easier Testing

---

## Layers

Controller

↓

Service

↓

Repository

↓

NodeBB

---

## Responsibilities

### Controller

Receive requests

Validate request

Return response

### Service

Business Logic

Permissions

Workflow

### Repository

NodeBB Data Access

### Helpers

Response

Logger

Utilities

### Middleware

Authentication

Authorization

Validation
