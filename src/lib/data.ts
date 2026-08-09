export const profile = {
  name: "Karthik B",
  initials: "KB",
  tagline: "Full-Stack Engineer, AI/ML Researcher & Embedded Systems Builder",
  location: "Chennai, Tamil Nadu, India",
  email: "bkarthik0404@gmail.com",
  links: {
    github: "https://github.com/KArT4206",
    linkedin: "https://www.linkedin.com/in/karthikb-0b8905362",
  },
  summary:
    "Final-year Computer Science undergraduate at VIT Chennai building production-grade full-stack platforms, applied AI/computer-vision systems, and embedded fog-computing research. Best Paper Award-winning researcher with hands-on experience across React/Next.js, NestJS, PostgreSQL, ESP32 embedded systems, and multi-heuristic cybersecurity detection.",
  heroLines: [
    "I build systems end-to-end —",
    "from database schema to dashboard,",
    "from sensor to signal.",
  ],
};

export const education = {
  school: "Vellore Institute of Technology, Chennai",
  degree: "B.Tech, Computer Science & Engineering (SCOPE)",
  dates: "2023 – 2027 (Expected)",
  coursework: [
    "Data Structures & Algorithms",
    "Operating Systems",
    "Database Systems",
    "Object-Oriented Programming",
    "Computer Networks",
  ],
};

export type SkillCategory = {
  category: string;
  items: string[];
};

export const skills: SkillCategory[] = [
  {
    category: "Languages",
    items: ["Python", "C", "C++", "Java", "JavaScript", "TypeScript", "SQL", "PHP", "R"],
  },
  {
    category: "Full-Stack",
    items: ["React.js", "Next.js", "NestJS", "Node.js", "Flask", "REST APIs", "WebSockets", "Tailwind CSS"],
  },
  {
    category: "AI / ML & Computer Vision",
    items: ["PyTorch", "OpenCV", "YOLOv8", "MobileNetV2", "Scikit-learn", "Hidden Markov Models", "NLP"],
  },
  {
    category: "Cybersecurity",
    items: ["RBAC", "JWT & argon2", "Multi-Factor Auth", "TLS/WHOIS Analysis", "Behavioral Biometrics"],
  },
  {
    category: "Embedded Systems & IoT",
    items: ["ESP32", "ESP8266", "STM32", "Arduino", "LoRa", "NRF24L01", "Sensor Fusion", "PCB Design"],
  },
  {
    category: "Data & Infrastructure",
    items: ["PostgreSQL", "MySQL", "Prisma", "Redis", "BullMQ", "Docker", "Git", "Prometheus"],
  },
];

export type Project = {
  slug: string;
  title: string;
  shortTitle: string;
  tagline: string;
  status: "In Development" | "Completed" | "Research";
  category: ("Full-Stack" | "AI/ML" | "Embedded" | "Cybersecurity")[];
  featured: boolean;
  tech: string[];
  repoUrl?: string;
  overview: string;
  role: string;
  problem: string;
  solution: string[];
  results: { label: string; value: string }[];
};

