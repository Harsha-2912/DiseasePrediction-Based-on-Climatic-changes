import React, { useEffect, useRef } from 'react';

const Background3D = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        let animationId;

        // Particles
        const particles = [];
        const PARTICLE_COUNT = 60;
        const COLORS = [
            'rgba(99, 102, 241, 0.4)',   // Indigo
            'rgba(6, 182, 212, 0.35)',    // Cyan
            'rgba(16, 185, 129, 0.3)',    // Emerald
            'rgba(245, 158, 11, 0.25)',   // Amber
            'rgba(236, 72, 153, 0.2)',    // Pink
        ];

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 2 + 0.5,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                speedX: (Math.random() - 0.5) * 0.3,
                speedY: (Math.random() - 0.5) * 0.3,
                pulse: Math.random() * Math.PI * 2,
                pulseSpeed: Math.random() * 0.02 + 0.005
            });
        }

        // Floating orbs (large blurry gradient circles)
        const orbs = [
            { x: width * 0.2, y: height * 0.3, radius: 250, color: 'rgba(99, 102, 241, 0.06)', speedX: 0.15, speedY: 0.1 },
            { x: width * 0.8, y: height * 0.2, radius: 200, color: 'rgba(6, 182, 212, 0.05)', speedX: -0.1, speedY: 0.12 },
            { x: width * 0.5, y: height * 0.7, radius: 300, color: 'rgba(236, 72, 153, 0.04)', speedX: 0.08, speedY: -0.08 },
            { x: width * 0.3, y: height * 0.8, radius: 180, color: 'rgba(245, 158, 11, 0.04)', speedX: -0.12, speedY: -0.06 },
        ];

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            // Draw orbs
            orbs.forEach(orb => {
                orb.x += orb.speedX;
                orb.y += orb.speedY;

                if (orb.x < -orb.radius) orb.x = width + orb.radius;
                if (orb.x > width + orb.radius) orb.x = -orb.radius;
                if (orb.y < -orb.radius) orb.y = height + orb.radius;
                if (orb.y > height + orb.radius) orb.y = -orb.radius;

                const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
                gradient.addColorStop(0, orb.color);
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
                ctx.fill();
            });

            // Draw particles
            particles.forEach(p => {
                p.x += p.speedX;
                p.y += p.speedY;
                p.pulse += p.pulseSpeed;

                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;

                const opacity = 0.3 + Math.sin(p.pulse) * 0.3;
                const r = p.radius + Math.sin(p.pulse) * 0.5;

                ctx.beginPath();
                ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
                ctx.fillStyle = p.color.replace(/[\d.]+\)$/, `${opacity})`);
                ctx.fill();
            });

            // Draw connection lines between nearby particles
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(99, 102, 241, ${0.06 * (1 - dist / 120)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }

            animationId = requestAnimationFrame(animate);
        };

        animate();

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);
        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: -3,
                pointerEvents: 'none'
            }}
        />
    );
};

export default Background3D;
