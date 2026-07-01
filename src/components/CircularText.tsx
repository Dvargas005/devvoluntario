"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion, useAnimationControls } from "motion/react";

interface CircularTextProps {
  text: string;
  spinDuration?: number;
  onHover?: "speedUp" | "slowDown" | "pause";
  className?: string;
  size?: number;
}

function startSpin(
  controls: ReturnType<typeof useAnimationControls>,
  duration: number
) {
  controls.start({
    rotate: [0, 360],
    transition: {
      rotate: {
        ease: "linear",
        duration,
        repeat: Infinity,
      },
    },
  });
}

export default function CircularText({
  text,
  spinDuration = 20,
  onHover = "speedUp",
  className = "",
  size = 200,
}: CircularTextProps) {
  const id = useId();
  const pathId = `circular-path-${id}`;
  const controls = useAnimationControls();
  const [hovered, setHovered] = useState(false);
  const currentDuration = useRef(spinDuration);

  const r = size / 2 - 16;
  const cx = size / 2;
  const cy = size / 2;

  useEffect(() => {
    const duration = hovered
      ? onHover === "speedUp"
        ? spinDuration / 4
        : onHover === "slowDown"
          ? spinDuration * 2
          : spinDuration
      : spinDuration;

    if (hovered && onHover === "pause") {
      controls.stop();
      return;
    }

    currentDuration.current = duration;
    startSpin(controls, duration);
  }, [spinDuration, hovered, onHover, controls]);

  return (
    <motion.div
      className={className}
      style={{
        width: size,
        height: size,
        cursor: "pointer",
      }}
      animate={controls}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        aria-hidden="true"
      >
        <defs>
          <path
            id={pathId}
            d={`M ${cx},${cy - r} A ${r},${r} 0 1,1 ${cx - 0.01},${cy - r}`}
          />
        </defs>
        <text
          fill="currentColor"
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.08em",
            fontFamily: "var(--font-sans)",
          }}
        >
          <textPath href={`#${pathId}`} startOffset="0%">
            {text}
          </textPath>
        </text>
      </svg>
    </motion.div>
  );
}
