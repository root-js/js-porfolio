import posterMap from "./plex-posters.json";

export const profile = {
  name: "Joaquin Sanchez",
  handle: "JSANCHEZ",
  title: "Virtualization & Cloud Architect",
  company: "Merck",
  site: "Rahway, NJ",
  location: "NJ, United States",
  bio:
    "A team of talented architects, including me, designs and maintains the virtual-desktop environment that Merck's global workforce runs on. We operate Azure Virtual Desktop and AWS Workspaces at scale, serving 20,000+ users across four Azure regions. Day to day, we lean on Nerdio for lifecycle automation, LoginVSI for performance validation, Infoblox for DNS and IPAM, and Azure CLI for everything that belongs in code.",
  contact: {
    email: "joaquin@s.com.do",
  },
  // Public GitHub handle shown in the GitHub VM panel. Override with
  // NEXT_PUBLIC_GITHUB_USERNAME in .env.local if the guess is wrong.
  github:
    process.env.NEXT_PUBLIC_GITHUB_USERNAME ?? "root-js",
};

export const strengths = [
  "Multi-region AVD and AWS Workspaces architecture",
  "Image engineering and golden-image automation with Nerdio",
  "Performance validation and session-density baselining with LoginVSI",
  "Security hardening across the full VDI estate",
  "High-compute VMs for the scientist and R&D community",
  "GPU-backed VMs capable of running local LLMs for AI workloads",
  "DNS and IPAM at scale with Infoblox",
  "Infrastructure-as-code operations with Azure CLI",
];

export type VmId =
  | "about-me"
  | "projects"
  | "skills"
  | "hobbies"
  | "contact";

export type Vm = {
  id: VmId;
  name: string;
  os: string;
  status: "running" | "stopped";
  cpu: number;
  mem: number;
  uptime: string;
  label: string;
  description: string;
};

export const vms: Vm[] = [
  {
    id: "about-me",
    name: "jsanchez-about-01",
    os: "Windows 11 Enterprise",
    status: "running",
    cpu: 12,
    mem: 34,
    uptime: "342d 11h",
    label: "About",
    description: "Who I am and what I do",
  },
  {
    id: "projects",
    name: "azcli-projects-01",
    os: "Ubuntu 22.04 + Azure CLI",
    status: "running",
    cpu: 28,
    mem: 61,
    uptime: "127d 04h",
    label: "Projects",
    description: "Nerdio · LoginVSI · Windows Migration · Scalability",
  },
  {
    id: "skills",
    name: "debian-skills-01",
    os: "Debian 12 (Bookworm)",
    status: "running",
    cpu: 45,
    mem: 72,
    uptime: "512d 22h",
    label: "Skills",
    description: "What I bring to the environment",
  },
  {
    id: "hobbies",
    name: "fedora-hobbies-01",
    os: "Fedora Workstation 41",
    status: "running",
    cpu: 18,
    mem: 41,
    uptime: "64d 09h",
    label: "Hobbies",
    description: "Life outside the datacenter",
  },
  {
    id: "contact",
    name: "win11-outlook-01",
    os: "Windows 11 Enterprise · AVD Gold Image",
    status: "running",
    cpu: 6,
    mem: 24,
    uptime: "12d 07h",
    label: "Contact",
    description: "Send a message via Outlook (corporate client)",
  },
];

