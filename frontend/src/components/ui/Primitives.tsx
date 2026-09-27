import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "text-center" : "text-left"}>
      {eyebrow && (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-3 text-xs uppercase tracking-widest2 text-accent"
        >
          {eyebrow}
        </motion.p>
      )}
      <motion.h2
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="font-display text-4xl md:text-6xl font-light leading-[1.05]"
      >
        {title}
      </motion.h2>
    </div>
  );
}

export function Button({
  children,
  variant = "solid",
  as: Component = "button",
  className = "",
  ...props
}: {
  children: ReactNode;
  variant?: "solid" | "outline" | "ghost";
  as?: any;
  className?: string;
  [key: string]: any;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 px-7 py-3.5 text-xs uppercase tracking-widest2 transition-all duration-500 ease-cinematic";
  const styles: Record<string, string> = {
    solid: "bg-charcoal text-ivory hover:bg-accent",
    outline: "border border-charcoal/30 text-charcoal hover:border-accent hover:text-accent",
    ghost: "text-ivory hover:text-accent",
  };
  return (
    <Component className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </Component>
  );
}

export function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
