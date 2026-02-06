// COMPREHENSIVE NEURAL NETWORK - Fixed Version
console.log('🧠 Comprehensive Neural Network - Loading...');

// ===== CUSTOM CURSOR =====
const cursor = document.querySelector('.cursor-follower');
let cursorX = 0;
let cursorY = 0;
let cursorScale = 1;

if (cursor) {
    // Track mouse position
    document.addEventListener('mousemove', (e) => {
        cursorX = e.clientX;
        cursorY = e.clientY;
        updateCursorTransform();
    }, { passive: true });
    
    // Update cursor transform with position and scale
    function updateCursorTransform() {
        cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) scale(${cursorScale})`;
    }
    
    // Handle hover states
    const interactiveElements = document.querySelectorAll('a, button, .project-card, .pub-entry');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorScale = 2.5;
            cursor.classList.add('cursor-hover');
            updateCursorTransform();
        }, { passive: true });
        el.addEventListener('mouseleave', () => {
            cursorScale = 1;
            cursor.classList.remove('cursor-hover');
            updateCursorTransform();
        }, { passive: true });
    });
}

// ===== COMPREHENSIVE NEURAL NETWORK =====
const canvas = document.getElementById('neural-canvas');
if (canvas) {
    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    let width, height;
    let animationId;
    
    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        initNodes();
    }
    
    // Enhanced Node class
    class Node {
        constructor(x, y) {
            this.reset(x, y);
        }
        
        reset(x, y) {
            this.x = x ?? Math.random() * width;
            this.y = y ?? Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.8;
            this.vy = (Math.random() - 0.5) * 0.8;
            this.radius = Math.random() * 3 + 2;
            this.energy = Math.random();
            this.pulse = Math.random() * Math.PI * 2;
            this.type = Math.random() > 0.7 ? 1 : 0;
            this.activity = 0;
            this.lastFired = 0;
        }
        
        update(time) {
            this.x += this.vx;
            this.y += this.vy;
            
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
            
            this.x = Math.max(0, Math.min(width, this.x));
            this.y = Math.max(0, Math.min(height, this.y));
            
            this.pulse += 0.05;
            this.energy = (Math.sin(this.pulse) + 1) / 2;
            
            const dx = cursorX - this.x;
            const dy = cursorY - this.y;
            const distSq = dx * dx + dy * dy;
            
            if (distSq < 40000 && distSq > 2500) {
                const dist = Math.sqrt(distSq);
                const force = (200 - dist) / 200 * 0.5;
                this.vx += (dx / dist) * force * 0.1;
                this.vy += (dy / dist) * force * 0.1;
            } else if (distSq < 2500) {
                const dist = Math.sqrt(distSq);
                const force = (50 - dist) / 50 * 0.5;
                this.vx -= (dx / dist) * force * 0.2;
                this.vy -= (dy / dist) * force * 0.2;
            }
            
            this.activity *= 0.95;
            
            if (Math.random() < 0.005 && time - this.lastFired > 50) {
                this.fire();
                this.lastFired = time;
            }
            
            this.vx *= 0.99;
            this.vy *= 0.99;
        }
        
        fire() {
            this.activity = 1;
            this.energy = 1;
        }
        
        draw() {
            const size = this.radius * (1 + this.energy * 0.3);
            const activityBoost = this.activity * 0.5;
            const glowSize = this.type === 1 ? size * 5 : size * 3;
            
            if (this.energy + activityBoost > 0.3) {
                const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glowSize);
                gradient.addColorStop(0, `rgba(0, 255, 0, ${(this.energy + activityBoost) * 0.4})`);
                gradient.addColorStop(1, 'rgba(0, 255, 0, 0)');
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(this.x, this.y, glowSize, 0, Math.PI * 2);
                ctx.fill();
            }
            
            if (this.activity > 0.7) {
                ctx.fillStyle = '#ffffff';
            } else if (this.energy > 0.7 || this.type === 1) {
                ctx.fillStyle = '#00ff00';
            } else {
                ctx.fillStyle = '#000000';
            }
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
            ctx.fill();
            
            if (this.activity > 0.5 || this.energy > 0.8) {
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(this.x, this.y, size * 0.4, 0, Math.PI * 2);
                ctx.fill();
            }
            
            if (this.type === 1) {
                ctx.strokeStyle = `rgba(0, 255, 0, ${this.energy * 0.6})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(this.x, this.y, size + 4, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
    }
    
    class Signal {
        constructor() {
            this.reset();
        }
        
        reset(from, to) {
            if (!from || !to) {
                this.active = false;
                return;
            }
            this.from = from;
            this.to = to;
            this.progress = 0;
            this.speed = 0.015 + Math.random() * 0.025;
            this.active = true;
            this.strength = 0.5 + Math.random() * 0.5;
            this.dx = to.x - from.x;
            this.dy = to.y - from.y;
        }
        
        update() {
            if (!this.from || !this.to) {
                this.active = false;
                return false;
            }
            this.progress += this.speed;
            if (this.progress >= 1) {
                this.active = false;
                if (this.to && this.to.fire) this.to.fire();
                return false;
            }
            return true;
        }
        
        draw() {
            if (!this.from || !this.to) return;
            const x = this.from.x + this.dx * this.progress;
            const y = this.from.y + this.dy * this.progress;
            
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, 20);
            gradient.addColorStop(0, `rgba(0, 255, 0, ${this.strength})`);
            gradient.addColorStop(1, 'rgba(0, 255, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, 20, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();
            
            for (let i = 1; i <= 2; i++) {
                const trailProgress = this.progress - i * 0.1;
                if (trailProgress > 0) {
                    const tx = this.from.x + this.dx * trailProgress;
                    const ty = this.from.y + this.dy * trailProgress;
                    const alpha = (1 - i * 0.5) * this.strength * 0.4;
                    
                    ctx.fillStyle = `rgba(0, 255, 0, ${alpha})`;
                    ctx.beginPath();
                    ctx.arc(tx, ty, 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    }
    
    let nodes = [];
    let signals = [];
    let time = 0;
    const MAX_NODES = 100;
    const CONNECTION_DISTANCE = 200;
    const CONNECTION_DISTANCE_SQ = CONNECTION_DISTANCE * CONNECTION_DISTANCE;
    
    const GRID_SIZE = 250;
    let spatialGrid = {};
    
    function getCellKey(x, y) {
        return `${Math.floor(x / GRID_SIZE)},${Math.floor(y / GRID_SIZE)}`;
    }
    
    function updateSpatialGrid() {
        spatialGrid = {};
        for (let i = 0; i < nodes.length; i++) {
            const key = getCellKey(nodes[i].x, nodes[i].y);
            if (!spatialGrid[key]) spatialGrid[key] = [];
            spatialGrid[key].push(i);
        }
    }
    
    function initNodes() {
        nodes = [];
        for (let i = 0; i < MAX_NODES; i++) {
            nodes.push(new Node());
        }
        updateSpatialGrid();
    }
    
    class ObjectPool {
        constructor(createFn, resetFn, initialSize = 50) {
            this.pool = [];
            this.active = [];
            this.createFn = createFn;
            this.resetFn = resetFn;
            for (let i = 0; i < initialSize; i++) {
                this.pool.push(createFn());
            }
        }
        
        get(...args) {
            let obj = this.pool.pop();
            if (!obj) obj = this.createFn();
            this.resetFn(obj, ...args);
            if (obj.active !== false) {
                this.active.push(obj);
            } else {
                this.pool.push(obj);
            }
            return obj;
        }
        
        release(obj) {
            const index = this.active.indexOf(obj);
            if (index > -1) {
                this.active.splice(index, 1);
                this.pool.push(obj);
            }
        }
        
        releaseAll() {
            this.pool.push(...this.active);
            this.active.length = 0;
        }
    }
    
    const signalPool = new ObjectPool(
        () => new Signal(),
        (signal, from, to) => signal.reset(from, to),
        30
    );
    
    let lastSignalTime = 0;
    const SIGNAL_INTERVAL = 150;
    
    function createSignals(currentTime) {
        if (currentTime - lastSignalTime < SIGNAL_INTERVAL) return;
        lastSignalTime = currentTime;
        
        if (nodes.length > 1 && signalPool.active.length < 25) {
            if (Math.random() < 0.3) {
                const startNode = nodes[Math.floor(Math.random() * nodes.length)];
                if (startNode) {
                    startNode.fire();
                    
                    const key = getCellKey(startNode.x, startNode.y);
                    const nearby = [];
                    
                    for (let dx = -1; dx <= 1; dx++) {
                        for (let dy = -1; dy <= 1; dy++) {
                            const cellX = Math.floor(startNode.x / GRID_SIZE) + dx;
                            const cellY = Math.floor(startNode.y / GRID_SIZE) + dy;
                            const checkKey = `${cellX},${cellY}`;
                            if (spatialGrid[checkKey]) nearby.push(...spatialGrid[checkKey]);
                        }
                    }
                    
                    for (let i = 0; i < nearby.length && i < 5; i++) {
                        const nodeIdx = nearby[i];
                        const node = nodes[nodeIdx];
                        if (node && node !== startNode && Math.random() < 0.4) {
                            const dx = startNode.x - node.x;
                            const dy = startNode.y - node.y;
                            if (dx * dx + dy * dy < CONNECTION_DISTANCE_SQ) {
                                signalPool.get(startNode, node);
                            }
                        }
                    }
                }
            } else {
                const from = nodes[Math.floor(Math.random() * nodes.length)];
                const to = nodes[Math.floor(Math.random() * nodes.length)];
                if (from && to && from !== to) {
                    const dx = from.x - to.x;
                    const dy = from.y - to.y;
                    if (dx * dx + dy * dy < CONNECTION_DISTANCE_SQ) {
                        signalPool.get(from, to);
                    }
                }
            }
        }
    }
    
    function drawConnections() {
        ctx.lineWidth = 1;
        
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            const key = getCellKey(node.x, node.y);
            
            for (let dx = 0; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    if (dx === 0 && dy === -1) continue;
                    
                    const cellX = Math.floor(node.x / GRID_SIZE) + dx;
                    const cellY = Math.floor(node.y / GRID_SIZE) + dy;
                    const checkKey = `${cellX},${cellY}`;
                    
                    if (!spatialGrid[checkKey]) continue;
                    
                    for (const j of spatialGrid[checkKey]) {
                        if (j <= i) continue;
                        
                        const other = nodes[j];
                        if (!other) continue;
                        
                        const ddx = node.x - other.x;
                        const ddy = node.y - other.y;
                        const distSq = ddx * ddx + ddy * ddy;
                        
                        if (distSq < CONNECTION_DISTANCE_SQ) {
                            const dist = Math.sqrt(distSq);
                            const opacity = (CONNECTION_DISTANCE - dist) / CONNECTION_DISTANCE;
                            const avgEnergy = (node.energy + other.energy) / 2;
                            const avgActivity = (node.activity + other.activity) / 2;
                            
                            ctx.strokeStyle = `rgba(0, 0, 0, ${opacity * 0.4})`;
                            ctx.lineWidth = 1 + avgEnergy;
                            ctx.beginPath();
                            ctx.moveTo(node.x, node.y);
                            ctx.lineTo(other.x, other.y);
                            ctx.stroke();
                            
                            if (avgEnergy > 0.6 || avgActivity > 0.3) {
                                const energyOpacity = Math.max(avgEnergy, avgActivity) * opacity;
                                ctx.strokeStyle = `rgba(0, 255, 0, ${energyOpacity * 0.6})`;
                                ctx.lineWidth = 2 + avgEnergy * 2;
                                ctx.beginPath();
                                ctx.moveTo(node.x, node.y);
                                ctx.lineTo(other.x, other.y);
                                ctx.stroke();
                                ctx.lineWidth = 1;
                            }
                        }
                    }
                }
            }
        }
    }
    
    let lastTime = performance.now();
    
    function animate(currentTime) {
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;
        
        if (deltaTime < 16) {
            animationId = requestAnimationFrame(animate);
            return;
        }
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.fillRect(0, 0, width, height);
        
        if (time % 10 === 0) {
            updateSpatialGrid();
        }
        
        drawConnections();
        
        for (let i = signalPool.active.length - 1; i >= 0; i--) {
            const signal = signalPool.active[i];
            if (!signal.update()) {
                signalPool.release(signal);
            } else {
                signal.draw();
            }
        }
        
        for (let i = 0; i < nodes.length; i++) {
            nodes[i].update(time);
            nodes[i].draw();
        }
        
        createSignals(currentTime);
        
        time++;
        animationId = requestAnimationFrame(animate);
    }
    
    resize();
    window.addEventListener('resize', resize);
    animationId = requestAnimationFrame(animate);
    
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animationId);
        } else {
            lastTime = performance.now();
            animationId = requestAnimationFrame(animate);
        }
    });
}

