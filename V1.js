document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');

    // Ajustar el tamaño del canvas para que ocupe toda la ventana
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Elementos de control
    const velocityRange = document.getElementById('velocity-range');
    const colorPicker = document.getElementById('color-picker');
    const textSelect = document.getElementById('text-select');

    // Configuración inicial
    let particleCount = 200; // Cuántas partículas de texto queremos
    let particles = [];
    let currentText = textSelect.value;
    let currentColor = colorPicker.value;
    let currentVelocity = parseFloat(velocityRange.value);

    // Clase para representar cada partícula de texto
    class Particle {
        constructor(x, y, text, color, velocity) {
            this.x = x;
            this.y = y;
            this.text = text;
            this.color = color;
            this.fontSize = Math.random() * 15 + 10; // Tamaño de fuente aleatorio entre 10 y 25
            this.opacity = 1;

            // Velocidad y dirección aleatorias
            const angle = Math.random() * Math.PI * 2;
            this.vx = Math.cos(angle) * velocity * (Math.random() * 0.5 + 0.5); // Velocidad base con variación
            this.vy = Math.sin(angle) * velocity * (Math.random() * 0.5 + 0.5);
            
            this.lifetime = 0; // Para controlar cuándo "morir" la partícula y crear una nueva
            this.maxLifetime = Math.random() * 200 + 100; // Duración en frames
        }

        draw() {
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;
            ctx.font = `${this.fontSize}px Arial`;
            ctx.fillText(this.text, this.x, this.y);
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Reducir opacidad con el tiempo para un efecto de "fading out"
            this.opacity -= 1 / this.maxLifetime; 
            if (this.opacity < 0) this.opacity = 0;

            this.lifetime++;

            // Si la partícula sale de la pantalla o su vida útil termina, la reiniciamos
            if (this.x < -50 || this.x > canvas.width + 50 || this.y < -50 || this.y > canvas.height + 50 || this.lifetime > this.maxLifetime) {
                this.reset();
            }
        }

        reset() {
            // Reiniciar la posición de la partícula aleatoriamente en los bordes o cerca del centro
            const side = Math.floor(Math.random() * 4); // 0: arriba, 1: derecha, 2: abajo, 3: izquierda
            switch (side) {
                case 0: // Arriba
                    this.x = Math.random() * canvas.width;
                    this.y = -50;
                    break;
                case 1: // Derecha
                    this.x = canvas.width + 50;
                    this.y = Math.random() * canvas.height;
                    break;
                case 2: // Abajo
                    this.x = Math.random() * canvas.width;
                    this.y = canvas.height + 50;
                    break;
                case 3: // Izquierda
                    this.x = -50;
                    this.y = Math.random() * canvas.height;
                    break;
            }
            this.text = currentText;
            this.color = currentColor;
            this.fontSize = Math.random() * 15 + 10;
            this.opacity = 1;
            this.lifetime = 0;
            this.maxLifetime = Math.random() * 200 + 100;
            
            const angle = Math.random() * Math.PI * 2;
            this.vx = Math.cos(angle) * currentVelocity * (Math.random() * 0.5 + 0.5);
            this.vy = Math.sin(angle) * currentVelocity * (Math.random() * 0.5 + 0.5);

            // Hacer que las partículas de texto se repelan de un punto central o se muevan radialmente para crear el efecto de estrella
            // Esto es crucial para el efecto de la imagen
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const dx = this.x - centerX;
            const dy = this.y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Ajusta la velocidad para que se repelan del centro (o atraigan, dependiendo del signo)
            if (distance > 10) { // Evitar división por cero
                const repulsionForce = 0.05 * currentVelocity; // Fuerza de repulsión
                this.vx += (dx / distance) * repulsionForce;
                this.vy += (dy / distance) * repulsionForce;
            }
        }
    }

    // Inicializar partículas
    function initParticles() {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            // Empiezan de forma aleatoria en la pantalla
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const particle = new Particle(x, y, currentText, currentColor, currentVelocity);
            particle.reset(); // Para aplicar la lógica de repulsión inicial
            particles.push(particle);
        }
    }

    function createExplosion(x, y) {
        const explosionParticleCount = 50; // Cuántas partículas en la explosión
        const explosionSpeed = 5; // Velocidad de las partículas de la explosión
        const explosionLifetime = 60; // Vida útil corta para las partículas de explosión (en frames)

        for (let i = 0; i < explosionParticleCount; i++) {
            const angle = Math.random() * Math.PI * 2; // Dirección aleatoria en 360 grados
            const vx = Math.cos(angle) * explosionSpeed * Math.random(); // Velocidad aleatoria dentro del rango
            const vy = Math.sin(angle) * explosionSpeed * Math.random();
            
            const explosionParticle = new Particle(x, y, currentText, currentColor, vx, vy, explosionLifetime);
            particles.push(explosionParticle);
        }
    }

    // Bucle principal de animación
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar el canvas en cada frame
        ctx.globalAlpha = 1; // Resetear la opacidad global

        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });

        requestAnimationFrame(animate);
    }

    // Event Listeners para los controles
    velocityRange.addEventListener('input', (e) => {
        currentVelocity = parseFloat(e.target.value);
        // Actualizar la velocidad de las partículas existentes (opcional, o se aplicará al reset)
        particles.forEach(p => {
            // Reajustar la velocidad manteniendo la dirección general
            const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            const ratio = currentVelocity / speed;
            p.vx *= ratio;
            p.vy *= ratio;
        });
    });

    colorPicker.addEventListener('input', (e) => {
        currentColor = e.target.value;
        // Actualizar el color de las partículas existentes
        particles.forEach(p => p.color = currentColor);
    });

    textSelect.addEventListener('change', (e) => {
        currentText = e.target.value;
        // Actualizar el texto de las partículas existentes y/o de las nuevas
        particles.forEach(p => p.text = currentText);
    });

    canvas.addEventListener('click', (e) => {
        createExplosion(e.clientX, e.clientY);
    });

    // Reajustar el canvas si la ventana cambia de tamaño
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticles(); // Reiniciar partículas para que se adapten al nuevo tamaño
    });

    // Iniciar la aplicación
    initParticles();
    animate();
});