import type { ProjectRecord } from '../projectTypes';

const project = {
    id: 'freeflow' as const,
    title: 'FreeFlow',
    category: 'FREELANCE OPS • AUG 2025',
    year: 'AUG 2025',
    description: 'When client talk, job files, and invoices split across tools, freelancers lose the trail. FreeFlow keeps ops in one workspace.',
    fullDescription: 'FreeFlow is a freelance operations platform for freelancers and small teams. The product is the back-office workspace: clients, quotations, projects, invoices, appointments, templates, files, and dashboard follow-up inside one organization-scoped system. LINE OA is an implemented intake path into that workspace; additional messaging channels remain roadmap rather than a multi-chat product claim.',
    tags: ['React 19', 'TypeScript', 'Material UI', 'TanStack Query', 'Socket.IO', 'Go Fiber', 'PostgreSQL', 'MinIO', 'Docker'],
    coverImage: '/assets/project-covers/freeflow-cover-v4.webp',
    heroMedia: { image: '/assets/project-covers/freeflow-cover-v4.webp', kind: 'cover' },
    link: 'https://bscit.sit.kmutt.ac.th/capstone25/cp25pl2/',
    repo: 'https://gitlab.com/freeflow-capstone/freeflow-service',
    code: `// Identity lifecycle routes implemented by the FreeFlow auth service.
auth.Post("/register", authHandler.Register)
auth.Get("/verify", authHandler.VerifyEmail)
auth.Post("/login", authHandler.Login)
auth.Post("/refresh", authHandler.RefreshToken)
auth.Post("/forgot-password", authHandler.ForgotPassword)
auth.Post("/reset-password", authHandler.ResetPassword)`,
    gallery: [
      {
        image: '/assets/freeflow/product-overview-poster.png',
        video: '/assets/freeflow/product-overview.mp4',
      },
      {
        image: '/assets/freeflow/unified-inbox-poster.png',
        video: '/assets/freeflow/unified-inbox.mp4',
      },
      {
        image: '/assets/freeflow/business-dashboard-poster.png',
        video: '/assets/freeflow/business-dashboard.mp4',
      },
    ],
    galleryLabels: ['Freelance workspace', 'Client intake (LINE)', 'Business board'],
    galleryDescriptions: [
      'One sidebar runs the freelance day: dashboard, meetings, and reusable document templates.',
      'When a client reaches in through LINE, quotes and files stay on the same client/job record.',
      'Unpaid invoices, meetings, and active jobs return to one ops board.',
    ],
    role: 'Backend Engineer',
  } satisfies ProjectRecord;
export default project;