export const projects = [
  {
    name: "Nerdio Manager for Enterprise",
    summary:
      "We run Nerdio Manager for Enterprise as the control plane for our Azure Virtual Desktop estate. It drives host pool scaling, image lifecycle, and MSIX app-attach across every region we operate in.",
    outcomes: [
      "Automated host pool scaling for 20K+ concurrent users",
      "Cut image build and test cycles with golden-image pipelines",
      "Standardized MSIX app-attach rollouts across the fleet",
    ],
  },
  {
    name: "Cost Management & FinOps",
    summary:
      "I own the FinOps lens on our cloud VDI spend. Budget forecasting, tagging hygiene, autoscale tuning, and reservation strategy keep the run rate predictable while the farm continues to grow.",
    outcomes: [
      "Cut idle compute on AVD host pools without touching SLA",
      "Tagging and chargeback model mapped back to business units",
      "Reserved instance and savings-plan plays applied against the baseline",
    ],
  },
  {
    name: "LoginVSI Performance Validation",
    summary:
      "I use LoginVSI to baseline session density, latency, and regression risk on every new image and VM SKU before anything reaches production users.",
    outcomes: [
      "Session density targets validated pre-deployment on every wave",
      "Image and driver regressions caught before users felt them",
      "Per-SKU baselines published for capacity planning",
    ],
  },
  {
    name: "Operations Leadership",
    summary:
      "I lead the Operations function supporting our virtualization environment. I mentor engineers across shifts, own escalations, and set the bar on incident response, runbooks, and change quality.",
    outcomes: [
      "On-call rotation that is calm, documented, and accountable",
      "Higher change-success rate through pre-flight checks and review",
      "Mentored L1 and L2 engineers into production platform roles",
    ],
  },
  {
    name: "Business & IT Alignment",
    summary:
      "I sit in the room with business partners to translate what they actually need into what infrastructure can deliver. The goal is to find the gap between stated IT capability and real business workflow and then close it.",
    outcomes: [
      "Workshop-driven requirements that survive contact with production",
      "Cross-functional roadmap aligned with scientist and clinical workflows",
      "Trusted escalation partner for business units when something breaks",
    ],
  },
  {
    name: "Industry Tooling Stack",
    summary:
      "The VDI platform rests on a mature stack I know top to bottom: FSLogix for profile containers, ControlUp and Azure Monitor for telemetry, Infoblox for DNS and IPAM, Intune and Entra ID for device and identity, and Azure DevOps with PowerShell for everything that belongs in code.",
    outcomes: [
      "FSLogix profile containers operating cleanly at scale",
      "ControlUp and Azure Monitor wired into paging and dashboards",
      "Intune and Entra ID policy layered with least-privilege by default",
    ],
  },
];

/* ========================================================
   Homelab — a public-safe mockup of Joaquin's actual 24/7 lab.
   No internal hostnames, IPs, or private services.
   ======================================================== */

export type HomelabItem = {
  vmid: number;
  kind: "lxc" | "docker" | "vm" | "appliance";
  name: string;
  service: string;
  /** Emoji shown in tree + detail, OR a named icon key (`home-assistant`
   *  etc) that resolves to an inline SVG. */
  icon: string;
  cpu: number; // percent
  mem: number; // percent
  disk?: string;
  purpose: string;
  tags: string[];
  /** One-line description shown in the hover tooltip. */
  tooltip: string;
};

