// ═══════════════════════════════════════════════════════════════════
// M4 STREAMLINE - Confetti Success Animation
// ═══════════════════════════════════════════════════════════════════

function triggerConfetti() {
    // Create canvas for confetti
    const canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    
    // Confetti particles
    const confetti = [];
    const colors = ['#14b8a6', '#0d9488', '#2dd4bf', '#5eead4', '#99f6e4']; // Teal shades
    const particleCount = 150;
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
        confetti.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            r: Math.random() * 6 + 2,
            d: Math.random() * particleCount,
            color: colors[Math.floor(Math.random() * colors.length)],
            tilt: Math.floor(Math.random() * 10) - 10,
            tiltAngleIncremental: Math.random() * 0.07 + 0.05,
            tiltAngle: 0
        });
    }
    
    let animationFrame;
    let startTime = Date.now();
    const duration = 2000; // 2 seconds
    
    function draw() {
        const elapsed = Date.now() - startTime;
        if (elapsed > duration) {
            cancelAnimationFrame(animationFrame);
            document.body.removeChild(canvas);
            return;
        }
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        confetti.forEach((p, i) => {
            ctx.beginPath();
            ctx.lineWidth = p.r / 2;
            ctx.strokeStyle = p.color;
            ctx.moveTo(p.x + p.tilt + p.r / 4, p.y);
            ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4);
            ctx.stroke();
            
            // Update
            p.tiltAngle += p.tiltAngleIncremental;
            p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
            p.tilt = Math.sin(p.tiltAngle) * 15;
            
            // Reset if off screen
            if (p.y > canvas.height) {
                confetti[i] = {
                    x: Math.random() * canvas.width,
                    y: -20,
                    r: p.r,
                    d: p.d,
                    color: p.color,
                    tilt: Math.floor(Math.random() * 10) - 10,
                    tiltAngleIncremental: p.tiltAngleIncremental,
                    tiltAngle: p.tiltAngle
                };
            }
        });
        
        animationFrame = requestAnimationFrame(draw);
    }
    
    draw();
}

// Usage: Call triggerConfetti() when invoice is marked paid or quote accepted
// Example in crud.js:
// After invoice marked paid: triggerConfetti();
// After quote accepted: triggerConfetti();

console.log('✅ Confetti animation loaded');