export const projects: Project[] = [
  {
    slug: "egmp",
    title: "Enrollment Governance & Management Platform",
    shortTitle: "EGMP",
    tagline: "An enterprise government platform, built solo end-to-end.",
    status: "In Development",
    category: ["Full-Stack", "Cybersecurity"],
    featured: true,
    tech: ["Next.js 15", "React 19", "TypeScript", "NestJS 11", "Prisma", "PostgreSQL", "Redis", "BullMQ", "WebSockets"],
    overview:
      "A full-stack enterprise governance platform for managing government enrollment operations — role-specific Admin, Coordinator, and Operator portals with dashboards, ticketing, GPS-based field tracking, and analytics reporting.",
    role:
      "Independently architected and built both the frontend and backend — system design, API contracts, database schema, and UI/UX — across 16 completed engineering milestones.",
    problem:
      "Government enrollment operations at scale need auditable role-based access, real-time visibility into field operators, and reporting that doesn't fall over under real usage — with no off-the-shelf platform that does all three without heavy customization.",
    solution: [
      "Designed RBAC with JWT authentication, argon2 password hashing, and Redis-cached per-request session validation enforced on every API route.",
      "Built an asynchronous processing layer using BullMQ for report generation, scheduled email, and SLA monitoring, backed by a Redis pub/sub-driven WebSocket gateway for real-time dashboard and ticketing updates.",
      "Engineered a streaming Excel/PDF/CSV export pipeline with Redis-cached, write-invalidated analytics aggregations across admin, coordinator, and operator dashboards.",
      "Optimized production performance with evidence-based PostgreSQL indexing, N+1 elimination, and Prometheus metrics instrumentation, validated with custom load-testing scripts.",
      "Hardened the platform with security-event audit logging, rate limiting, full HTTP security headers, and a dedicated security review.",
    ],
    results: [
      { label: "Engineering milestones shipped", value: "16" },
      { label: "Automated test coverage", value: "276 unit + 146 e2e" },
      { label: "Ownership", value: "Solo, full-stack" },
    ],
  },
  {
    slug: "fog-esp32-anomaly-detection",
    title: "Fog-Based Multi-Node Environmental Anomaly Detection on ESP32",
    shortTitle: "Fog Computing Research",
    tagline: "Sub-200ms fire & intrusion detection, entirely on ₹2,356 of hardware.",
    status: "Research",
    category: ["Embedded", "AI/ML"],
    featured: true,
    tech: ["ESP32", "Fog/Edge Computing", "Sensor Fusion", "C++", "HTTP", "F1 / AUC-ROC / MCC Analysis"],
    overview:
      "Co-authored research paper proposing a three-tier fog-computing safety system built entirely on commodity ESP32 microcontrollers, delivering cloud-free, sub-200ms fire and intrusion detection.",
    role:
      "Co-author — contributed to system architecture, the dual-modality decision engine, and experimental evaluation.",
    problem:
      "Cloud-mediated IoT safety systems can take seconds to round-trip a decision — too slow for fire or intrusion response — and single-sensor thresholding produces high false-positive rates from cooking fumes, aerosols, or passing animals.",
    solution: [
      "Designed a context-aware dual-modality sensor-fusion algorithm — gas + luminosity for fire, PIR + acoustic for intrusion — requiring two independent physical channels to agree before triggering an alarm.",
      "Calibrated operating thresholds via an F1-maximizing sweep over 1,500 labeled observations rather than datasheet defaults.",
      "Built a three-tier architecture: two edge sensor nodes streaming telemetry over local Wi-Fi to a static-IP ESP32 fog server that aggregates, decides, actuates, and hosts a self-refreshing dashboard — no cloud dependency at all.",
    ],
    results: [
      { label: "F1-score (fire / intrusion)", value: "95.0% / 95.2%" },
      { label: "AUC-ROC", value: "0.974 / 0.981" },
      { label: "False-positive reduction", value: "65% (17% → 6%)" },
      { label: "End-to-end latency", value: "180ms avg (13.3x faster than cloud MQTT)" },
      { label: "Wireless packet delivery", value: "97.3% over 60 min" },
      { label: "Total hardware cost", value: "₹2,356 (~$28)" },
    ],
  },
  {
    slug: "traffic-monitoring-smart-cities",
    title: "Intelligent Traffic Monitoring for Real-Time Vehicle Tracking in Smart Cities",
    shortTitle: "Smart-City Traffic Monitoring",
    tagline: "Best Paper Award — ICDSBS 2026 (IEEE Madras & Singapore Sections).",
    status: "Research",
    category: ["AI/ML", "Embedded"],
    featured: true,
    tech: ["YOLOv8", "MobileNetV2", "Computer Vision", "Embedded Systems"],
    overview:
      "Co-authored and presented at the 3rd International Conference on Data Science and Business Systems (ICDSBS 2026), organized with IEEE Madras & Singapore Sections at SRM Institute of Science and Technology — received the Best Paper Award.",
    role: "Co-author — applied computer vision models and embedded integration for adaptive signal control.",
    problem:
      "Static traffic-signal timing doesn't respond to real conditions, and smart-city vehicle-tracking systems need to run detection fast enough to drive live signal decisions.",
    solution: [
      "Applied YOLOv8 and MobileNetV2 for real-time vehicle detection and classification.",
      "Integrated detection output with embedded systems to drive adaptive, traffic-responsive signal management for smart-city deployment.",
    ],
    results: [{ label: "Recognition", value: "Best Paper Award, ICDSBS 2026" }],
  },
  {
    slug: "phishing-detection-platform",
    title: "Advanced Multi-Heuristic Phishing Detection Platform",
    shortTitle: "Phishing Detection",
    tagline: "TLS, WHOIS, OCR, and CLIP visual similarity — fused into one trust score.",
    status: "Completed",
    category: ["Cybersecurity", "AI/ML"],
    featured: true,
    tech: ["Python", "Flask", "TLS/WHOIS Analysis", "OCR", "CLIP Visual Similarity", "Decision Tree", "Random Forest", "XGBoost"],
    repoUrl: "https://github.com/KArT4206/advanced_phishing_detection",
    overview:
      "A Flask-based multi-heuristic phishing detection platform that classifies URLs as Safe, Suspicious, or Phishing by combining certificate, domain, and visual-similarity signals.",
    role: "Designed and built the detection platform; presented the accompanying research.",
    problem:
      "Single-signal phishing detectors (blacklists, or URL-string heuristics alone) miss well-crafted lookalike pages and fresh domains that haven't been blacklisted yet.",
    solution: [
      "Combined TLS certificate validation, WHOIS domain analysis, OCR, and CLIP-based visual similarity into a single trust score.",
      "Presented the accompanying research, \"Multi-Heuristic Phishing Detection System Using TLS, WHOIS, and OCR,\" at ICAISDGs 2025.",
      "Separately implemented and benchmarked a machine-learning classifier comparing Decision Tree, Random Forest, and XGBoost on extracted URL features.",
    ],
    results: [{ label: "Presented at", value: "ICAISDGs 2025" }],
  },
  {
    slug: "biometric-authentication",
    title: "Multi-Factor Biometric Authentication System",
    shortTitle: "Biometric Auth",
    tagline: "Password + face + typing rhythm, fused into one login.",
    status: "Completed",
    category: ["Cybersecurity", "AI/ML"],
    featured: false,
    tech: ["Python", "OpenCV", "Facial Recognition", "Keystroke Dynamics", "Hidden Markov Models"],
    repoUrl: "https://github.com/KArT4206/Multi-Factor-Biometric-Authentication-System-using-Keystroke-Dynamics-and-Face-Recognition",
    overview:
      "A multi-factor authentication system that verifies identity using typing rhythm and facial recognition alongside a traditional password.",
    role: "Designed and built the full authentication system.",
    problem: "Single-factor and even standard 2FA can be phished or replayed; behavioral signals are harder to spoof.",
    solution: [
      "Combined password verification, facial recognition, and keystroke-dynamics analysis into one authentication flow.",
      "Built a companion authenticator using Hidden Markov Models to verify identity from typing-rhythm patterns during login and registration.",
    ],
    results: [{ label: "Factors combined", value: "3 (knowledge + face + behavior)" }],
  },
  {
    slug: "vibehive",
    title: "VibeHive — Full-Stack Social Blogging Platform",
    shortTitle: "VibeHive",
    tagline: "Blogging + real-time chat, with admin moderation baked in.",
    status: "Completed",
    category: ["Full-Stack"],
    featured: false,
    tech: ["PHP", "JavaScript", "MySQL", "Real-Time Chat", "Session Auth"],
    repoUrl: "https://github.com/KArT4206/Vibe-hive_SocialBloggingMadeEasy",
    overview: "A full-stack social blogging platform connecting people through blogs and real-time chat.",
    role: "Built the full stack end-to-end.",
    problem: "Most lightweight blogging platforms bolt chat on as an afterthought, with weak moderation controls.",
    solution: [
      "Built real-time chat, secure authentication, and admin moderation controls for content and user management.",
    ],
    results: [{ label: "Type", value: "Full-stack, solo build" }],
  },
];

