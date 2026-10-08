import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root; a stray lockfile higher up (~/Documents) confuses root detection.
  turbopack: {
    root: path.join(__dirname),
  },

  // Keystatic's GitHub sign-in runs the local admin on 127.0.0.1 (GitHub's local callback
  // host); without this the dev server blocks its scripts there and /keystatic stays blank.
  allowedDevOrigins: ["127.0.0.1"],

  // The CMS stores the resume as public/profile/resume.pdf; keep the old URL (already on
  // shared CVs and profiles) working.
  async redirects() {
    return [{ source: "/Htun-Kyaw_Resume.pdf", destination: "/profile/resume.pdf", permanent: true }];
  },

  // Save the resume under a descriptive name instead of "resume.pdf".
  async headers() {
    return [
      {
        source: "/profile/resume.pdf",
        headers: [{ key: "Content-Disposition", value: 'inline; filename="Htun-Kyaw_Resume.pdf"' }],
      },
    ];
  },
};

export default nextConfig;
