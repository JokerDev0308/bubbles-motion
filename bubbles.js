const CONFIG = {
    SPEED: { MIN: 5, MAX: 10 },
    RADIUS: 80,
    COLLISION: {
        FORCE: 0.3,
        DAMPING: 1
    }
};

class Bubble {
    constructor(canvas) {
        this.canvas = canvas;
        this.radius = CONFIG.RADIUS;
        this.x = this.radius + Math.random() * (canvas.width - 2 * this.radius);
        this.y = this.radius + Math.random() * (canvas.height - 2 * this.radius);
        this.randomizeSpeed();
    }

    randomizeSpeed() {
        const speed = CONFIG.SPEED.MIN + Math.random() * (CONFIG.SPEED.MAX - CONFIG.SPEED.MIN);
        const angle = Math.random() * Math.PI * 2;
        this.speedX = Math.cos(angle) * speed;
        this.speedY = Math.sin(angle) * speed;
    }

    normalizeSpeed() {
        // Calculate current speed
        const currentSpeed = Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY);
        
        if (currentSpeed > CONFIG.SPEED.MAX) {
            // Scale down to max speed
            const scale = CONFIG.SPEED.MAX / currentSpeed;
            this.speedX *= scale;
            this.speedY *= scale;
        } else if (currentSpeed < CONFIG.SPEED.MIN) {
            // Scale up to min speed
            const scale = CONFIG.SPEED.MIN / currentSpeed;
            this.speedX *= scale;
            this.speedY *= scale;
        }
    }

    update(bubbles) {
        this.x += this.speedX;
        this.y += this.speedY;

        // Efficient collision detection
        for (let i = 0; i < bubbles.length; i++) {
            const other = bubbles[i];
            if (other === this) continue;

            const dx = other.x - this.x;
            const dy = other.y - this.y;
            const distanceSquared = dx * dx + dy * dy;
            const minDistance = this.radius + other.radius;

            if (distanceSquared <= minDistance * minDistance) {
                const distance = Math.sqrt(distanceSquared);
                const angle = Math.atan2(dy, dx);
                const force = CONFIG.COLLISION.FORCE;
                
                const ax = Math.cos(angle) * force;
                const ay = Math.sin(angle) * force;

                this.speedX = (this.speedX - ax) * CONFIG.COLLISION.DAMPING;
                this.speedY = (this.speedY - ay) * CONFIG.COLLISION.DAMPING;
                other.speedX = (other.speedX + ax) * CONFIG.COLLISION.DAMPING;
                other.speedY = (other.speedY + ay) * CONFIG.COLLISION.DAMPING;

                this.normalizeSpeed();
                other.normalizeSpeed();
            }
        }

        // Boundary collision
        if (this.x - this.radius <= 0 || this.x + this.radius >= this.canvas.width) {
            this.speedX *= -CONFIG.COLLISION.DAMPING;
            this.x = Math.max(this.radius, Math.min(this.canvas.width - this.radius, this.x));
        }

        if (this.y - this.radius <= 0 || this.y + this.radius >= this.canvas.height) {
            this.speedY *= -CONFIG.COLLISION.DAMPING;
            this.y = Math.max(this.radius, Math.min(this.canvas.height - this.radius, this.y));
        }
    }

    draw(ctx) {
        const gradient = ctx.createRadialGradient(
            this.x - this.radius * 0.3,
            this.y - this.radius * 0.3,
            this.radius * 0.1,
            this.x,
            this.y,
            this.radius
        );

        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
        gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.4)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
        gradient.addColorStop(0.8, 'rgba(255, 255, 255, 0.1)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.15)');

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
    }
}

const canvas = document.getElementById('bubbleCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const BUBBLE_COUNT = 30;
const bubbles = Array.from({ length: BUBBLE_COUNT }, () => new Bubble(canvas));

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Pass bubbles array to update method
    bubbles.forEach(bubble => {
        bubble.update(bubbles);  // Pass bubbles array here
        bubble.draw(ctx);
    });
    requestAnimationFrame(animate);
}

animate();