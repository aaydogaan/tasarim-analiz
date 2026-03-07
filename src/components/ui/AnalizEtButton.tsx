import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

interface AnalizEtButtonProps {
    onClick: () => void;
    className?: string;
}

export default function AnalizEtButton({ onClick, className = "" }: AnalizEtButtonProps) {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!buttonRef.current) return;
        const rect = buttonRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        setMousePos({ x, y });
    };

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => {
        setIsHovered(false);
        setMousePos({ x: 0, y: 0 });
    };

    return (
        <motion.button
            ref={buttonRef}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`
                relative px-12 py-5 rounded-full overflow-hidden
                bg-[#ff4d00] text-white font-display font-bold text-[18px]
                shadow-[0_20px_50px_rgba(255,77,0,0.3)]
                transition-shadow duration-300 hover:shadow-[0_25px_60px_rgba(255,77,0,0.4)]
                flex items-center gap-3 group
                ${className}
            `}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />

            {/* Moving Circle Background Effect */}
            <motion.div
                className="absolute w-32 h-32 bg-white/20 rounded-full blur-2xl pointer-events-none"
                animate={{
                    x: mousePos.x,
                    y: mousePos.y,
                    opacity: isHovered ? 1 : 0
                }}
                transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
            />

            {/* Text with Mouse Follow Effect */}
            <motion.div
                className="relative z-10 flex items-center gap-3"
                animate={{
                    x: mousePos.x * 0.2,
                    y: mousePos.y * 0.2
                }}
                transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
            >
                <span>Analiz Et</span>
                <motion.div
                    animate={{
                        rotate: isHovered ? 45 : 0,
                        x: isHovered ? 2 : 0,
                        y: isHovered ? -2 : 0
                    }}
                >
                    <ArrowUpRight className="w-5 h-5" />
                </motion.div>
            </motion.div>

            {/* Shine Effect on Hover */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
                animate={{
                    translateX: isHovered ? ["100%", "-100%"] : "-100%"
                }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear"
                }}
            />
        </motion.button>
    );
}
