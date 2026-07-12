import { Nav } from "@/components/nav";
import { DemoIndex } from "@/components/demo-index";
import { Capabilities } from "@/components/capabilities";
import { Process } from "@/components/process";
import { PointOfView } from "@/components/pov";
import { Testimonial } from "@/components/testimonial";
import { FinalCta } from "@/components/final-cta";
import { Footer } from "@/components/footer";

export default function AboutMe() {
  return (
    <main>
      <Nav />
      <DemoIndex />
      <Capabilities />
      <Process />
      <PointOfView />
      <Testimonial />
      <FinalCta />
      <Footer />
    </main>
  );
}
