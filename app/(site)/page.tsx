import {
  Hero,
  Specialties,
  HowWeHelp,
  AutomationHome,
  SocialHome,
  Combined,
  Process,
  Trust,
  FinalCta,
} from "@/components/home-sections";

export default function Home() {
  return (
    <>
      <Hero />
      <Specialties />
      <HowWeHelp />
      <AutomationHome />
      <SocialHome />
      <Combined />
      <Process />
      <Trust />
      <FinalCta />
    </>
  );
}
