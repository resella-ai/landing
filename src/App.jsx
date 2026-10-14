import { useState, useEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import brandWordmark from "./assets/resella-wordmark.png";
import marketVinted from "./assets/reference/market-vinted.svg";
import marketDepop from "./assets/reference/market-depop.webp";
import marketEbay from "./assets/reference/market-ebay.webp";
import marketEtsy from "./assets/reference/market-etsy.webp";
import marketWallapop from "./assets/reference/market-wallapop.svg";
import marketVestiaire from "./assets/reference/market-vestiaire.jpg";
import problemProductVisual from "./assets/reference/problem-listing-product.jpg";
import genesisVintageLogo from "./assets/reference/genesis-vintage.png";
import galleryBlueFleece from "./assets/reference/gallery/01-blue-fleece.jpg";
import galleryDarkJeans from "./assets/reference/gallery/02-dark-jeans.jpg";
import galleryBullsHoodie from "./assets/reference/gallery/03-bulls-hoodie.jpg";
import galleryYellowHoodie from "./assets/reference/gallery/04-yellow-hoodie.jpg";
import galleryKappaWindbreaker from "./assets/reference/gallery/05-kappa-windbreaker.jpg";
import galleryLightJeans from "./assets/reference/gallery/06-light-jeans.jpg";
import galleryBlackSweatshirt from "./assets/reference/gallery/07-black-sweatshirt.jpg";
import galleryNavyJacket from "./assets/reference/gallery/08-navy-jacket.jpg";
import galleryAdidasWindbreaker from "./assets/reference/gallery/09-adidas-windbreaker.jpg";
import galleryDenimJacket from "./assets/reference/gallery/10-denim-jacket.jpg";
import originalDenimJacket from "./assets/reference/gallery/originals/original-denim-jacket.jpg";
import originalAdidasWindbreaker from "./assets/reference/gallery/originals/original-adidas-windbreaker.jpg";
import originalBlueFleece from "./assets/reference/gallery/originals/original-blue-fleece.jpg";
import originalLightJeans from "./assets/reference/gallery/originals/original-light-jeans.jpg";
import originalBlackSweatshirt from "./assets/reference/gallery/originals/original-black-sweatshirt.jpg";
import originalNavyJacket from "./assets/reference/gallery/originals/original-navy-jacket.jpg";
import originalBullsHoodie from "./assets/reference/gallery/originals/original-bulls-hoodie.jpg";
import originalYellowHoodie from "./assets/reference/gallery/originals/original-yellow-hoodie.webp";
import originalKappaWindbreaker from "./assets/reference/gallery/originals/original-kappa-windbreaker.jpeg";
import originalDarkJeans from "./assets/reference/gallery/originals/original-dark-jeans.jpg";

const appUrl = "https://resella.meeda.it";

gsap.registerPlugin(SplitText);

function useSmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({ autoRaf: true });
    const heroCopy = document.querySelector(".hero-copy");
    const heroPanel = document.querySelector(".hero-panel");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let removeHeroScroll = () => {};
    if (heroCopy && heroPanel && !reduceMotion) {
      const updateHeroMotion = (scrollState) => {
        const progress = Math.min(1, Math.max(0, scrollState.scroll / 210));
        const eased = progress * progress * (3 - 2 * progress);

        heroCopy.style.opacity = String(1 - eased);
        heroCopy.style.transform = `translate3d(0, ${-18 * eased}px, 0) scale(${1 - 0.14 * eased})`;
        heroPanel.style.transform = `translate3d(0, ${-72 * eased}px, 0) scale(${1 + 0.09 * eased})`;
      };

      removeHeroScroll = lenis.on("scroll", updateHeroMotion);
      updateHeroMotion(lenis);
    }

    const handleAnchorClick = (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = event.composedPath().find((node) => node instanceof HTMLAnchorElement);
      if (!anchor || anchor.target || anchor.hasAttribute("download")) return;

      const targetUrl = new URL(anchor.href, window.location.href);
      if (
        targetUrl.origin !== window.location.origin ||
        targetUrl.pathname !== window.location.pathname ||
        targetUrl.search !== window.location.search ||
        !targetUrl.hash
      ) return;

      const targetId = decodeURIComponent(targetUrl.hash.slice(1));
      const target = document.getElementById(targetId);
      if (!target) return;

      event.preventDefault();
      if (window.location.hash !== targetUrl.hash) {
        window.history.pushState(null, "", targetUrl.hash);
      }
      lenis.scrollTo(target);
    };

    document.addEventListener("click", handleAnchorClick);
    return () => {
      document.removeEventListener("click", handleAnchorClick);
      removeHeroScroll();
      lenis.destroy();
    };
  }, []);
}

