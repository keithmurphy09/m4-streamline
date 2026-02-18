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
    const colors = ['#14b8a6', '#0d9488', '#2dd4bf', '#5eead4', '#99f6e4', '#f59e0b', '#ec4899', '#8b5cf6']; // Teal + accents
    const shapes = ['square', 'circle', 'rectangle'];
    const particleCount = 200;
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
        confetti.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            w: Math.random() * 8 + 4,
            h: Math.random() * 6 + 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            shape: shapes[Math.floor(Math.random() * shapes.length)],
            rotation: Math.random() * 360,
            rotationSpeed: Math.random() * 10 - 5,
            velocityX: Math.random() * 4 - 2,
            velocityY: Math.random() * 2 + 1,
            gravity: 0.12
        });
    }
    
    let animationFrame;
    let startTime = Date.now();
    const duration = 3500; // 3.5 seconds
    
    function draw() {
        const elapsed = Date.now() - startTime;
        if (elapsed > duration) {
            cancelAnimationFrame(animationFrame);
            document.body.removeChild(canvas);
            return;
        }
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        confetti.forEach((p, i) => {
            ctx.save();
            ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
            ctx.rotate((p.rotation * Math.PI) / 180);
            
            ctx.fillStyle = p.color;
            
            if (p.shape === 'circle') {
                ctx.beginPath();
                ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
                ctx.fill();
            } else if (p.shape === 'square') {
                ctx.fillRect(-p.w / 2, -p.w / 2, p.w, p.w);
            } else {
                ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            }
            
            ctx.restore();
            
            // Update physics
            p.velocityY += p.gravity;
            p.x += p.velocityX;
            p.y += p.velocityY;
            p.rotation += p.rotationSpeed;
            
            // Add wave motion
            p.x += Math.sin(p.y / 50) * 0.5;
            
            // Reset if off screen
            if (p.y > canvas.height) {
                confetti[i] = {
                    x: Math.random() * canvas.width,
                    y: -20,
                    w: p.w,
                    h: p.h,
                    color: p.color,
                    shape: p.shape,
                    rotation: Math.random() * 360,
                    rotationSpeed: p.rotationSpeed,
                    velocityX: Math.random() * 4 - 2,
                    velocityY: Math.random() * 2 + 1,
                    gravity: 0.12
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
