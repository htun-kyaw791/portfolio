import type { Project, ProjectType } from "@/types";

export const projectTypes: ProjectType[] = ["favorite", "web", "frontend", "business", "ecommerce", "finance", "archive"];

/** Early learning projects: hidden from the default list, shown via the "archive" filter. */
export const isArchived = (p: Project) => p.type.includes("archive");

export const projects: Project[] = [
  {
    "slug": "fluffy-motion",
    "name": "Silent Blade Society",
    "description": "An animation-heavy landing page built for a frontend assessment: a preloader, a horizontally-travelling hero with eight parallax depth planes driven by one scroll value, sprite-sheet frame sequences, and a collection overlay. Motion recreated from a reference site with original artwork.",
    "date": "2026",
    "type": [
      "web",
      "frontend"
    ],
    "technos": [
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "Motion",
      "Lenis"
    ],
    "link": "https://fluffy-motion.vercel.app",
    "repoLink": "https://github.com/htun-kyaw791/fluffy-motion",
    "role": "Frontend Developer",
    "architecture": [
      "Sticky horizontal scroll track",
      "Shared scroll-progress parallax context",
      "CSS steps() sprite animation",
      "Statically prerendered single page"
    ],
    "achievements": [
      "Eight parallax layers animate per frame without React re-renders",
      "Wheel, touch, keyboard and scrollbar all keep working — the page never scrolls sideways",
      "No GSAP or UI kit; one animation runtime"
    ]
  },
  {
    "slug": "rezerv-datatable",
    "name": "Rezerv Data Table",
    "description": "A generic, fully typed data table built from scratch — no TanStack Table or AG Grid. Sorting, filtering, pagination, expandable child rows, pinned columns, column visibility, skeleton states and server-driven mode, with a live documentation page for every variant.",
    "date": "2026",
    "type": [
      "web",
      "frontend"
    ],
    "technos": [
      "Next.js",
      "TypeScript",
      "React",
      "Tailwind CSS"
    ],
    "link": "https://rezerv-datatable.vercel.app",
    "repoLink": "https://github.com/htun-kyaw791/rezerv-datatable",
    "role": "Frontend Developer",
    "architecture": [
      "lib/ — pure pipeline logic, no React",
      "hooks/ — state, no JSX",
      "components/ — rendering, no logic",
      "Typed column helper (columns as data)"
    ],
    "achievements": [
      "Client-side and server-driven modes (2,000-row invoices demo)",
      "Inline and on-demand child rows",
      "Edge-case toolbar for latency, failed fetches and empty data"
    ]
  },
  {
    "slug": "flowdesk",
    "name": "FlowDesk",
    "description": "An internal productivity platform combining project management, release management, documentation, knowledge sharing, reporting dashboards, and support workflows.",
    "date": "2025",
    "type": [
      "favorite",
      "web",
      "business"
    ],
    "technos": [
      "Node.js",
      "React",
      "MySQL",
      "REST API",
      "Ant Design",
      "Tailwind CSS"
    ],
    "link": "",
    "repoLink": "",
    "image": "/projects/flowdesk.webp",
    "role": "Technical Lead & Full Stack Developer",
    "scale": "Internal platform used by development, QA, support and business teams",
    "businessImpact": "Reduced manual documentation, release tracking and reporting effort across departments.",
    "responsibilities": [
      "Designed architecture",
      "Mentored junior React developers",
      "Built release management module",
      "Built reporting dashboards",
      "Implemented document management"
    ],
    "achievements": [
      "Centralized project documentation",
      "Replaced manual release-note tracking",
      "Adopted by support and QA teams"
    ],
    "architecture": [
      "React SPA",
      "REST APIs",
      "Modular Design"
    ]
  },
  {
    "slug": "odoo-approval-web-portal",
    "name": "Odoo Approval Web Portal",
    "description": "A metadata-driven approval platform integrated with Odoo ERP. Supports configurable workflows, dynamic forms, approval chains, reusable module registration, role-based permissions, and business-rule driven approvals.",
    "date": "2025",
    "type": [
      "favorite",
      "web",
      "business"
    ],
    "technos": [
      "Laravel",
      "Livewire",
      "MaryUI",
      "MySQL",
      "PostgreSQL",
      "Odoo API"
    ],
    "link": "",
    "repoLink": "",
    "image": "/projects/odoo-approval-web-portal.webp",
    "role": "Technical Lead & Full Stack Developer",
    "scale": "300+ management users across Finance, Sales, Procurement, Accounting, and Inventory workflows",
    "businessImpact": "Reduced dependency on Odoo licenses by moving approval processes into a configurable web platform.",
    "responsibilities": [
      "Designed overall system architecture",
      "Built metadata-driven workflow engine",
      "Designed dynamic form rendering",
      "Implemented approval chain management",
      "Integrated Odoo APIs",
      "Led development team"
    ],
    "achievements": [
      "Delivered initial version within two months",
      "Supports Budget, Sales, Purchase, Inventory and Accounting approvals",
      "Reduced approximately 300 Odoo users",
      "Built reusable architecture for future modules"
    ],
    "architecture": [
      "Metadata Driven Architecture",
      "Workflow Engine",
      "RBAC",
      "Laravel Livewire",
      "Odoo Integration"
    ]
  },
  {
    "slug": "smart-task-assistance",
    "name": "Smart Task Assistance",
    "description": "A lightweight AI-assisted task management system that parses natural language into structured tasks. Built with FastAPI, React, Tailwind CSS, Python NLP, and MySQL for fast internal workflow capture.",
    "date": "2025",
    "type": [
      "web",
      "business",
      "favorite"
    ],
    "technos": [
      "FastAPI",
      "React",
      "Tailwind CSS",
      "Python",
      "AI / NLP",
      "MySQL"
    ],
    "link": "https://task.htunkyaw.me",
    "repoLink": "https://gitlab.com/my-projects3800633/smark-task",
    "image": "/projects/smart-task-assistance.webp",
    "role": "Full Stack Developer",
    "scale": "Internal tool for task management automation",
    "businessImpact": "Accelerated task creation and management through natural language processing.",
    "responsibilities": [
      "Built NLP pipeline for task parsing",
      "Developed FastAPI backend",
      "Created React frontend",
      "Integrated MySQL database"
    ],
    "achievements": [
      "Implemented AI-powered task creation",
      "Designed responsive UI with Tailwind CSS"
    ],
    "architecture": [
      "FastAPI",
      "React",
      "AI/NLP Pipeline",
      "MySQL"
    ]
  },
  {
    "slug": "winfinance-loan-management-system",
    "name": "WinFinance Loan Management System",
    "description": "Enterprise financial engine for mobile loan applications, automated interest logic, guarantor tracking, multi-step approvals, Odoo API synchronization, queue handlers, SMS alerts, and Firebase status notifications.",
    "date": "2024",
    "type": [
      "web",
      "finance",
      "favorite"
    ],
    "technos": [
      "Laravel",
      "Vue.js",
      "Quasar",
      "MySQL",
      "Firebase Messaging",
      "Odoo API",
      "BoomSMS"
    ],
    "link": "",
    "repoLink": "",
    "image": "/projects/winfinance-loan-management-system.webp",
    "role": "Technical Lead & Full Stack Developer",
    "scale": "Enterprise financial application serving multiple business units",
    "businessImpact": "Streamlined mobile loan application workflows with automated approvals and multi-channel notifications.",
    "responsibilities": [
      "Led full-stack development",
      "Built mobile-first loan application workflows",
      "Implemented automated interest calculations",
      "Integrated Odoo API synchronization",
      "Set up SMS and Firebase notification systems"
    ],
    "achievements": [
      "Delivered scalable enterprise solution",
      "Integrated multiple communication channels",
      "Reduced processing time with queue handlers"
    ],
    "architecture": [
      "Laravel",
      "Vue.js",
      "Quasar",
      "Odoo Integration",
      "Queue Workers"
    ]
  },
  {
    "slug": "training-management-system",
    "name": "Training Management System",
    "description": "Corporate training platform for trainer management, schedules, assessments, and compliance tracking. Uses MySQL application logic with read-only PostgreSQL/Odoo master data boundaries.",
    "date": "2024",
    "type": [
      "web",
      "business"
    ],
    "technos": [
      "Laravel",
      "Vue.js",
      "PostgreSQL",
      "MySQL",
      "Odoo API",
      "DDD"
    ],
    "link": "",
    "repoLink": "",
    "image": "/projects/training-management-system.webp"
  },
  {
    "slug": "meeting-management-system",
    "name": "Meeting Management System",
    "description": "Enterprise meeting management platform supporting meeting planning, minutes of meeting, action plans, KPI meetings, room booking, approvals, and reporting.",
    "date": "2024",
    "type": [
      "favorite",
      "web",
      "business"
    ],
    "technos": [
      "Laravel",
      "Vue.js",
      "Pinia",
      "Firebase Messaging",
      "MySQL",
      "Nginx"
    ],
    "link": "",
    "repoLink": "",
    "image": "/projects/meeting-management-system.webp",
    "role": "Technical Lead & Senior Full Stack Developer",
    "scale": "30,000+ meetings across multiple business units",
    "businessImpact": "Improved performance from over one minute to near-instant response times.",
    "responsibilities": [
      "Maintained entire platform",
      "Optimized database performance",
      "Refactored legacy structures",
      "Implemented caching",
      "Added reporting features"
    ],
    "achievements": [
      "Improved system performance by more than 20x",
      "Migrated legacy data structures",
      "Fixed KPI calculation issues",
      "Reduced technical debt significantly"
    ],
    "architecture": [
      "Laravel",
      "Vue.js",
      "Redis",
      "RBAC"
    ]
  },
  {
    "slug": "psx-multipurpose-classified-app",
    "name": "PSX Multipurpose Classified App",
    "description": "All-in-one multi-vendor classified marketplace with localized mapping, real-time chat, tokenized payment webhooks, multi-channel OAuth, Firebase messaging, and a powerful admin panel.",
    "date": "2023",
    "type": [
      "web",
      "ecommerce",
      "favorite"
    ],
    "technos": [
      "Laravel",
      "Vue.js",
      "Pinia",
      "Tailwind CSS",
      "MySQL",
      "Firebase Messaging",
      "Google Map",
      "OpenStreet Map",
      "Stripe",
      "PayPal",
      "Razorpay",
      "REST API",
      "Service Workers"
    ],
    "link": "https://www.products.panacea-soft.co/psx-mpc-demo",
    "repoLink": "",
    "image": "/projects/psx-multipurpose-classified-app.webp",
    "role": "Full Stack Developer",
    "scale": "Multi-vendor marketplace serving thousands of users",
    "businessImpact": "Unified multiple classified platforms into single marketplace with multi-payment gateway support.",
    "responsibilities": [
      "Developed full-stack features as part of the product team",
      "Built multi-vendor marketplace architecture",
      "Integrated multiple payment gateways",
      "Implemented real-time chat functionality",
      "Designed localization and mapping features"
    ],
    "achievements": [
      "Unified multiple classified platforms",
      "Supported multi-currency transactions",
      "Delivered scalable multi-vendor solution"
    ],
    "architecture": [
      "Laravel",
      "Vue.js",
      "Pinia",
      "Multi-Payment Integration",
      "Real-time Chat"
    ]
  },
  {
    "slug": "umg-matador",
    "name": "UMG Matador",
    "description": "An e-commerce platform for Matador to sell heavy machinery across different branches. Includes a React-based frontend, admin panel, and a Node.js backend for managing inventory, orders, and users.",
    "date": "2025",
    "type": [
      "web",
      "ecommerce",
      "favorite"
    ],
    "technos": [
      "Node.js",
      "React",
      "React Query",
      "ShadCN",
      "PrimeReact"
    ],
    "link": "https://www.umgmatador.com",
    "repoLink": "",
    "image": "/projects/umg-matador.webp",
    "role": "Full Stack Team Lead",
    "scale": "Enterprise e-commerce for heavy machinery across multiple branches",
    "businessImpact": "Enabled multi-branch machinery sales with centralized inventory management.",
    "responsibilities": [
      "Led development team",
      "Built React frontend with modern UI libraries",
      "Developed Node.js backend API",
      "Implemented inventory management system"
    ],
    "achievements": [
      "Delivered cross-branch e-commerce solution",
      "Integrated modern React ecosystem tools"
    ],
    "architecture": [
      "Node.js",
      "React SPA",
      "REST API"
    ]
  },
  {
    "slug": "ps-builder",
    "name": "PS Builder",
    "description": "Centralized deployment and product management dashboard for PSX ecosystems, handling one-click core installations, synchronized script updates, version control, themes, and permissions.",
    "date": "2023",
    "type": [
      "web",
      "favorite"
    ],
    "technos": [
      "Laravel",
      "Vue.js",
      "Pinia",
      "Tailwind CSS",
      "MySQL",
      "REST API"
    ],
    "link": "",
    "repoLink": "",
    "image": "/projects/ps-builder.webp",
    "role": "Full Stack Developer",
    "scale": "Centralized deployment dashboard for PSX ecosystem products",
    "businessImpact": "Automated deployment and version management for multiple products.",
    "responsibilities": [
      "Built centralized deployment panel",
      "Implemented version control integration",
      "Developed theme management system",
      "Created permission handling"
    ],
    "achievements": [
      "One-click deployment capability",
      "Synchronized updates across products",
      "Streamlined product management workflow"
    ],
    "architecture": [
      "Laravel",
      "Vue.js",
      "Pinia",
      "Modular Architecture"
    ]
  },
  {
    "slug": "multi-restaurant-frontend",
    "name": "Multi Restaurant Frontend",
    "description": "A restaurant ordering platform with features such as cart management, branch-based navigation, and location-based restaurant searches.",
    "date": "2023",
    "type": [
      "web",
      "ecommerce"
    ],
    "technos": [
      "Vue.js",
      "TypeScript",
      "Tailwind CSS",
      "Google Map",
      "OpenStreet Map",
      "Firebase Messaging",
      "Stripe",
      "PayPal",
      "Razorpay"
    ],
    "link": "",
    "repoLink": "",
    "image": "/projects/multi-restaurant-frontend.webp"
  },
  {
    "slug": "buy-sell-frontend",
    "name": "Buy Sell Frontend",
    "description": "A buy-and-sell marketplace frontend with user authentication, interactive listings, real-time notifications, and multiple payment options.",
    "date": "2023",
    "type": [
      "web",
      "ecommerce"
    ],
    "technos": [
      "Vue.js",
      "TypeScript",
      "Tailwind CSS",
      "Google Map",
      "OpenStreet Map",
      "Firebase Messaging",
      "Stripe",
      "PayPal",
      "Razorpay"
    ],
    "link": "",
    "repoLink": "",
    "image": "/projects/buy-sell-frontend.webp"
  },
  {
    "slug": "winfinance-landing-page",
    "name": "WinFinance Landing Page",
    "description": "A modern and interactive landing page for WinFinance, built to showcase the platform's features and services. Uses smooth animations, server-side rendering, and optimized performance.",
    "date": "2025",
    "type": [
      "web"
    ],
    "technos": [
      "Next.js",
      "Framer Motion",
      "Aceternity UI",
      "React Query",
      "Zod"
    ],
    "link": "https://www.winfinance.com.mm",
    "repoLink": "",
    "image": "/projects/winfinance-landing-page.webp"
  },
  {
    "slug": "fittrack",
    "name": "FitTrack",
    "description": "A mobile application for tracking daily exercise routines, logging workouts, and setting fitness goals. Users can monitor progress over time, track activities like running, cycling, and weightlifting, and get personalized insights. The app includes authentication, workout history, and performance analytics. Built using Kotlin for Android with a PHP-based web service and a MySQL database for secure data storage.",
    "date": "2025",
    "type": ["archive"],
    "technos": [
      "Kotlin",
      "MySQL",
      "PHP"
    ],
    "link": "",
    "repoLink": "https://github.com/htun-kyaw791/fittrack",
    "image": "/projects/fittrack.webp"
  },
  {
    "slug": "rentalmanager",
    "name": "RentalManager",
    "description": "A Windows application for managing rentals. Users can sign up, sign in, browse items, and rent them. Admins can manage users and rental items with full CRUD functionality and view rental history. Built using C# and .NET with a Microsoft Access (.mdb) database, this project taught me desktop application development, user authentication, and database management.",
    "date": "2022",
    "type": ["archive"],
    "technos": [
      "C#",
      ".NET",
      "WinForms",
      "Microsoft Access"
    ],
    "link": "",
    "repoLink": "https://github.com/htun-kyaw791/rentalmanager",
    "image": "/projects/rentalmanager.webp"
  },
  {
    "slug": "bookworld",
    "name": "BookWorld",
    "description": "A web app for book lovers to explore, purchase, and download PDF books. Users can favorite, comment, and rate books, while premium users access exclusive content. Built with Laravel, JavaScript, Bootstrap, and MySQL, this project taught me payment processing, database management, and AI integration.",
    "date": "2019",
    "type": ["archive"],
    "technos": [
      "Laravel",
      "JavaScript",
      "Bootstrap",
      "MySQL",
      "PHP",
      "HTML",
      "CSS"
    ],
    "link": "",
    "repoLink": "https://github.com/htun-kyaw791/bookworld",
    "image": "/projects/bookworld.webp"
  },
  {
    "slug": "wineshop",
    "name": "WineShop",
    "description": "A simple and elegant e-commerce website for a wine shop. Users can browse wines, add them to their cart, and place orders. Built using jQuery, HTML, CSS, Bootstrap, and FontAwesome for styling. This project helped me understand frontend interactivity, cart management, and order handling.",
    "date": "2018",
    "type": ["archive"],
    "technos": [
      "Bootstrap",
      "jQuery",
      "HTML",
      "CSS"
    ],
    "link": "",
    "repoLink": "https://github.com/htun-kyaw791/wine_shop",
    "image": "/projects/wineshop.webp"
  }
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}
