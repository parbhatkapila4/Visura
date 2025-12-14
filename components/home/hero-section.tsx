"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, Suspense } from "react";
import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Environment, Sphere } from "@react-three/drei";
import * as THREE from "three";

const FloatingShape = ({ position, color, speed = 1, distort = 0.4 }: any) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2 * speed;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3 * speed;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef} position={position}>
        <icosahedronGeometry args={[1, 1]} />
        <MeshDistortMaterial
          color={color}
          roughness={0.1}
          metalness={0.8}
          distort={distort}
          speed={2}
        />
      </mesh>
    </Float>
  );
};

const FloatingTorus = ({ position, color }: any) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.5;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={2} floatIntensity={1}>
      <mesh ref={meshRef} position={position}>
        <torusGeometry args={[1, 0.4, 16, 32]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.9} />
      </mesh>
    </Float>
  );
};

const Scene = () => {
  const { viewport, mouse } = useThree();
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        mouse.x * 0.2,
        0.05
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        -mouse.y * 0.1,
        0.05
      );
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -10]} color="#ff6b00" intensity={0.5} />
      <pointLight position={[10, 10, 10]} color="#00ff88" intensity={0.3} />

      <FloatingShape position={[-3, 1, -2]} color="#ff6b00" speed={0.8} distort={0.3} />
      <FloatingShape position={[3, -1, -1]} color="#00ff88" speed={1.2} distort={0.5} />
      <FloatingShape position={[0, 2, -3]} color="#0088ff" speed={1} distort={0.4} />
      <FloatingTorus position={[-2, -2, -2]} color="#ff00ff" />
      <FloatingTorus position={[4, 1, -4]} color="#ffff00" />

      <Environment preset="city" />
    </group>
  );
};

const AnimatedText = ({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) => {
  const letters = text.split("");

  return (
    <span className={className}>
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 50, rotateX: -90 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{
            duration: 0.5,
            delay: delay + i * 0.03,
            ease: [0.215, 0.61, 0.355, 1],
          }}
          className="inline-block"
          style={{ transformOrigin: "bottom" }}
        >
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </span>
  );
};

const GlowingButton = ({
  children,
  href,
  primary = false,
}: {
  children: React.ReactNode;
  href: string;
  primary?: boolean;
}) => {
  return (
    <Link href={href}>
      <motion.button
        className={`relative px-8 py-4 text-lg font-semibold rounded-full overflow-hidden ${
          primary ? "bg-white text-black" : "bg-transparent text-white border border-white/30"
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {primary && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-[#ff6b00] via-[#ff00ff] to-[#00ff88]"
            initial={{ x: "-100%" }}
            whileHover={{ x: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
        <span
          className={`relative z-10 flex items-center gap-2 ${
            primary ? "group-hover:text-white" : ""
          }`}
        >
          {children}
          <motion.svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            initial={{ x: 0 }}
            whileHover={{ x: 5 }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </motion.svg>
        </span>
        {primary && (
          <motion.span
            className="absolute inset-0 flex items-center justify-center gap-2 text-white opacity-0"
            whileHover={{ opacity: 1 }}
          >
            {children}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </motion.span>
        )}
      </motion.button>
    </Link>
  );
};

const FloatingBadge = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative mb-8"
    >
      <motion.div
        className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-black/50 backdrop-blur-xl border border-white/10"
        animate={{
          boxShadow: [
            "0 0 20px rgba(255, 107, 0, 0.3)",
            "0 0 40px rgba(255, 0, 255, 0.3)",
            "0 0 20px rgba(0, 255, 136, 0.3)",
            "0 0 20px rgba(255, 107, 0, 0.3)",
          ],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <motion.div
          className="w-2 h-2 rounded-full bg-[#00ff88]"
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <span className="text-sm font-medium text-white/90">Powered by GPT-4 Turbo</span>
        <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-[#ff6b00] to-[#ff00ff] text-xs font-bold text-white">
          NEW
        </span>
      </motion.div>
    </motion.div>
  );
};

const ScrollIndicator = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2 }}
      className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
    >
      <span className="text-xs text-white/40 uppercase tracking-widest">Scroll to explore</span>
    </motion.div>
  );
};

export default function HeroSection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ff6b00] via-[#ff00ff] to-[#00ff88] origin-left z-[100]"
        style={{ scaleX: scrollYProgress }}
      />

      <section
        ref={containerRef}
        className="relative h-[200vh]"
        style={{
          willChange: "scroll-position",
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
        }}
      >
        <div
          className="sticky top-0 h-screen overflow-hidden bg-black"
          style={{
            willChange: "transform",
            transform: "translateZ(0)",
            backfaceVisibility: "hidden",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              willChange: "transform",
              transform: "translateZ(0)",
              backfaceVisibility: "hidden",
            }}
          >
            <Canvas
              camera={{ position: [0, 0, 8], fov: 45 }}
              dpr={[1, 2]}
              performance={{ min: 0.5 }}
              gl={{
                antialias: true,
                alpha: true,
                powerPreference: "high-performance",
                stencil: false,
                depth: true,
              }}
            >
              <Suspense fallback={null}>
                <Scene />
              </Suspense>
            </Canvas>
          </div>

          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,black_70%)]" />

          <motion.div
            className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center"
            style={{
              y,
              opacity,
              scale,
              willChange: "transform, opacity",
              backfaceVisibility: "hidden",
            }}
          >
            <FloatingBadge />

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tighter mb-6">
              <AnimatedText text="Documents" className="block text-white" delay={0.3} />
              <AnimatedText
                text="that think."
                className="block bg-gradient-to-r from-[#ff6b00] via-[#ff00ff] to-[#00ff88] bg-clip-text text-transparent"
                delay={0.8}
              />
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.5 }}
              className="text-lg md:text-xl text-white/60 max-w-2xl mb-12 leading-relaxed"
            >
              Upload any document. Watch AI extract insights, answer questions, and transform how
              you understand information. In seconds.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.8 }}
              className="flex flex-col sm:flex-row items-center gap-4"
            >
              <SignedOut>
                <GlowingButton href="/sign-up" primary>
                  Start Free
                </GlowingButton>
                <GlowingButton href="#demo">See it work</GlowingButton>
              </SignedOut>
              <SignedIn>
                <GlowingButton href="/upload" primary>
                  Upload Now
                </GlowingButton>
                <GlowingButton href="/dashboard">Dashboard</GlowingButton>
              </SignedIn>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 2.2 }}
              className="mt-16 flex items-center gap-12"
            >
              {[
                { value: "5K+", label: "Documents" },
                { value: "99%", label: "Accuracy" },
                { value: "<30s", label: "Processing" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-xs text-white/40 uppercase tracking-wider mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>

            <ScrollIndicator />
          </motion.div>
        </div>
      </section>
    </>
  );
}
