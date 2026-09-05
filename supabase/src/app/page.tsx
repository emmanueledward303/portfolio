import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Certificates from '@/components/Certificates';
import TechStack from '@/components/TechStack';
import Resume from '@/components/Resume';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Header />
      <main id="main-content">
        <Hero />
        <About />
        <Certificates />
        <TechStack />
        <Resume />
      </main>
      <Footer />
    </>
  );
}