export const homelab: HomelabItem[] = [
  // Perimeter VM: pfSense routes/firewalls the whole network
  {
    vmid: 99,
    kind: "vm",
    name: "pfsense",
    service: "pfSense Firewall",
    icon: "pfsense",
    cpu: 8,
    mem: 18,
    disk: "32G",
    purpose:
      "Perimeter firewall, multi-VLAN router, and VPN gateway for the whole network",
    tags: ["network", "security", "firewall"],
    tooltip: "Firewall, router, and VPN gateway for the whole network.",
  },

  // LXC + VMs on pve-homelab-01
  {
    vmid: 100,
    kind: "lxc",
    name: "home-assistant",
    service: "Home Assistant OS",
    icon: "home-assistant",
    cpu: 8,
    mem: 32,
    disk: "16G",
    purpose: "Whole-home automation hub, local-first",
    tags: ["automation", "iot"],
    tooltip: "The brain behind every automation in the house.",
  },
  {
    vmid: 108,
    kind: "lxc",
    name: "channels-dvr",
    service: "Channels DVR",
    icon: "channels",
    cpu: 6,
    mem: 18,
    disk: "2T",
    purpose:
      "Records live TV from the HDHomeRun tuner; recordings play back on any device",
    tags: ["media", "tv"],
    tooltip: "Live TV and DVR across every room and device.",
  },
  {
    vmid: 102,
    kind: "lxc",
    name: "plex",
    service: "Plex Media Server",
    icon: "plex",
    cpu: 12,
    mem: 22,
    disk: "64G",
    purpose: "Media library and transcoding",
    tags: ["media"],
    tooltip: "Personal movie and TV library, streamed to any device.",
  },
  {
    vmid: 111,
    kind: "lxc",
    name: "audiobookshelf",
    service: "Audiobookshelf",
    icon: "audiobookshelf",
    cpu: 3,
    mem: 12,
    disk: "128G",
    purpose: "Self-hosted ebook + audiobook library",
    tags: ["books", "media"],
    tooltip: "Ebooks and audiobooks, self-hosted and private.",
  },
  {
    vmid: 101,
    kind: "lxc",
    name: "pihole",
    service: "Pi-hole",
    icon: "pihole",
    cpu: 1,
    mem: 8,
    disk: "4G",
    purpose: "Network-wide DNS filtering and ad-blocking",
    tags: ["network", "dns"],
    tooltip: "DNS-level ad-blocking for every device on the network.",
  },
  {
    vmid: 109,
    kind: "lxc",
    name: "tailscale",
    service: "Tailscale",
    icon: "tailscale",
    cpu: 1,
    mem: 6,
    disk: "4G",
    purpose: "Mesh VPN tying every device and the lab together",
    tags: ["network", "vpn"],
    tooltip: "Secure mesh VPN. Every device, one private network.",
  },
  {
    vmid: 106,
    kind: "vm",
    name: "ollama",
    service: "Ollama",
    icon: "ollama",
    cpu: 42,
    mem: 68,
    disk: "256G",
    purpose: "Local LLM host — Llama 3, Qwen 2.5, Mistral, GPT-OSS",
    tags: ["ai", "gpu"],
    tooltip: "Multiple local LLMs, all running fully offline on GPU.",
  },
  {
    vmid: 107,
    kind: "vm",
    name: "frigate",
    service: "Frigate NVR",
    icon: "frigate",
    cpu: 22,
    mem: 28,
    disk: "512G",
    purpose:
      "Real-time AI-powered NVR for the UniFi cameras, with local object detection",
    tags: ["cctv", "ai"],
    tooltip: "Local AI-powered camera recorder, no cloud involved.",
  },
  {
    vmid: 110,
    kind: "vm",
    name: "github",
    service: "GitHub",
    icon: "github",
    cpu: 1,
    mem: 4,
    disk: "8G",
    purpose: "My public repositories and contributions",
    tags: ["dev"],
    tooltip: "Public GitHub profile and contribution activity.",
  },
  {
    vmid: 103,
    kind: "lxc",
    name: "arrstack",
    service: "Sonarr + Radarr",
    icon: "📺",
    cpu: 4,
    mem: 14,
    disk: "16G",
    purpose: "Library curation and scheduling",
    tags: ["media"],
    tooltip: "Automates keeping the media library organized.",
  },
  {
    vmid: 104,
    kind: "lxc",
    name: "prometheus",
    service: "Prometheus",
    icon: "prometheus",
    cpu: 6,
    mem: 28,
    disk: "32G",
    purpose: "Metrics scraping, time-series storage, alerting for the whole lab",
    tags: ["observability"],
    tooltip: "Scrapes every service in the lab. Single source of truth.",
  },
  {
    vmid: 105,
    kind: "lxc",
    name: "docker-host",
    service: "Docker Engine + Portainer",
    icon: "🐳",
    cpu: 18,
    mem: 44,
    disk: "128G",
    purpose: "Application containers",
    tags: ["containers"],
    tooltip: "Runs the Docker services below.",
  },

  // Docker containers on docker-host (LXC 105)
  {
    vmid: 10501,
    kind: "docker",
    name: "portainer",
    service: "Portainer CE",
    icon: "🧭",
    cpu: 0.4,
    mem: 3,
    purpose: "Container management UI",
    tags: ["containers"],
    tooltip: "A web UI to manage every container in one place.",
  },
  {
    vmid: 10502,
    kind: "docker",
    name: "npm",
    service: "Nginx Proxy Manager",
    icon: "🔀",
    cpu: 0.8,
    mem: 4,
    purpose: "Reverse proxy + Let's Encrypt certificates",
    tags: ["network"],
    tooltip: "Reverse proxy with automatic TLS for every service.",
  },
  {
    vmid: 10503,
    kind: "docker",
    name: "vaultwarden",
    service: "Vaultwarden",
    icon: "🔐",
    cpu: 0.2,
    mem: 2,
    purpose: "Self-hosted password manager",
    tags: ["security"],
    tooltip: "Password vault, self-hosted and under my control.",
  },
  {
    vmid: 10504,
    kind: "docker",
    name: "uptime-kuma",
    service: "Uptime Kuma",
    icon: "💓",
    cpu: 0.3,
    mem: 3,
    purpose: "Service uptime and status monitoring",
    tags: ["observability"],
    tooltip: "Uptime checks and status page for the whole lab.",
  },
  {
    vmid: 10505,
    kind: "docker",
    name: "music-assistant",
    service: "Music Assistant",
    icon: "🎵",
    cpu: 1.1,
    mem: 6,
    purpose: "Unified music control for Home Assistant",
    tags: ["media", "automation"],
    tooltip: "Unified music control, every speaker in the house.",
  },
  {
    vmid: 10506,
    kind: "docker",
    name: "n8n",
    service: "n8n",
    icon: "🔗",
    cpu: 0.6,
    mem: 5,
    purpose: "Automation workflows and webhooks",
    tags: ["automation"],
    tooltip: "Low-code automation between any two services.",
  },
  {
    vmid: 10507,
    kind: "docker",
    name: "syncthing",
    service: "Syncthing",
    icon: "🔄",
    cpu: 0.5,
    mem: 4,
    purpose: "Peer-to-peer file sync across devices",
    tags: ["files"],
    tooltip: "Peer-to-peer file sync across every device I own.",
  },
  {
    vmid: 10508,
    kind: "docker",
    name: "gitea",
    service: "Gitea",
    icon: "📚",
    cpu: 0.7,
    mem: 6,
    purpose: "Self-hosted Git for personal projects",
    tags: ["dev"],
    tooltip: "Private Git for personal projects and notes.",
  },
  {
    vmid: 10509,
    kind: "docker",
    name: "homepage",
    service: "Homepage",
    icon: "🧩",
    cpu: 0.2,
    mem: 2,
    purpose: "Single-pane-of-glass homelab dashboard",
    tags: ["observability"],
    tooltip: "The landing page I actually use at home.",
  },
];