export const featuredProjects = projects.filter((p) => p.featured);

export type ExperienceEntry = {
  org: string;
  role: string;
  dates: string;
  location: string;
  bullets: string[];
};

export const experience: ExperienceEntry[] = [
  {
    org: "Team Blitz Racing",
    role: "Electronics & Embedded Systems Division",
    dates: "Sep 2024 – Present",
    location: "Chennai, India",
    bullets: [
      "Developed a radio-based pit-to-driver communication system and a wireless telemetry module streaming speed, RPM, battery voltage, and GPS location to the pit station in real time.",
      "Integrated onboard sensors with Arduino and ESP8266, using LoRa and NRF24L01 for long-range wireless data transmission.",
      "Designed PCBs and validated electrical safety, signal accuracy, and EMI resistance; coordinated with mechanical and data-analytics teams to optimize vehicle feedback systems.",
    ],
  },
];

export type Honor = {
  title: string;
  detail: string;
};

export const honors: Honor[] = [
  {
    title: "Best Paper Award",
    detail:
      "3rd International Conference on Data Science & Business Systems (ICDSBS 2026, IEEE Madras & Singapore Sections) — \"Intelligent Traffic Monitoring and Management for Real-Time Vehicle Tracking in Smart Cities.\"",
  },
  {
    title: "Research Presenter",
    detail:
      "International Conference on AI & Sustainable Development Goals (ICAISDGs 2025) — \"Multi-Heuristic Phishing Detection System Using TLS, WHOIS, and OCR.\"",
  },
  {
    title: "Life Member",
    detail: "Chendur Research Foundation (CRF).",
  },
];
