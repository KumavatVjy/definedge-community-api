# Definedge Community API

> A production-ready NodeBB integration framework for the Definedge ecosystem.

---

## Overview

Definedge Community API is a standalone NodeBB plugin that acts as the communication layer between the Definedge Next.js application and the NodeBB Community Engine.

The plugin provides a stable, versioned REST API while abstracting NodeBB internals from the frontend.

---

## Goals

- Decouple Next.js from NodeBB
- Provide stable REST APIs
- Support future NodeBB upgrades
- Aggregate community data
- Maintain clean architecture
- Production-ready codebase

---

## Architecture

```
Next.js
      │
      ▼
Definedge Community API Plugin
      │
      ▼
NodeBB Core
      │
      ▼
Database
```

---

## Technology Stack

- NodeBB v3.x+
- Node.js
- JavaScript (ES2022)
- REST API
- SSO Integration
- GitHub

---

## Repository Structure

```
plugin/
docs/
examples/
```

---

## Roadmap

- Plugin Framework
- Authentication
- Categories API
- Topics API
- Posts API
- Users API
- Dashboard API
- Notifications
- Search
- Leaderboard
- Production Release

---

## Version

Current Version

v0.1.0

---

## License

MIT