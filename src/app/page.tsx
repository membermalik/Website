"use client";

import Link from "next/link";
import Image from "next/image";
import { Footer } from "@/components/footer";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion, useMotionValue, useMotionValueEvent, animate, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import MagneticButton from "@/components/ui/MagneticButton";

const InteractiveDiamonds = dynamic(() => import("@/components/three/InteractiveDiamonds"), { ssr: false });

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [activeScene, setActiveScene] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Force capture of video duration immediately on mount, fixing race conditions with cached HTML5 videos
  useEffect(() => {
    if (videoRef.current && videoRef.current.readyState >= 1) {
      setVideoDuration(videoRef.current.duration);
    }
  }, []);

  useEffect(() => {
    if (isMobile && videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          videoRef.current?.pause();
        }).catch((err) => {
          console.log("Video priming suppressed by browser:", err);
        });
      }
    }
  }, [isMobile]);

  // Intersection Observer for definitive, CSS-agnostic scene tracking
  const observer = useRef<IntersectionObserver | null>(null);

  const sceneRef = (index: number) => (node: HTMLDivElement | null) => {
    if (typeof window === "undefined") return;

    if (!observer.current) {
      observer.current = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const targetIndex = Number((entry.target as HTMLDivElement).dataset.sceneIndex);
            if (!isNaN(targetIndex)) {
              setActiveScene(targetIndex);
            }
          }
        });
      }, {
        root: scrollContainerRef.current,
        threshold: 0.51, // Needs to be >50% on screen to become active
      });
    }

    if (node) {
      node.dataset.sceneIndex = index.toString();
      observer.current.observe(node);
    }
  };

  // Independent Video Time Motion Value for Snap-Based Playback
  const videoTime = useMotionValue(0);

  // When active scene changes, animate the video smoothly to the target time
  useEffect(() => {
    if (!videoRef.current || !videoDuration) return;

    let targetProgress = 0;
    if (activeScene === 0) targetProgress = 0.05; // start slightly in
    else if (activeScene === 1) targetProgress = 0.25; // slower apparent scrub speed
    else if (activeScene === 2) targetProgress = 0.45;
    else targetProgress = 0.65;

    const targetTime = targetProgress * videoDuration;

    const controls = animate(videoTime, targetTime, {
      type: "tween",
      ease: "easeInOut",
      duration: 1.5, // Fixed duration for a clean, stutter-free playback sequence
    });

    return () => controls.stop();
  }, [activeScene, videoDuration, videoTime]);

  // Apply video scrub smoothly
  useMotionValueEvent(videoTime, "change", (latest) => {
    if (videoRef.current) {
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = latest;
        }
      });
    }
  });

  // Parallax Scroll logic for the Artisanal section
  const { scrollYProgress } = useScroll({
    container: scrollContainerRef, // The actual scrollable div
    offset: ["start end", "end start"]
  });

  // We want the text to fade in right as scene 3 (the white box) becomes central
  // Since we added a footer, the total scroll height changed. We must trigger the fade-in much earlier.
  const parallaxY = useTransform(scrollYProgress, [0.4, 0.6], [80, 0]);
  const parallaxOpacity = useTransform(scrollYProgress, [0.4, 0.6], [0, 1]);

  // Scene variants with staggered timing to prevent overlap during scroll
  const textVariants: any = {
    hidden: {
      opacity: 0, y: 40, scale: 0.95,
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
    },
    hiddenTop: {
      opacity: 0, y: -40, scale: 1,
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
    },
    visible: {
      opacity: 1, y: 0, scale: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }
    }
  };

  return (
    <div
      ref={scrollContainerRef}
      className="w-full h-[calc(100vh-64px)] overflow-y-auto snap-y snap-mandatory custom-scrollbar scroll-smooth bg-transparent relative"
    >
      <section
        ref={containerRef}
        className="relative w-full"
      >
        {/* Actual invisible Snap Blocks driving the scroll container */}
        <div className="w-full pointer-events-none flex flex-col z-50">
          <div ref={sceneRef(0)} className="w-full h-[calc(100vh-64px)] snap-start snap-always" />
          <div ref={sceneRef(1)} className="w-full h-[calc(100vh-64px)] snap-start snap-always" />
          <div ref={sceneRef(2)} className="w-full h-[calc(100vh-64px)] snap-start snap-always" />
        </div>

        {/* Sticky Fixed Container for Hero Effects */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="sticky top-0 left-0 h-[calc(100vh-64px)] w-full flex items-center justify-center overflow-hidden bg-[#E3DAC9] z-0 pointer-events-auto">

            {/* Background layers */}
            <div className="absolute inset-0 z-0 overflow-hidden">
              <motion.div
                className="absolute inset-x-0 top-0 h-full w-full"
              >
                <video
                  ref={videoRef}
                  src="/leather_hq.mp4"
                  poster="/leather_poster.jpg"
                  onLoadedMetadata={(e) => setVideoDuration(e.currentTarget.duration)}
                  preload="auto"
                  muted
                  playsInline
                  webkit-playsinline="true"
                  x5-video-player-type="h5"
                  x5-video-player-fullscreen="false"
                  className="w-full h-full object-cover object-center scale-110"
                />
                {/* Cinematic Spotlight Vignette */}
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] z-10 mix-blend-multiply" />
              </motion.div>

              {/* Interactive Diamonds (Always visible) */}
              <motion.div
                className="absolute inset-0 w-full h-full"
              >
                <InteractiveDiamonds />
              </motion.div>
            </div>

            {/* Foreground content container */}
            <div className="relative z-20 w-full max-w-4xl px-6 flex flex-col items-center justify-center text-center h-full">

              {/* SCENE 1 */}
              <motion.div
                variants={textVariants}
                initial="visible"
                animate={activeScene === 0 ? "visible" : "hiddenTop"}
                className={`absolute flex flex-col items-center w-full ${activeScene === 0 ? "pointer-events-auto" : "pointer-events-none z-0"}`}
              >
                <span className="text-xs md:text-sm uppercase tracking-[0.3em] md:tracking-[0.4em] mb-4 md:mb-6 flex items-center gap-2 md:gap-3 text-neutral-800/80 font-medium">
                  <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-neutral-800/80" />
                  14k Gold & Diamonds
                  <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-neutral-800/80" />
                </span>
                <h1 className="text-5xl md:text-8xl font-serif tracking-tight mb-6 md:mb-8 text-neutral-950 leading-tight drop-shadow-sm">
                  Wear Your Story <br className="hidden md:block" /> With <span className="italic font-light">Elegance</span>.
                </h1>
                <p className="text-lg md:text-xl text-neutral-800/90 mb-10 max-w-2xl font-light leading-relaxed drop-shadow-sm px-4 md:px-0">
                  Discover our exclusive collection of personalized name and letter necklaces, precision-set with radiant diamonds.
                </p>
              </motion.div>

              {/* SCENE 2 */}
              <motion.div
                variants={textVariants}
                initial="hidden"
                animate={activeScene === 1 ? "visible" : (activeScene > 1 ? "hiddenTop" : "hidden")}
                className={`absolute flex flex-col items-center w-full pointer-events-none z-10`}
              >
                <h2 className="text-4xl md:text-7xl font-serif tracking-tight mb-6 md:mb-8 text-neutral-950 leading-tight max-w-4xl drop-shadow-sm px-4 md:px-0">
                  Uncompromising <br className="hidden md:block" /> <span className="italic font-light text-neutral-800">Craftsmanship</span>.
                </h2>
                <p className="text-lg md:text-xl text-neutral-800/90 max-w-2xl font-light leading-relaxed drop-shadow-sm px-4 md:px-0">
                  Every edge polished by hand. Every facet perfectly placed to catch the light. Created down to the finest detail for a piece that is truly yours.
                </p>
              </motion.div>

              {/* SCENE 3 */}
              <motion.div
                variants={textVariants}
                initial="hidden"
                animate={activeScene === 2 ? "visible" : (activeScene > 2 ? "hiddenTop" : "hidden")}
                className={`absolute flex flex-col items-center w-full mt-20 ${activeScene === 2 ? "pointer-events-auto z-20" : "pointer-events-none z-0"}`}
              >
                <h3 className="text-4xl md:text-6xl font-serif tracking-tight mb-12 text-neutral-950 leading-tight drop-shadow-sm">
                  Begin Your Design.
                </h3>
                <div className="flex flex-col sm:flex-row gap-6">
                  <MagneticButton>
                    <Link
                      href="/customizer"
                      className="px-12 py-5 bg-neutral-950 text-white hover:bg-neutral-800 transition-all uppercase tracking-[0.2em] text-sm font-semibold flex items-center justify-center gap-3 group shadow-xl rounded-sm"
                    >
                      Enter Customizer <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                    </Link>
                  </MagneticButton>
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      </section>

      {/* Editorial Image Section: Crafting Process */}
      <section ref={sceneRef(3)} className="relative w-full min-h-[calc(100vh-64px)] bg-[#f4f1eb] text-[#2a2826] flex flex-col md:flex-row items-stretch snap-start snap-always border-t border-[#e8e4dc] overflow-hidden">

        {/* Left: Typography content (Parallax Animated) */}
        <motion.div
          style={{ y: parallaxY, opacity: parallaxOpacity }}
          className="w-full md:w-5/12 lg:w-1/2 px-8 py-20 md:p-24 lg:p-32 flex flex-col justify-center items-start z-10"
        >
          <span className="text-xs uppercase tracking-[0.3em] font-medium text-[#222222] mb-8 flex items-center gap-3">
            <Sparkles className="w-3.5 h-3.5" />
            The Artisanal Process
          </span>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-serif tracking-tight leading-[1.1] mb-10 text-[#000000]">
            Made by Hand, <br />
            <span className="italic font-light text-[#222222]">Perfected by Eye.</span>
          </h2>
          <div className="w-16 h-[1px] bg-[#444444] mb-10"></div>
          <p className="text-lg md:text-xl text-[#111111] leading-relaxed font-normal mb-8 max-w-lg">
            Each exquisite piece is meticulously hand-assembled in our atelier. We precision-set every individual diamond under magnification, ensuring flawless alignment and breathtaking brilliance.
          </p>
          <p className="text-lg md:text-xl text-[#111111] leading-relaxed font-normal mb-14 max-w-lg">
            It is a delicate dance of patience and unparalleled skill, resulting in a timeless treasure forged just for you.
          </p>
          <MagneticButton>
            <Link
              href="/about"
              className="uppercase tracking-[0.25em] text-xs font-bold pb-2 border-b-[1.5px] border-[#000000] text-[#000000] hover:text-[#444444] hover:border-[#444444] transition-all duration-300"
            >
              Discover Our Craft
            </Link>
          </MagneticButton>
        </motion.div>

        {/* Right: Asymmetrical Edge-Bleeding Image */}
        <div className="w-full md:w-7/12 lg:w-1/2 relative min-h-[60vh] md:min-h-full">
          {/* Subtle overlay to blend the image into the beige background */}
          <div className="absolute inset-0 bg-[#f4f1eb]/10 z-10 mix-blend-multiply pointer-events-none" />
          <Image
            src="/images/crafting_process.png"
            alt="Artisan crafting a diamond love necklace"
            fill
            unoptimized
            quality={100}
            sizes="(max-width: 768px) 100vw, 60vw"
            className="object-cover object-center"
          />
        </div>
      </section>

      {/* Footer as part of the scrolling container */}
      <div className="w-full snap-start shrink-0 z-50">
        <Footer />
      </div>
    </div>
  );
}
