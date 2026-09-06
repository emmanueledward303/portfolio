import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import ThoughtsAndNotes from '@/components/ThoughtsAndNotes';
import Projects from '@/components/Projects';
import TechStack from '@/components/TechStack';
import Resume from '@/components/Resume';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Header />
      <main id="main-content">
        <Hero />
        <About />
        <ThoughtsAndNotes />
        <Projects />
        <TechStack />
        <Resume />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