// ===== INTERACTIVE PROJECT CARDS - SIMPLIFIED 3D TILT =====
const projectCards = document.querySelectorAll('.project-card');

projectCards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = `opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 100}ms`;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    observer.observe(card);
    
    // Simple 3D tilt without gradients
    let rafId = null;
    let targetRotateX = 0;
    let targetRotateY = 0;
    let currentRotateX = 0;
    let currentRotateY = 0;
    
    function updateTransform() {
        currentRotateX += (targetRotateX - currentRotateX) * 0.1;
        currentRotateY += (targetRotateY - currentRotateY) * 0.1;
        
        if (Math.abs(targetRotateX - currentRotateX) > 0.01 || Math.abs(targetRotateY - currentRotateY) > 0.01) {
            card.style.transform = `perspective(1000px) rotateX(${currentRotateX}deg) rotateY(${currentRotateY}deg) scale(1.02)`;
            rafId = requestAnimationFrame(updateTransform);
        } else {
            rafId = null;
        }
    }
    
    card.addEventListener('mouseenter', () => {
        if (!rafId) rafId = requestAnimationFrame(updateTransform);
    });
    
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        targetRotateX = ((y - centerY) / centerY) * -8;
        targetRotateY = ((x - centerX) / centerX) * 8;
        
        if (!rafId) rafId = requestAnimationFrame(updateTransform);
    }, { passive: true });
    
    card.addEventListener('mouseleave', () => {
        targetRotateX = 0;
        targetRotateY = 0;
        if (!rafId) rafId = requestAnimationFrame(updateTransform);
        
        setTimeout(() => {
            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
            card.style.transform = '';
        }, 300);
    });
});

