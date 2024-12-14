const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = 240; // Low resolution for pixelated look
const HEIGHT = 240;
const SCALE = 2; // Scale up for display
canvas.width = WIDTH * SCALE;
canvas.height = HEIGHT * SCALE;

// Load the player sprite
const playerSprite = new Image();
playerSprite.src = "https://cdn.jsdelivr.net/gh/Stinkalistic/zombie-game@main/zombguy.png";

// Game state
let player = { x: WIDTH / 2, y: HEIGHT / 2, dir: 0, speed: 2, health: 100, ammo: 10, reloadTime: 0 };
let zombies = [];
let bullets = [];
let score = 0;
let keys = {};
let level = 1;
let flashlightRadius = 60;

// Initialize zombies
function spawnZombies(count) {
    for (let i = 0; i < count; i++) {
        zombies.push({
            x: Math.random() * WIDTH,
            y: Math.random() * HEIGHT,
            speed: 0.5 + Math.random(),
            dir: Math.random() * Math.PI * 2,
        });
    }
}

// Handle input
document.addEventListener("keydown", (e) => (keys[e.key] = true));
document.addEventListener("keyup", (e) => (keys[e.key] = false));
canvas.addEventListener("click", (e) => {
    if (player.ammo > 0 && player.reloadTime === 0) {
        let angle = Math.atan2(e.offsetY / SCALE - player.y, e.offsetX / SCALE - player.x);
        bullets.push({ x: player.x, y: player.y, angle, speed: 5 });
        player.ammo--;
    }
});

// Update game logic
function update() {
    // Move player
    if (keys["w"]) player.y -= player.speed;
    if (keys["s"]) player.y += player.speed;
    if (keys["a"]) player.x -= player.speed;
    if (keys["d"]) player.x += player.speed;

    // Restrict player to bounds
    player.x = Math.max(0, Math.min(WIDTH, player.x));
    player.y = Math.max(0, Math.min(HEIGHT, player.y));

    // Reload ammo
    if (keys["r"] && player.ammo < 10 && player.reloadTime === 0) {
        player.reloadTime = 50; // Time to reload
    }
    if (player.reloadTime > 0) {
        player.reloadTime--;
        if (player.reloadTime === 0) player.ammo = 10;
    }

    // Move zombies
    zombies.forEach((zombie) => {
        let angle = Math.atan2(player.y - zombie.y, player.x - zombie.x);
        zombie.x += Math.cos(angle) * zombie.speed;
        zombie.y += Math.sin(angle) * zombie.speed;
    });

    // Move bullets
    bullets.forEach((bullet) => {
        bullet.x += Math.cos(bullet.angle) * bullet.speed;
        bullet.y += Math.sin(bullet.angle) * bullet.speed;
    });

    // Collision detection
    bullets = bullets.filter((bullet) => {
        let hit = false;
        zombies = zombies.filter((zombie) => {
            const dx = bullet.x - zombie.x;
            const dy = bullet.y - zombie.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 10) {
                score++;
                hit = true;
                return false;
            }
            return true;
        });
        return !hit && bullet.x >= 0 && bullet.y >= 0 && bullet.x < WIDTH && bullet.y < HEIGHT;
    });

    // Check for player collisions with zombies
    zombies.forEach((zombie) => {
        const dx = player.x - zombie.x;
        const dy = player.y - zombie.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 10) {
            player.health -= 1;
        }
    });

    // Check if player is dead
    if (player.health <= 0) {
        alert(`Game Over! Your score: ${score}`);
        resetGame();
    }

    // Level progression
    if (zombies.length === 0) {
        level++;
        spawnZombies(level * 5);
    }
}

// Draw everything
function draw() {
    // Scale canvas
    ctx.save();
    ctx.scale(SCALE, SCALE);

    // Clear canvas
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Draw flashlight effect
    const gradient = ctx.createRadialGradient(player.x, player.y, 10, player.x, player.y, flashlightRadius);
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0.9)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Draw player
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.dir);
    ctx.drawImage(playerSprite, -8, -8, 16, 16); // Adjust size to fit game scale
    ctx.restore();

    // Draw zombies
    ctx.fillStyle = "green";
    zombies.forEach((zombie) => {
        ctx.beginPath();
        ctx.arc(zombie.x, zombie.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw bullets
    ctx.fillStyle = "red";
    bullets.forEach((bullet) => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 2, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw UI
    ctx.fillStyle = "white";
    ctx.fillText(`Score: ${score}`, 10, 10);
    ctx.fillText(`Health: ${player.health}`, 10, 20);
    ctx.fillText(`Ammo: ${player.ammo}`, 10, 30);
    if (player.reloadTime > 0) ctx.fillText("Reloading...", 10, 40);

    // Restore canvas
    ctx.restore();
}

// Reset game
function resetGame() {
    player = { x: WIDTH / 2, y: HEIGHT / 2, dir: 0, speed: 2, health: 100, ammo: 10, reloadTime: 0 };
    zombies = [];
    bullets = [];
    score = 0;
    level = 1;
    spawnZombies(5);
}

// Main game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game
resetGame();
gameLoop();
