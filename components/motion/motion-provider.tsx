"use client";

import { MotionConfig } from "framer-motion";

/** Framer animations honour the visitor's reduced-motion setting site-wide. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
