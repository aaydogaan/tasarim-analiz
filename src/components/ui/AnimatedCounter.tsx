import React, { useEffect, useState, useRef } from 'react';
import { useInView, motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedCounterProps {
    value: number;
    duration?: number;
    suffix?: string;
    prefix?: string;
}

export default function AnimatedCounter({ value, duration = 2, suffix = "", prefix = "" }: AnimatedCounterProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const spring = useSpring(0, {
        mass: 1,
        stiffness: 100,
        damping: 30,
    });

    const display = useTransform(spring, (current) =>
        Math.round(current).toLocaleString()
    );

    useEffect(() => {
        if (isInView) {
            spring.set(value);
        }
    }, [isInView, value, spring]);

    return (
        <span ref={ref} className="tabular-nums font-display font-bold">
            {prefix}
            <motion.span>{display}</motion.span>
            {suffix}
        </span>
    );
}
