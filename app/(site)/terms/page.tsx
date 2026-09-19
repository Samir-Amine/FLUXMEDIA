import type { Metadata } from "next";
import { Legal } from "@/components/legal";
export const metadata: Metadata = { title: "Terms of Service", description: "Terms governing the use of the FLUXMEDIA website and services." };
export default function Terms() {
  return (
    <Legal
      title="Terms of Service"
      updated="September 2026"
      sections={[
        { h: "Requests are not contracts", p: "Submitting a request through this website is an expression of interest. A project or package begins only once scope, pricing and timeline are confirmed in writing by FLUXMEDIA." },
        { h: "Pricing", p: "Package prices shown on the website are indicative monthly rates and may be updated. The price confirmed in your proposal is the applicable one." },
        { h: "Platform access", p: "Social media management requires that you grant FLUXMEDIA appropriate access to your accounts through the platforms' official business tools. You remain the owner of your accounts and content." },
        { h: "Automation systems", p: "Automations are built on third-party tools and APIs (CRM, messaging, email providers). Their availability and terms are governed by those providers." },
        { h: "Intellectual property", p: "Content produced for you becomes yours upon payment. FLUXMEDIA retains the right to reference the collaboration in its portfolio unless agreed otherwise." },
        { h: "Termination", p: "Monthly packages may be cancelled with 30 days' written notice." },
      ]}
    />
  );
}
