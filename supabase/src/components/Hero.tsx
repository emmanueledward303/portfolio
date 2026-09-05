import Image from 'next/image';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section id="home" className={styles.hero} aria-label="Introduction">
      <div className={`container ${styles.inner}`}>
        {/* Left: copy */}
        <div className={styles.copy}>
          <p className={`${styles.greeting} animate-fade-in-up`}>Greeting,</p>
          <h1 className={`${styles.name} animate-fade-in-up delay-100`}>
            Edward<br />Emmanuel
          </h1>
          <p className={`${styles.tagline} animate-fade-in-up delay-200`}>
            Full-Stack Developer &amp; Data Engineer
          </p>
          <p className={`${styles.intro} animate-fade-in-up delay-300`}>
            I build scalable web applications and data systems that handle real-world complexity
            with clarity and precision. Five years of shipping products that people actually use,
            across Lagos and distributed teams globally.
          </p>
          <div className={`${styles.actions} animate-fade-in-up delay-400`}>
            <a href="#certificates" className="btn btn-primary">
              View My Work
            </a>
            <a href="/resume.pdf" download className="btn btn-outline">
              Download Resume
            </a>
          </div>
        </div>

        {/* Right: portrait with brown offset accent */}
        <div className={`${styles.portrait} animate-fade-in-up delay-200`}>
          <div className={styles.portraitAccent} aria-hidden="true" />
          <div className={styles.portraitFrame}>
            <Image
              src="/portrait.jpg"
              alt="Portrait of Edward Emmanuel"
              width={320}
              height={380}
              className={styles.portraitImg}
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
