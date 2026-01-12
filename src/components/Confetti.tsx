import React, { useEffect, useState, useRef } from 'react';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    size: number;
    rotation: number;
    rotationSpeed: number;
}

interface ConfettiProps {
    trigger: boolean;
    onComplete?: () => void;
}

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];

export const Confetti: React.FC<ConfettiProps> = ({ trigger, onComplete }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isActive, setIsActive] = useState(false);
    const particlesRef = useRef<Particle[]>([]);
    const animationRef = useRef<number>();

    useEffect(() => {
        if (trigger && !isActive) {
            setIsActive(true);
            createParticles();
            animate();
        }
    }, [trigger]);

    const createParticles = () => {
        const particles: Particle[] = [];
        const canvas = canvasRef.current;
        if (!canvas) return;

        const centerX = canvas.width / 2;
        const startY = canvas.height / 2;

        for (let i = 0; i < 100; i++) {
            particles.push({
                x: centerX,
                y: startY,
                vx: (Math.random() - 0.5) * 15,
                vy: Math.random() * -15 - 5,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                size: Math.random() * 8 + 4,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 10
            });
        }

        particlesRef.current = particles;
    };

    const animate = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let allDone = true;

        particlesRef.current.forEach(particle => {
            particle.vy += 0.3; // gravity
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.rotation += particle.rotationSpeed;
            particle.vx *= 0.99; // friction

            if (particle.y < canvas.height + 50) {
                allDone = false;

                ctx.save();
                ctx.translate(particle.x, particle.y);
                ctx.rotate((particle.rotation * Math.PI) / 180);
                ctx.fillStyle = particle.color;
                ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size * 0.6);
                ctx.restore();
            }
        });

        if (allDone) {
            setIsActive(false);
            onComplete?.();
        } else {
            animationRef.current = requestAnimationFrame(animate);
        }
    };

    useEffect(() => {
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    if (!isActive) return null;

    return (
        <canvas
            ref={canvasRef}
            width={window.innerWidth}
            height={window.innerHeight}
            className="fixed inset-0 pointer-events-none z-[9999]"
        />
    );
};

export default Confetti;
