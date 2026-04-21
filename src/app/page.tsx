import Nav from "@/components/Nav";
import Cover from "@/components/Cover";
import Vitals from "@/components/Vitals";
import ToolsSection from "@/components/ToolsSection";
import NIASection from "@/components/NIASection";
import GameSection from "@/components/GameSection";
import AnansiBuildSection from "@/components/AnansiBuildSection";
import FeaturedVideos from "@/components/FeaturedVideos";
import Bio from "@/components/Bio";
import LinkHub from "@/components/LinkHub";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <Cover />
      <Vitals />
      <ToolsSection />
      <NIASection />
      <GameSection />
      <AnansiBuildSection />
      <FeaturedVideos />
      <Bio />
      <LinkHub />
      <Footer />
    </>
  );
}
