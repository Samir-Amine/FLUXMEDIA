import type { Metadata } from "next";
import { Legal } from "@/components/legal";
export const metadata: Metadata = { title: "Privacy Policy", description: "How FLUXMEDIA handles the information you share with us." };
export default function Privacy() {
  return (
    <Legal
      title="Privacy Policy"
      updated="September 2026"
      sections={[
        { h: "What we collect", p: "When you submit a request or contact form we store the information you provide: name, email, WhatsApp number, company, project details and any preferences you select. We do not collect payment information on this website." },
        { h: "How we use it", p: "We use this information solely to review your request, contact you about it, and deliver the services you ask for. We do not sell or rent your data to third parties." },
        { h: "Storage & security", p: "Requests are stored in our secured database with restricted admin access. Access is limited to the FLUXMEDIA team and protected by authentication." },
        { h: "Cookies", p: "We use functional cookies only: your language preference and theme choice. No advertising or cross-site tracking cookies are set by this website." },
        { h: "Your rights", p: "You may request access to, correction of, or deletion of your data at any time by contacting us at the email address shown on the Contact page." },
      ]}
    />
  );
}