// ===== GLITCH EFFECT =====
const titleWords = document.querySelectorAll('.title-word');
titleWords.forEach(word => {
    word.addEventListener('mouseenter', () => {
        let iterations = 0;
        const originalText = word.dataset.text;
        
        const glitchInterval = setInterval(() => {
            word.textContent = originalText
                .split('')
                .map((char, index) => {
                    if (index < iterations) return originalText[index];
                    return String.fromCharCode(65 + Math.floor(Math.random() * 26));
                })
                .join('');
            
            iterations += 1 / 3;
            
            if (iterations >= originalText.length) {
                clearInterval(glitchInterval);
                word.textContent = originalText;
            }
        }, 30);
    });
});

// ===== PUBLICATION ENTRIES =====
const pubEntries = document.querySelectorAll('.pub-entry');
pubEntries.forEach((entry, index) => {
    entry.style.opacity = '0';
    entry.style.transform = 'translateX(-30px)';
    entry.style.transition = `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 150}ms`;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.style.opacity = '1';
                e.target.style.transform = 'translateX(0)';
                observer.unobserve(e.target);
            }
        });
    }, { threshold: 0.1 });
    
    observer.observe(entry);
});

// ===== SECTION COUNTERS =====
const sectionNumbers = document.querySelectorAll('.marker-number');
sectionNumbers.forEach(number => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(number.textContent);
                let current = 0;
                const increment = target / 30;
                
                const counter = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        number.textContent = String(target).padStart(2, '0');
                        clearInterval(counter);
                    } else {
                        number.textContent = String(Math.floor(current)).padStart(2, '0');
                    }
                }, 30);
                
                observer.unobserve(number);
            }
        });
    }, { threshold: 0.5 });
    
    observer.observe(number);
});

