# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

PortfolioX is a personal portfolio for recruiters, hiring managers, and technical interviewers evaluating a new-graduate software engineer through real project evidence, ownership boundaries, and engineering decisions.

## Product Purpose

Present the owner's work as memorable, art-directed project stories that remain fast to scan and technically credible. Success means a visitor can understand what each system does, what the owner personally built, and which evidence supports the claims.

## Positioning

PortfolioX is art-first and recruiter-readable: each project receives a distinct narrative choreography inside one shared portfolio world instead of being reduced to a generic card grid or resume template.

## Operating Context

Visitors enter through a WebGL poster gallery, open `/project/:id` case studies, and move between visual evidence, architecture, product decisions, limitations, and the owner's role. The site must work across desktop, notebook, tablet, and mobile layouts.

## Capabilities and Constraints

- React and Vite web application with shared project data, WebGL gallery posters, custom project-detail renderers, responsive CSS, and accessible DOM content.
- Project claims must follow repository source-of-truth documents and current evidence.
- Private data, identifiers, secrets, unverified metrics, and unsupported deployment claims must not appear in public assets or copy.
- Source changes remain local for owner review before commit, push, or deployment.

## Brand Commitments

- Preserve the established black/red editorial room, display typography, metal/glass material language, and authored motion.
- Preserve each project's individuality without flattening the portfolio into a generic recruiter landing page.
- Prefer direct, evidence-backed language over marketing hype.

## Evidence on Hand

- Project metadata and media under `src/data/projects.js` and `public/assets/`.
- Shared and page-specific case-study implementations under `src/components/ProjectDetails*`.
- Canonical project briefs under `docs/projects/`, including the Hermes Command Center source-of-truth and capture plan.
- Veluma's creator-authored vision and selected cover direction: [Veluma product vision](docs/projects/veluma-product-vision.md). Its mood, color and personal character are part of the product purpose; consult this before refining its cover or case study.
- Sanitized Hermes product screenshots are not yet approved for public use; future media must pass the documented privacy and evidence gates.

## Product Principles

1. Let the artifact lead, then make ownership and technical depth easy to verify.
2. Treat code, approved documents, and sanitized media as source truth.
3. Explain systems spatially and sequentially instead of replacing evidence with long prose.
4. Preserve honest boundaries: configured, executed, delivered, and verified are different states.
5. Keep every project readable and meaningful without animation or a wide viewport.

## Accessibility & Inclusion

Maintain semantic headings and lists, visible keyboard focus, reduced-motion support, readable contrast, large touch targets, and responsive layouts that preserve diagram meaning instead of shrinking it into illegibility.
