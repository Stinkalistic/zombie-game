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

// Track mouse position
let mouseX = WIDTH / 2;
let mouseY = HEIGHT / 2;

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
canvas.addEventListener("mousemove", (e) => {
    // Update mouse coordinates, adjusting for canvas scaling
    const rect = canvas.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) / SCALE;
    mouseY = (e.clientY - rect.top) / SCALE;
});
canvas.addEventListener("click", (e) => {
    if (player.ammo > 0 && player.reloadTime === 0) {
        let angle = Math.atan2(mouseY - player.y, mouseX - player.x);
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

    // Rotate player to face the mouse pointer
    player.dir = Math.atan2(mouseY - player.y, mouseX - player.x);

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
                r
