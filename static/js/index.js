// constants
var IMG_DIR = "../static/img/";
var IMG_DUCK = IMG_DIR + "duck.gif";
var IMG_MONSTER = IMG_DIR + "monster.png";
var IMG_BIRD = IMG_DIR + "bird.png";

// renderer/canvas
var renderer = new PIXI.WebGLRenderer(
    window.innerWidth, window.innerHeight
);
renderer.view.style.position = "absolute";
renderer.view.style.display = "block";
renderer.backgroundColor = 0xD3D3D3;
document.body.appendChild(renderer.view);

// scenes
var scene = new PIXI.Container();
var gameScene = new PIXI.Container();
var gameOverScene = new PIXI.Container();
gameOverScene.visible = false;

// adding child scenes
scene.addChild(gameScene);
scene.addChild(gameOverScene);

// entities
var player;
var bird;
var monster;

// state
var state;

function setup() {
    var keyboard = function(keyCode) {
        var key = {};
        key.code = keyCode;
        key.isDown = false;
        key.isUp = true;
        key.press = undefined;
        key.release = undefined;
        key.downHandler = function(event) {
            if (event.keyCode === key.code) {
                if (key.isUp && key.press) key.press();
                key.isDown = true;
                key.isUp = false;
            }
            event.preventDefault();
        };
        key.upHandler = function(event) {
            if (event.keyCode === key.code) {
                if (key.isDown && key.release) key.release();
                key.isDown = false;
                key.isUp = true;
            }
            event.preventDefault();
        }; 
        window.addEventListener(
            "keydown", key.downHandler.bind(key), false
        );
        window.addEventListener(
            "keyup", key.upHandler.bind(key), false
        );
        return key;
    };

    var setupKeyboard = function() {
        var left = keyboard(37),
            up = keyboard(38),
            right = keyboard(39),
            down = keyboard(40);
        left.press = function() {
            player.vx = -5;
            player.vy = 0;
        };
        left.release = function() {
            /* If the left arrow has been released, and the right arrow isn't do$
               and the player isn't moving vertically:
               Stop the player */
            if (!right.isDown && player.vy === 0) {
                player.vx = 0;
            }
        };
        up.press = function() {
            player.vy = -5;
            player.vx = 0;
        };
        up.release = function() {
            if (!down.isDown && player.vx === 0) {
                player.vy = 0;
            }
        };
        right.press = function() {
            player.vx = 5;
            player.vy = 0;
        };
        right.release = function() {
            if (!left.isDown && player.vy === 0) {
                player.vx = 0;
            }
        };
        down.press = function() {
            player.vy = 5;
            player.vx = 0;
        };
        down.release = function() {
            if (!up.isDown && player.vx === 0) {
                player.vy = 0;
            }
        };
    };

    function loadSprites() {
        // player sprite
        player = new PIXI.Sprite(
            PIXI.loader.resources[IMG_DUCK].texture
        );
        player.y = 200;
        player.x = 200;
        player.vx = 0;
        player.vy = 0;
        gameScene.addChild(player);

        // bird sprite
        bird = new PIXI.Sprite(
            PIXI.loader.resources[IMG_BIRD].texture 
        );
        bird.x = 700;
        bird.y = 500;
        gameScene.addChild(bird);

        // monster sprite
        monster = new PIXI.Sprite(
            PIXI.loader.resources[IMG_MONSTER].texture 
        );
        monster.x = window.innerWidth - 150;
        monster.y = window.innerHeight - 150;
        gameScene.addChild(monster);
    }

    PIXI.loader
        .add(IMG_DUCK)
        .add(IMG_MONSTER)
        .add(IMG_BIRD)
        .on("progress", function (loader, resource) {
            console.log("loading... " + loader.progress + "% - " + resource.url);
        }).load(function() { 
            loadSprites();
            setupKeyboard();
            state = gameState;
            loop();
        });
}

function loop() {
    requestAnimationFrame(loop);
    state();
    renderer.render(scene);
}

function gameState() {
    // applying velocity values
    player.x += player.vx;
    player.y += player.vy;
}

function gameOverState() {

}

setup();