/* ========================================================
   Plex library — what actually sits on the Plex server.
   ======================================================== */

export type PlexItem = {
  id: string;
  title: string;
  kind: "show" | "movie" | "anime" | "podcast";
  year: string;
  rating?: string;
  genre: string;
  /** Gradient used for the poster background when no artwork is loaded. */
  bg: string;
  /** Optional accent (title text) color. */
  accent?: string;
  /** Optional decorative mark drawn over the poster (letter, symbol). */
  mark?: string;
  /** Real poster URL (populated by scripts/pull-posters.mjs from Trakt+TMDB). */
  posterUrl?: string;
};

// Raw catalog. `posterUrl` is merged in below from plex-posters.json
// (populated by `node scripts/pull-posters.mjs`).
const rawPlexLibrary: PlexItem[] = [
  // ============ TV Shows ============
  {
    id: "breaking-bad",
    title: "Breaking Bad",
    kind: "show",
    year: "2008",
    rating: "TV-MA",
    genre: "Crime Drama",
    bg: "linear-gradient(180deg, #1c3a27 0%, #0a1a12 60%, #d4a017 100%)",
    accent: "#d4a017",
    mark: "Br Ba",
  },
  {
    id: "better-call-saul",
    title: "Better Call Saul",
    kind: "show",
    year: "2015",
    rating: "TV-MA",
    genre: "Crime Drama",
    bg: "linear-gradient(180deg, #0a1632 0%, #0a0f20 60%, #e5a01e 100%)",
    accent: "#e5a01e",
    mark: "BCS",
  },
  {
    id: "last-of-us",
    title: "The Last of Us",
    kind: "show",
    year: "2023",
    rating: "TV-MA",
    genre: "Post-apocalyptic",
    bg: "linear-gradient(180deg, #1a2722 0%, #0b1511 55%, #2f4a2a 100%)",
    accent: "#b6c1a4",
    mark: "TLOU",
  },
  {
    id: "mr-robot",
    title: "Mr. Robot",
    kind: "show",
    year: "2015",
    rating: "TV-MA",
    genre: "Cyber Thriller",
    bg: "linear-gradient(180deg, #0a0a0a 0%, #140505 60%, #8b0000 100%)",
    accent: "#ff3b3b",
    mark: "fsociety",
  },
  {
    id: "the-wire",
    title: "The Wire",
    kind: "show",
    year: "2002",
    rating: "TV-MA",
    genre: "Crime Drama",
    bg: "linear-gradient(180deg, #0b1c2e 0%, #0a121e 60%, #203850 100%)",
    accent: "#a3c8ee",
    mark: "WIRE",
  },
  {
    id: "sopranos",
    title: "The Sopranos",
    kind: "show",
    year: "1999",
    rating: "TV-MA",
    genre: "Crime Drama",
    bg: "linear-gradient(180deg, #2a0a0a 0%, #140505 60%, #6b0f0f 100%)",
    accent: "#f4d35e",
    mark: "T.S.",
  },
  {
    id: "yellowstone",
    title: "Yellowstone",
    kind: "show",
    year: "2018",
    rating: "TV-MA",
    genre: "Western Drama",
    bg: "linear-gradient(180deg, #3a1f0a 0%, #1a0f06 60%, #87380a 100%)",
    accent: "#e7b268",
    mark: "Y",
  },
  {
    id: "succession",
    title: "Succession",
    kind: "show",
    year: "2018",
    rating: "TV-MA",
    genre: "Drama",
    bg: "linear-gradient(180deg, #181818 0%, #0a0a0a 60%, #7c6a3e 100%)",
    accent: "#c6a766",
    mark: "SUC",
  },
  {
    id: "ozark",
    title: "Ozark",
    kind: "show",
    year: "2017",
    rating: "TV-MA",
    genre: "Crime Thriller",
    bg: "linear-gradient(180deg, #062d3b 0%, #021722 60%, #104a5f 100%)",
    accent: "#8ed4e8",
    mark: "OZ",
  },
  {
    id: "the-bear",
    title: "The Bear",
    kind: "show",
    year: "2022",
    rating: "TV-MA",
    genre: "Drama",
    bg: "linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 60%, #f1d1a4 100%)",
    accent: "#f6b57d",
    mark: "BEAR",
  },

  // ============ Anime ============
  {
    id: "solo-leveling",
    title: "Solo Leveling",
    kind: "anime",
    year: "2024",
    rating: "TV-14",
    genre: "Action Fantasy",
    bg: "linear-gradient(180deg, #0a1430 0%, #070b1c 55%, #4dd6ff 100%)",
    accent: "#76e4ff",
    mark: "SL",
  },
  {
    id: "jjk",
    title: "Jujutsu Kaisen",
    kind: "anime",
    year: "2020",
    rating: "TV-14",
    genre: "Supernatural",
    bg: "linear-gradient(180deg, #140a26 0%, #080410 60%, #6a2aa8 100%)",
    accent: "#b983ff",
    mark: "JJK",
  },
  {
    id: "opm",
    title: "One Punch Man",
    kind: "anime",
    year: "2015",
    rating: "TV-14",
    genre: "Action Comedy",
    bg: "linear-gradient(180deg, #2a0a0a 0%, #1a0707 60%, #ffcb05 100%)",
    accent: "#ffcb05",
    mark: "OPM",
  },
  {
    id: "hxh",
    title: "Hunter x Hunter",
    kind: "anime",
    year: "2011",
    rating: "TV-14",
    genre: "Adventure",
    bg: "linear-gradient(180deg, #0a2416 0%, #050f09 60%, #18a85c 100%)",
    accent: "#52e092",
    mark: "HxH",
  },
  {
    id: "rick-morty",
    title: "Rick and Morty",
    kind: "anime",
    year: "2013",
    rating: "TV-MA",
    genre: "Sci-fi Comedy",
    bg: "linear-gradient(180deg, #0a2a22 0%, #05120f 60%, #20d0a8 100%)",
    accent: "#6ff0d0",
    mark: "R&M",
  },
  {
    id: "aot",
    title: "Attack on Titan",
    kind: "anime",
    year: "2013",
    rating: "TV-MA",
    genre: "Action",
    bg: "linear-gradient(180deg, #2a1a0a 0%, #120a04 60%, #7a3d16 100%)",
    accent: "#d78a4a",
    mark: "AoT",
  },
  {
    id: "demon-slayer",
    title: "Demon Slayer",
    kind: "anime",
    year: "2019",
    rating: "TV-14",
    genre: "Action",
    bg: "linear-gradient(180deg, #140a14 0%, #08040a 60%, #c1272d 100%)",
    accent: "#f46268",
    mark: "DS",
  },
  {
    id: "edgerunners",
    title: "Cyberpunk: Edgerunners",
    kind: "anime",
    year: "2022",
    rating: "TV-MA",
    genre: "Sci-fi",
    bg: "linear-gradient(180deg, #140022 0%, #08000f 60%, #fcee21 100%)",
    accent: "#fcee21",
    mark: "CPE",
  },

  // ============ Movies ============
  {
    id: "top-gun",
    title: "Top Gun: Maverick",
    kind: "movie",
    year: "2022",
    rating: "PG-13",
    genre: "Action",
    bg: "linear-gradient(180deg, #041a33 0%, #02101f 60%, #2b6fb3 100%)",
    accent: "#7fc4ff",
    mark: "TG",
  },
  {
    id: "am-sniper",
    title: "American Sniper",
    kind: "movie",
    year: "2014",
    rating: "R",
    genre: "War",
    bg: "linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 60%, #6b4226 100%)",
    accent: "#d6b48a",
    mark: "AS",
  },
  {
    id: "lone-survivor",
    title: "Lone Survivor",
    kind: "movie",
    year: "2013",
    rating: "R",
    genre: "War",
    bg: "linear-gradient(180deg, #1a2410 0%, #080b06 60%, #54663a 100%)",
    accent: "#a8bb7a",
    mark: "LS",
  },
  {
    id: "dark-knight",
    title: "The Dark Knight",
    kind: "movie",
    year: "2008",
    rating: "PG-13",
    genre: "Action",
    bg: "linear-gradient(180deg, #0a0a0a 0%, #050505 60%, #c09027 100%)",
    accent: "#e5a626",
    mark: "TDK",
  },
  {
    id: "john-wick",
    title: "John Wick",
    kind: "movie",
    year: "2014",
    rating: "R",
    genre: "Action",
    bg: "linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 60%, #b4102a 100%)",
    accent: "#ff4b62",
    mark: "JW",
  },
  {
    id: "heat",
    title: "Heat",
    kind: "movie",
    year: "1995",
    rating: "R",
    genre: "Crime Thriller",
    bg: "linear-gradient(180deg, #291f1a 0%, #130f0b 60%, #c97c3a 100%)",
    accent: "#ffb274",
    mark: "HEAT",
  },

  // ============ Podcasts & Talk (subtle right-leaning catalog) ============
  {
    id: "rogan",
    title: "The Joe Rogan Experience",
    kind: "podcast",
    year: "2009",
    genre: "Podcast",
    bg: "linear-gradient(180deg, #0a0a0a 0%, #000 60%, #2a2a2a 100%)",
    accent: "#f5b823",
    mark: "JRE",
  },
  {
    id: "tucker",
    title: "The Tucker Carlson Show",
    kind: "podcast",
    year: "2024",
    genre: "Talk Show",
    bg: "linear-gradient(180deg, #0a0f1e 0%, #05081a 60%, #233970 100%)",
    accent: "#c0d1ff",
    mark: "TCS",
  },
  {
    id: "shapiro",
    title: "The Ben Shapiro Show",
    kind: "podcast",
    year: "2015",
    genre: "Talk Show",
    bg: "linear-gradient(180deg, #1a0a0a 0%, #0a0505 60%, #902a2a 100%)",
    accent: "#ff9090",
    mark: "BS",
  },
  {
    id: "shawn-ryan",
    title: "The Shawn Ryan Show",
    kind: "podcast",
    year: "2022",
    genre: "Podcast",
    bg: "linear-gradient(180deg, #1a1205 0%, #0a0802 60%, #a07022 100%)",
    accent: "#ffd27e",
    mark: "SRS",
  },
  {
    id: "peterson",
    title: "The Jordan B. Peterson Podcast",
    kind: "podcast",
    year: "2016",
    genre: "Podcast",
    bg: "linear-gradient(180deg, #0a1a22 0%, #020b10 60%, #1a6e8b 100%)",
    accent: "#87d4eb",
    mark: "JBP",
  },
  {
    id: "theo-von",
    title: "This Past Weekend — Theo Von",
    kind: "podcast",
    year: "2016",
    genre: "Comedy Podcast",
    bg: "linear-gradient(180deg, #1a1008 0%, #0a0704 60%, #d17c2a 100%)",
    accent: "#f4b07a",
    mark: "TPW",
  },
  {
    id: "flagrant",
    title: "Flagrant — Andrew Schulz",
    kind: "podcast",
    year: "2020",
    genre: "Comedy Podcast",
    bg: "linear-gradient(180deg, #140020 0%, #05000d 60%, #6e28d9 100%)",
    accent: "#c2a8ff",
    mark: "FLA",
  },
  {
    id: "lex",
    title: "The Lex Fridman Podcast",
    kind: "podcast",
    year: "2018",
    genre: "Podcast",
    bg: "linear-gradient(180deg, #050a1a 0%, #02030a 60%, #143d5a 100%)",
    accent: "#9bc3e0",
    mark: "LFP",
  },
];