/** Reveals each section once and animates its heading copy with a word split. */
function useScrollReveal() {
  useEffect(() => {
    const els = [...document.querySelectorAll(".reveal")];
    if (!els.length) return undefined;

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const splitInstances = new Map();
    const createSplits = () => {
      if (motionPreference.matches) return;

      document.querySelectorAll(".split-title, .split-subtitle").forEach((element) => {
        if (element.closest(".reveal")?.classList.contains("is-visible") || splitInstances.has(element)) return;

        const split = SplitText.create(element, {
          type: "words",
          tag: "span",
          wordsClass: "split-word",
          mask: "words",
          aria: "auto",
        });
        const isSubtitle = element.classList.contains("split-subtitle");
        gsap.set(split.words, { yPercent: isSubtitle ? 45 : 105, opacity: 0 });
        splitInstances.set(element, split);
      });
    };
    const revertSplits = () => {
      splitInstances.forEach((split) => {
        gsap.killTweensOf(split.words);
        split.revert();
      });
      splitInstances.clear();
    };
    createSplits();

    const revealCopy = (container) => {
      if (motionPreference.matches) return;

      container.querySelectorAll(".split-title, .split-subtitle").forEach((element) => {
        const split = splitInstances.get(element);
        if (!split) return;

        const isSubtitle = element.classList.contains("split-subtitle");
        gsap.to(split.words, {
          yPercent: 0,
          opacity: 1,
          duration: isSubtitle ? 0.48 : 0.68,
          delay: isSubtitle ? 0.1 : 0,
          stagger: isSubtitle ? 0.022 : 0.034,
          ease: "power3.out",
          overwrite: "auto",
          clearProps: "transform,opacity",
        });
      });
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealCopy(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => io.observe(el));
    const handleMotionPreferenceChange = () => {
      if (motionPreference.matches) revertSplits();
      else createSplits();
    };
    motionPreference.addEventListener("change", handleMotionPreferenceChange);

    return () => {
      io.disconnect();
      motionPreference.removeEventListener("change", handleMotionPreferenceChange);
      revertSplits();
    };
  }, []);
}

function Arrow({ className = "" }) {
  return <svg className={className} aria-hidden="true" viewBox="0 0 32 16" fill="none"><path d="M1 8h27m-7-7 8 7-8 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const updateScrollState = () => {
      const scrollY = window.scrollY;
      setIsScrolled((wasScrolled) => wasScrolled ? scrollY > 4 : scrollY > 16);
    };
    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  return (
    <header className={`site-header${isScrolled ? " is-scrolled" : ""}`} id="inizio">
      <div className="header-row frame">
        <a className="brand" href="#inizio" aria-label="Resella, torna all'inizio">
          <img className="brand-logo" src={brandWordmark} alt="" />
        </a>
        <nav aria-label="Navigazione principale">
          <a href="#risultati">Risultati</a>
        </nav>
        <a className="action header-action" href={appUrl}>
          Prova gratis
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero reference-section" aria-labelledby="hero-title">
      <div className="frame hero-frame">
        <div className="hero-copy-frame">
          <div className="hero-copy">
            <h1 id="hero-title">
              Resella. Meno tempo a preparare, <em>più tempo per vendere.</em>
            </h1>
            <div className="hero-actions">
              <a className="action hero-cta" href={appUrl}>
                Prova gratis
              </a>
              <a className="text-link" href="#risultati">
                Guarda i risultati
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const prepFriction = [
  ["camera", "Scattare foto"],
  ["image", "Trovare lo sfondo giusto"],
  ["sliders", "Sistemare le immagini"],
  ["document", "Scrivere la descrizione"],
];

function ProcessIcon({ name }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" };
  const paths = {
    camera: <><path d="M4 8.5h3l1.6-2.3h6.8L17 8.5h3a1.5 1.5 0 0 1 1.5 1.5v8.2a1.5 1.5 0 0 1-1.5 1.5H4a1.5 1.5 0 0 1-1.5-1.5V10A1.5 1.5 0 0 1 4 8.5Z"/><circle cx="12" cy="13.8" r="3.2"/></>,
    image: <><rect x="3" y="3.5" width="18" height="17" rx="1.7"/><circle cx="8.3" cy="8.4" r="1.2"/><path d="m4 18 5.7-5.6 3.6 3.2 2.4-2.1 4.2 4.1"/></>,
    sliders: <><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2" fill="#272832"/><circle cx="15" cy="12" r="2" fill="#272832"/><circle cx="8" cy="18" r="2" fill="#272832"/></>,
    document: <><path d="M6 2.8h8l5 5v13.4H6a2 2 0 0 1-2-2V4.8a2 2 0 0 1 2-2Z"/><path d="M14 3v5h5M8 13h8M8 17h8"/></>,
  };

  return <svg className="problem-step-icon" viewBox="0 0 24 24" aria-hidden="true" {...common}>{paths[name]}</svg>;
}

function CheckMark() {
  return <span className="problem-check" aria-hidden="true"><svg viewBox="0 0 20 20" fill="none"><path d="m4.5 10.2 3.4 3.4 7.6-7.3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>;
}

function ProblemSection() {
  const videoRef = useRef(null);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPlayback = () => {
      const video = videoRef.current;
      if (!video) return;
      video.autoplay = !preference.matches;
      if (preference.matches) video.pause();
      else video.play().catch(() => {});
    };

    syncPlayback();
    preference.addEventListener("change", syncPlayback);
    return () => preference.removeEventListener("change", syncPlayback);
  }, []);

  return (
    <section className="problem-section reference-section" aria-labelledby="problem-title">
      <div className="problem-frame">
        <header className="problem-heading reveal">
          <span className="problem-kicker">Il problema</span>
          <h2 id="problem-title" className="split-title">
            <span className="problem-title-main">Vendere è il tuo lavoro.</span>
          {" "}
            <span className="problem-title-sub">Preparare gli annunci non dovrebbe esserlo.</span>
          </h2>
          <p className="split-subtitle">Fotografare ogni capo, trovare lo sfondo giusto, sistemare le immagini e scrivere descrizioni. Tutto questo richiede tempo. Tempo che potresti dedicare a far crescere il tuo business.</p>
        </header>

        <div className="problem-cards">
          <article className="problem-card problem-card--friction reveal">
            <video ref={videoRef} className="problem-card-video" src="/problem-listing-loop.mp4" autoPlay muted loop playsInline preload="metadata" aria-hidden="true" />
            <div className="problem-card-shade" aria-hidden="true" />
            <div className="problem-card-copy">
              <span className="problem-card-tag problem-card-tag--outline">Senza Resella</span>
              <h3>Ogni prodotto è una nuova perdita di tempo.</h3>
              <ul className="problem-steps problem-steps--friction">
                {prepFriction.map(([icon, label]) => <li key={label}><ProcessIcon name={icon}/><span>{label}</span></li>)}
              </ul>
            </div>
          </article>

          <article className="problem-card problem-card--solution reveal">
            <img className="problem-card-visual" src={problemProductVisual} alt="Anteprima Resella: un capo trasformato in immagini curate e descrizione pronta" loading="lazy" />
            <div className="problem-card-wash" aria-hidden="true" />
            <div className="problem-card-copy">
              <span className="problem-card-tag">Con Resella</span>
              <h3>Un capo, pochi passaggi, un annuncio pronto.</h3>
              <p className="problem-card-description">Immagini curate e una descrizione pronta da copiare. Scarica tutto e pubblica dove preferisci.</p>
              <ul className="problem-steps problem-steps--solution">
                <li><CheckMark/><span>Carica la foto del tuo capo</span></li>
                <li><CheckMark/><span>Scarica le immagini curate</span></li>
                <li><CheckMark/><span>Copia la descrizione pronta</span></li>
              </ul>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

const galleryResults = [
  { id: "blue-fleece", filter: "worn", src: galleryBlueFleece, original: originalBlueFleece, alt: "Pile blu fantasia indossato" },
  { id: "dark-jeans", filter: "worn", src: galleryDarkJeans, original: originalDarkJeans, alt: "Jeans scuri indossati, vista posteriore" },
  { id: "light-jeans", filter: "worn", src: galleryLightJeans, original: originalLightJeans, alt: "Jeans chiari indossati, vista posteriore" },
  { id: "black-sweatshirt", filter: "worn", src: galleryBlackSweatshirt, original: originalBlackSweatshirt, alt: "Felpa nera indossata con ricami sulle maniche" },
  { id: "denim-jacket", filter: "worn", src: galleryDenimJacket, original: originalDenimJacket, alt: "Giacca di jeans indossata con pantaloni cargo" },
  { id: "bulls-hoodie", filter: "flatlay", src: galleryBullsHoodie, original: originalBullsHoodie, alt: "Felpa rossa Chicago Bulls stesa su fondo scuro" },
  { id: "yellow-hoodie", filter: "flatlay", src: galleryYellowHoodie, original: originalYellowHoodie, alt: "Felpa gialla stesa su fondo azzurro con dettagli decorativi" },
  { id: "kappa-windbreaker", filter: "flatlay", src: galleryKappaWindbreaker, original: originalKappaWindbreaker, alt: "Giacca Kappa nera stesa su tappeto beige" },
  { id: "navy-jacket", filter: "flatlay", src: galleryNavyJacket, original: originalNavyJacket, alt: "Giacca Nike blu navy stesa su fondo chiaro" },
  { id: "adidas-windbreaker", filter: "flatlay", src: galleryAdidasWindbreaker, original: originalAdidasWindbreaker, alt: "Giacca Adidas nera e bordeaux stesa su fondo verde" },
];

function Gallery() {
  const [pinnedOriginal, setPinnedOriginal] = useState(null);

  return (
    <section className="gallery reference-section" id="risultati" aria-labelledby="gallery-title">
      <div className="frame gallery-frame">
        <header className="gallery-heading reveal">
          <span className="gallery-kicker">Risultati</span>
          <h2 id="gallery-title" className="split-title">Una griglia di risultati <strong>che parla da sola.</strong></h2>
          <p className="split-subtitle">Dalle foto scattate in casa a immagini pronte per vendere, in un colpo d’occhio.</p>
        </header>
        <div className="gallery-grid">
          {galleryResults.map((result, index) => (
            <figure className="gallery-card reveal" key={result.id} style={{ transitionDelay: `${(index % 5) * 42}ms` }}>
              <button
                className={`gallery-photo-toggle${pinnedOriginal === result.id ? " is-original" : ""}`}
                type="button"
                aria-pressed={pinnedOriginal === result.id}
                aria-label={`${pinnedOriginal === result.id ? "Mostra il risultato Resella" : "Mostra la foto originale"}: ${result.alt}`}
                onClick={() => setPinnedOriginal((current) => current === result.id ? null : result.id)}
              >
                <img className="gallery-photo gallery-photo--result" src={result.src} alt="" loading="lazy" />
                <img className="gallery-photo gallery-photo--original" src={result.original} alt="" loading="lazy" />
              </button>
            </figure>
          ))}
        </div>
        <div className="gallery-actions reveal">
          <a className="action gallery-cta" href={appUrl}>Prova gratis<Arrow /></a>
        </div>
      </div>
    </section>
  );
}

const foldFeatures = {
  left: [
    { icon: "symmetry", title: "Simmetria", description: "Allineamento perfetto del capo e delle maniche per un risultato armonioso." },
    { icon: "folds", title: "Pieghe naturali", description: "Pieghe pulite e realistiche che valorizzano la forma del capo." },
    { icon: "balance", title: "Equilibrio visivo", description: "Inquadratura e proporzioni studiate per un flat lay più armonioso." },
  ],
  right: [
    { icon: "chart", title: "Look più vendibile", description: "Un aspetto curato che cattura l’attenzione e valorizza il capo." },
    { icon: "image", title: "Composizione pulita", description: "Un flat lay ordinato, chiaro e professionale, in stile Depop." },
    { icon: "phone", title: "Pronto per Depop", description: "Immagini ottimizzate per la visualizzazione sulla piattaforma." },
  ],
};

function FoldIcon({ name }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
  const paths = {
    symmetry: <><path d="M16 5v22M8 9 4 13l4 4M24 9l4 4-4 4M11 8l-3 5 3 5M21 8l3 5-3 5"/><path d="M5 23h7M20 23h7"/></>,
    folds: <><path d="M3 9c3-4 6 4 9 0s6 4 9 0 6 4 8 0M3 16c3-4 6 4 9 0s6 4 9 0 6 4 8 0M3 23c3-4 6 4 9 0s6 4 9 0 6 4 8 0"/></>,
    balance: <><rect x="7" y="7" width="18" height="18" rx="2"/><path d="M12 3H6a3 3 0 0 0-3 3v6M20 29h6a3 3 0 0 0 3-3v-6M3 20v6a3 3 0 0 0 3 3h6M29 12V6a3 3 0 0 0-3-3h-6"/></>,
    chart: <><path d="M4 27V17h6v10M14 27V11h6v16M24 27V5h6v22M4 12l8-6 6 2 9-6"/><path d="M23 2h4v4"/></>,
    image: <><rect x="3" y="4" width="26" height="24" rx="3"/><circle cx="11" cy="12" r="2"/><path d="m5 24 8-8 5 5 4-4 7 7"/></>,
    phone: <><rect x="9" y="2.5" width="14" height="27" rx="3"/><path d="M14 6h4M14 25.5h4"/></>,
  };

  return <svg className="fold-feature-icon" viewBox="0 0 32 32" aria-hidden="true" {...common}>{paths[name]}</svg>;
}

function FoldFeature({ feature }) {
  return (
    <li className="fold-feature reveal">
      <span className="fold-feature-mark"><FoldIcon name={feature.icon} /></span>
      <span className="fold-feature-copy">
        <strong>{feature.title}</strong>
        <span>{feature.description}</span>
      </span>
    </li>
  );
}

function FoldColumn({ title, features, side }) {
  return (
    <div className={`fold-column fold-column--${side}`}>
      <h3>{title}</h3>
      <ul>{features.map((feature) => <FoldFeature key={feature.title} feature={feature} />)}</ul>
    </div>
  );
}

function DepopFoldSection() {
  return (
    <section className="fold-section reference-section" aria-labelledby="fold-title">
      <div className="frame fold-frame">
        <header className="fold-heading reveal">
          <span className="gallery-kicker">Depop Fold</span>
          <h2 id="fold-title" className="split-title">Padroneggia il <strong>Depop Fold.</strong></h2>
          <p className="fold-subheading split-subtitle">Resella capisce equilibrio, pieghe e composizione.</p>
          <p className="fold-description">Analizza i tuoi capi e ti guida nella creazione di flat lay puliti, simmetrici e curati.</p>
        </header>

        <div className="fold-layout">
          <FoldColumn title="Cosa curiamo" features={foldFeatures.left} side="left" />
          <div className="fold-showcase">
            <div className="fold-video-frame reveal">
              <video
                className="fold-video"
                src="/depop-fold-loop.mp4"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-hidden="true"
                tabIndex={-1}
              />
            </div>
            <div className="fold-actions reveal">
              <a className="action fold-video-action" href={appUrl}>Prova gratis<Arrow /></a>
              <a className="fold-more-link" href="#risultati">Scopri altri esempi<Arrow /></a>
            </div>
          </div>
          <FoldColumn title="Nel risultato" features={foldFeatures.right} side="right" />
        </div>
      </div>
    </section>
  );
}

function PartnerSection() {
  return (
    <section className="partner-section reference-section" aria-labelledby="partner-title">
      <div className="partner-content reveal">
        <h2 id="partner-title" className="partner-title split-title">
          <strong>Genesis Vintage</strong> è partner ufficiale di Resella.
        </h2>
        <p className="partner-subtitle split-subtitle">
          Un reseller reale che utilizza Resella per preparare i propri annunci in modo più veloce.
        </p>
        <a className="partner-profile" href="https://genesisvintage.it/" target="_blank" rel="noreferrer" aria-label="Visita il sito di Genesis Vintage in una nuova scheda">
          <img src={genesisVintageLogo} alt="" aria-hidden="true" loading="lazy" />
          <span className="partner-name">Genesis Vintage</span>
          <span className="partner-verified" role="img" aria-label="Partner verificato">
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="m5 10.2 3.2 3.2 6.8-6.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </a>
      </div>
    </section>
  );
}

function Markets() {
  const logos = [[marketVinted, "Vinted"], [marketDepop, "Depop"], [marketWallapop, "Wallapop"], [marketEbay, "eBay"], [marketEtsy, "Etsy"], [marketVestiaire, "Vestiaire Collective"]];
  return (
    <section className="markets reference-section" id="marketplaces" aria-labelledby="markets-title">
      <div className="markets-content reveal">
        <span className="markets-kicker">I marketplace che usi già</span>
        <h2 id="markets-title" className="split-title">Annunci pronti per i <strong>marketplace</strong> che preferisci.</h2>
        <p className="split-subtitle">Con Resella <strong>scarichi</strong> le immagini, <strong>copi</strong> il testo e <strong>pubblichi manualmente</strong>.</p>
        <div className="market-logos" role="region" aria-label="Marketplace per la pubblicazione manuale" tabIndex={0}>
          <div className="market-track">
            {[false, true].map((duplicate) => (
              <div
                key={duplicate ? "duplicate" : "original"}
                className={`market-group${duplicate ? " market-group--duplicate" : ""}`}
                role={duplicate ? undefined : "list"}
                aria-hidden={duplicate || undefined}
              >
                {logos.map(([src, name]) => (
                  <div key={name} className="market-card" role={duplicate ? undefined : "listitem"}>
                    <img className={name === "Wallapop" ? "market-logo--wallapop" : undefined} src={src} alt={duplicate ? "" : name} loading="lazy" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  useSmoothScroll();
  useScrollReveal();
  return <>
    <a className="skip-link" href="#contenuto">Vai al contenuto</a>
    <Header />
    <main id="contenuto">
      <Hero />
      <div className="hero-panel" aria-hidden="true"><video src="/hero-loop.mp4" autoPlay muted loop playsInline preload="auto" tabIndex={-1} /></div>
      <ProblemSection />
      <Markets />
      <Gallery />
      <PartnerSection />
      <DepopFoldSection />
    </main>
  </>;
}
