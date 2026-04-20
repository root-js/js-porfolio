import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://s.com.do";
const DESCRIPTION =
  "Joaquin Sanchez — Virtualization & Cloud Architect at Merck. 20,000+ users across 4 Azure regions. Specialized in Azure Virtual Desktop (AVD), AWS Workspaces, Nerdio, LoginVSI, VDI security hardening, GPU VMs for local LLMs, and multi-region scaling. Based in NJ, USA.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "Joaquin Sanchez · Virtualization & Cloud Architect · AVD · AWS Workspaces",
    template: "%s · Joaquin Sanchez",
  },
  description: DESCRIPTION,
  keywords: [
    "Joaquin Sanchez",
    "Virtualization Engineer",
    "Virtualization Architect",
    "Cloud Architect",
    "Azure Virtual Desktop",
    "AVD",
    "AWS Workspaces",
    "Nerdio",
    "LoginVSI",
    "VDI",
    "End-User Computing",
    "EUC",
    "Merck",
    "Infoblox",
    "Azure CLI",
    "PowerShell",
    "Zscaler",
    "Microsoft Intune",
    "Ollama",
    "GPU VMs",
    "Local LLM",
    "Proxmox",
    "Homelab",
    "New Jersey",
    "portfolio",
    "resume",
    "hire",
  ],
  authors: [{ name: "Joaquin Sanchez", url: SITE_URL }],
  creator: "Joaquin Sanchez",
  publisher: "Joaquin Sanchez",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "profile",
    url: SITE_URL,
    siteName: "Joaquin Sanchez · Portfolio",
    title:
      "Joaquin Sanchez · Virtualization & Cloud Architect · AVD · AWS Workspaces",
    description: DESCRIPTION,
    images: [
      {
        url: "/joaquin-anime.png",
        width: 1376,
        height: 768,
        alt: "Joaquin Sanchez at his home-office workstation",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Joaquin Sanchez · Virtualization & Cloud Architect",
    description: DESCRIPTION,
    images: ["/joaquin-anime.png"],
  },
  alternates: {
    canonical: SITE_URL,
  },
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Joaquin Sanchez",
  url: SITE_URL,
  image: `${SITE_URL}/joaquin-anime.png`,
  jobTitle: "Virtualization & Cloud Architect",
  worksFor: {
    "@type": "Organization",
    name: "Merck & Co., Inc",
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "NJ",
    addressCountry: "US",
  },
  knowsAbout: [
    "Azure Virtual Desktop",
    "AWS Workspaces",
    "Nerdio",
    "LoginVSI",
    "VDI",
    "End-User Computing",
    "Virtualization Architecture",
    "Multi-Region Scaling",
    "Security Hardening",
    "GPU VMs",
    "Local LLMs",
    "Infoblox",
    "Microsoft Intune",
    "Zscaler",
    "Azure CLI",
    "PowerShell",
    "Proxmox",
    "Homelab",
  ],
  sameAs: ["https://github.com/root-js"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-sl-bg-deep text-sl-ink">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        {children}
      </body>
    </html>
  );
}