// Final export: raw catalog with any poster URLs from plex-posters.json
// layered on top. Unpopulated entries fall back to the CSS gradient.
const posters = posterMap as Record<string, string>;
export const plexLibrary: PlexItem[] = rawPlexLibrary.map((p) =>
  posters[p.id] ? { ...p, posterUrl: posters[p.id] } : p,
);

/* ========================================================
   Books — for the Audiobookshelf VM.
   Covers pulled live from Open Library's free covers API:
     https://covers.openlibrary.org/b/isbn/<ISBN>-L.jpg
   ======================================================== */

export type BookItem = {
  id: string;
  title: string;
  author: string;
  year: string;
  isbn: string;
  category:
    | "Self-Improvement"
    | "Discipline & Leadership"
    | "People & Influence"
    | "Stoic & Mindset"
    | "Finance"
    | "Tech & Ops"
    | "Military Memoir";
  /** Gradient fallback if the cover can't load. */
  bg: string;
};

export const books: BookItem[] = [
  // Self-improvement classics
  {
    id: "atomic-habits",
    title: "Atomic Habits",
    author: "James Clear",
    year: "2018",
    isbn: "0735211299",
    category: "Self-Improvement",
    bg: "linear-gradient(180deg, #1a2f4a, #f59e0b)",
  },
  {
    id: "7-habits",
    title: "The 7 Habits of Highly Effective People",
    author: "Stephen R. Covey",
    year: "1989",
    isbn: "0743269519",
    category: "Self-Improvement",
    bg: "linear-gradient(180deg, #2a1f10, #b47a2a)",
  },
  {
    id: "think-grow-rich",
    title: "Think and Grow Rich",
    author: "Napoleon Hill",
    year: "1937",
    isbn: "1585424331",
    category: "Self-Improvement",
    bg: "linear-gradient(180deg, #0a1a2a, #caa85a)",
  },

  // Discipline & Leadership
  {
    id: "cant-hurt-me",
    title: "Can't Hurt Me",
    author: "David Goggins",
    year: "2018",
    isbn: "1544512287",
    category: "Discipline & Leadership",
    bg: "linear-gradient(180deg, #0a0a0a, #caa85a)",
  },
  {
    id: "never-finished",
    title: "Never Finished",
    author: "David Goggins",
    year: "2022",
    isbn: "1544529082",
    category: "Discipline & Leadership",
    bg: "linear-gradient(180deg, #0a0a0a, #b91c1c)",
  },
  {
    id: "extreme-ownership",
    title: "Extreme Ownership",
    author: "Jocko Willink & Leif Babin",
    year: "2015",
    isbn: "1250067057",
    category: "Discipline & Leadership",
    bg: "linear-gradient(180deg, #0a0f1a, #6b2222)",
  },
  {
    id: "discipline-equals-freedom",
    title: "Discipline Equals Freedom",
    author: "Jocko Willink",
    year: "2017",
    isbn: "1250156947",
    category: "Discipline & Leadership",
    bg: "linear-gradient(180deg, #0a0a0a, #1f2937)",
  },
  {
    id: "start-with-why",
    title: "Start with Why",
    author: "Simon Sinek",
    year: "2009",
    isbn: "1591846447",
    category: "Discipline & Leadership",
    bg: "linear-gradient(180deg, #1a1a1a, #fbbf24)",
  },

  // People & Influence
  {
    id: "how-to-win-friends",
    title: "How to Win Friends and Influence People",
    author: "Dale Carnegie",
    year: "1936",
    isbn: "0671027034",
    category: "People & Influence",
    bg: "linear-gradient(180deg, #3a2a14, #caa85a)",
  },
  {
    id: "48-laws-of-power",
    title: "The 48 Laws of Power",
    author: "Robert Greene",
    year: "1998",
    isbn: "0140280197",
    category: "People & Influence",
    bg: "linear-gradient(180deg, #0a0a0a, #c4a257)",
  },
  {
    id: "principles",
    title: "Principles",
    author: "Ray Dalio",
    year: "2017",
    isbn: "1501124021",
    category: "People & Influence",
    bg: "linear-gradient(180deg, #111827, #4b5563)",
  },

  // Stoic / Mindset
  {
    id: "meditations",
    title: "Meditations",
    author: "Marcus Aurelius",
    year: "180",
    isbn: "0812968255",
    category: "Stoic & Mindset",
    bg: "linear-gradient(180deg, #1a1410, #5b4020)",
  },
  {
    id: "obstacle-is-the-way",
    title: "The Obstacle Is the Way",
    author: "Ryan Holiday",
    year: "2014",
    isbn: "1591846358",
    category: "Stoic & Mindset",
    bg: "linear-gradient(180deg, #111827, #fbbf24)",
  },
  {
    id: "12-rules",
    title: "12 Rules for Life",
    author: "Jordan B. Peterson",
    year: "2018",
    isbn: "0345816021",
    category: "Stoic & Mindset",
    bg: "linear-gradient(180deg, #1a0f0f, #b91c1c)",
  },

  // Finance
  {
    id: "rich-dad-poor-dad",
    title: "Rich Dad Poor Dad",
    author: "Robert T. Kiyosaki",
    year: "1997",
    isbn: "1612680194",
    category: "Finance",
    bg: "linear-gradient(180deg, #0a3a2a, #2a8a5a)",
  },

  // Tech & Ops
  {
    id: "phoenix-project",
    title: "The Phoenix Project",
    author: "Gene Kim et al.",
    year: "2013",
    isbn: "0988262592",
    category: "Tech & Ops",
    bg: "linear-gradient(180deg, #0a1a2e, #fb923c)",
  },

  // Military / Memoir
  {
    id: "american-sniper",
    title: "American Sniper",
    author: "Chris Kyle",
    year: "2012",
    isbn: "0062082353",
    category: "Military Memoir",
    bg: "linear-gradient(180deg, #0a1a2e, #6b7280)",
  },
  {
    id: "lone-survivor",
    title: "Lone Survivor",
    author: "Marcus Luttrell",
    year: "2007",
    isbn: "0316067601",
    category: "Military Memoir",
    bg: "linear-gradient(180deg, #0a1a0f, #4a6b2a)",
  },
];