// ===== CONTACT BOXES =====
const contactBoxes = document.querySelectorAll('.contact-box');
contactBoxes.forEach(box => {
    box.addEventListener('mouseenter', function() {
        this.style.transform = 'translate(-8px, -8px) scale(1.02)';
        this.style.boxShadow = '8px 8px 0 #000000';
    });
    
    box.addEventListener('mouseleave', function() {
        this.style.transform = 'translate(0, 0) scale(1)';
        this.style.boxShadow = 'none';
    });
});

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ===== KEYBOARD CONTROLS =====
document.addEventListener('keydown', (e) => {
    if (!canvas || typeof signalPool === 'undefined') return;
    
    const key = e.key.toLowerCase();
    
    switch(key) {
        case 'n':
            if (nodes.length < MAX_NODES + 20) {
                const newNode = new Node();
                newNode.reset(cursorX, cursorY);
                newNode.fire();
                nodes.push(newNode);
            }
            break;
            
        case 'c':
            initNodes();
            signalPool.releaseAll();
            break;
            
        case 'e':
            nodes.forEach(node => {
                const dx = node.x - cursorX;
                const dy = node.y - cursorY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                setTimeout(() => node.fire(), dist * 2);
            });
            break;
            
        case 's':
            let nearestNode = null;
            let minDist = Infinity;
            
            for (const node of nodes) {
                const dx = node.x - cursorX;
                const dy = node.y - cursorY;
                const dist = dx * dx + dy * dy;
                if (dist < minDist) {
                    minDist = dist;
                    nearestNode = node;
                }
            }
            
            if (nearestNode) {
                nearestNode.fire();
                const nearby = nodes.filter(node => {
                    if (node === nearestNode) return false;
                    const dx = nearestNode.x - node.x;
                    const dy = nearestNode.y - node.y;
                    return dx * dx + dy * dy < CONNECTION_DISTANCE_SQ * 4;
                });
                nearby.forEach(node => signalPool.get(nearestNode, node));
            }
            break;
    }
});

console.log('🧠 Comprehensive Neural Network loaded!');
console.log('Controls: N=add node, C=reset, E=energy wave, S=signal burst');