export const hobbies = [
  {
    id: "mets",
    title: "NY Mets",
    tag: "Baseball",
    accent: "#ff5910", // mets orange
    icon: "⚾",
    body:
      "Lifelong Mets fan. Citi Field is the best time of year — win or lose, it's the ritual that matters.",
  },
  {
    id: "ufc",
    title: "UFC",
    tag: "Combat Sports",
    accent: "#d20a11",
    icon: "🥊",
    body:
      "I follow UFC cards closely. Respect for the craft, the weight cut, the strategy, the grit.",
  },
  {
    id: "futbol",
    title: "Fútbol",
    tag: "The Beautiful Game",
    accent: "#16a34a",
    icon: "⚽",
    body:
      "Born into it. Weekend matches are non-negotiable.",
  },
  {
    id: "homelab",
    title: "Homelab & Home Automation",
    tag: "Tinkering",
    accent: "#3b82f6",
    icon: "🛠",
    body:
      "Running a proper homelab, automating the house, and generally using tech to make daily life a little better. This very site is a product of that impulse.",
  },
  {
    id: "reading",
    title: "Reading",
    tag: "Books",
    accent: "#a855f7",
    icon: "📚",
    body:
      "A good book reliably beats doomscrolling. Current taste: anything that sharpens the mind.",
  },
  {
    id: "family",
    title: "Family",
    tag: "The main thing",
    accent: "#f59e0b",
    icon: "👨‍👩‍👧",
    body:
      "Above all, time with my family. Everything else is support infrastructure.",
  },
];

export const skills = [
  // Core virtualization platform
  { name: "Architecting Virtual Environments", level: 98, category: "Core" },
  { name: "Azure Virtual Desktop (AVD)", level: 96, category: "Core" },
  { name: "AWS Workspaces", level: 84, category: "Core" },
  { name: "Nerdio Manager for Enterprise", level: 92, category: "Core" },
  { name: "LoginVSI Performance Testing", level: 88, category: "Core" },
  { name: "Windows Image Engineering", level: 90, category: "Core" },
  { name: "Global Multi-Region Scaling", level: 94, category: "Core" },

  // Cloud platform + automation
  { name: "PowerShell", level: 92, category: "Cloud & Automation" },
  { name: "Azure CLI", level: 90, category: "Cloud & Automation" },
  { name: "Subscription Management", level: 88, category: "Cloud & Automation" },
  { name: "Azure Storage", level: 85, category: "Cloud & Automation" },
  { name: "Capacity Planning", level: 88, category: "Cloud & Automation" },

  // Security + identity
  { name: "Microsoft Intune", level: 83, category: "Security & Identity" },
  { name: "Zscaler", level: 80, category: "Security & Identity" },
  { name: "Security Hardening", level: 88, category: "Security & Identity" },

  // AI + emerging workloads
  { name: "GPU VMs for Local LLMs", level: 82, category: "AI & Emerging" },
  { name: "AI-assisted Operations", level: 78, category: "AI & Emerging" },
];
