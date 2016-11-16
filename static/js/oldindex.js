//https://github.com/kittykatattack/learningPixi#introduction 

var IMG_DIR = "../static/img/";
var DUCK_IMG = "duck.gif";
var MONSTER_IMG = "monster.png";
var BIRD_IMG = "bird.png";

function imgPath(img) {
    return IMG_DIR + img;
}

var renderer = new PIXI.WebGLRenderer(
    window.innerWidth, window.innerHeight
);
renderer.view.style.position = "absolute";
renderer.view.style.display = "block";
renderer.backgroundColor = 0xD3D3D3;

document.body.appendChild(renderer.view);

// new container
var stage = new PIXI.Container();

var state;

// sprites
var player;
var bird, monster;

// hud
var score, scoreNum;
var position, positionX, positionY;

// load resources
PIXI.loader
    .add(imgPath(DUCK_IMG))
    .add(imgPath(MONSTER_IMG))
    .add(imgPath(BIRD_IMG))
    .on("progress", function(loader, resource) {
        console.log("loading... " + loader.progress + "% - " + resource.url);
    })
    .load(function() {
        console.log("loaded!")
        loadSprites();
        setupKeyboard();
        state = play;
        loop(); // start the game loop
    });

function loadSprites() {
    // player
    player = new PIXI.Sprite(
        PIXI.loader.resources[imgPath(DUCK_IMG)].texture
    );
    player.y = 200;
    player.x = 200;
    player.vx = 0;
    player.vy = 0;
    stage.addChild(player);

    // bird
    bird = new PIXI.Sprite(
        PIXI.loader.resources[imgPath(BIRD_IMG)].texture
    );
    bird.x = 700;
    bird.y = 500;
    stage.addChild(bird);

    // monster
    monster = new PIXI.Sprite(
        PIXI.loader.resources[imgPath(MONSTER_IMG)].texture
    );
    monster.x = window.innerWidth - 150;
    monster.y = window.innerHeight - 150;
    stage.addChild(monster);

    // hud - score
    score = new PIXI.Text(
        "Score: 0", {
            font: "32px sans-serif",
            fill: "black"
        }
    );
    score.position.set(10, 10);
    stage.addChild(score);
    scoreNum = 0;

    // hud - position
    position = new PIXI.Text(
        "Position: -1, -1", {
            font: "32px sans-serif",
            fill: "black"
        }
    );
    position.position.set(window.innerWidth - (position.width + 10), 10);
    stage.addChild(position);
}

function updateScore() {
    score.text = "Score: " + scoreNum;
}

function updatePosition() {
    position.text = "Position: " + player.x + ", " + player.y;
    position.position.set(window.innerWidth - (position.width + 10), 10);
}

function changeBirdPosition() {
    var x = randomInt(0, window.innerWidth - bird.width);
    var y = randomInt(0, window.innerHeight - bird.height);
    bird.x = x;
    bird.y = y;
    if (hitTestRectangle(player, bird)) {
        return changeBirdPosition();
    }
}

function changeMonsterPosition() {
    var x = randomInt(0, window.innerWidth - bird.width);
    var y = randomInt(0, window.innerHeight - bird.height);
    monster.x = x;
    monster.y = y;
    if (hitTestRectangle(player, monster)) {
        return changeMonsterPosition();
    }
}

function setupKeyboard() {
    var left = keyboard(37),
        up = keyboard(38),
        right = keyboard(39),
        down = keyboard(40);
    left.press = function() {
        player.vx = -5;
        player.vy = 0;
    };
    left.release = function() {
        /* If the left arrow has been released, and the right arrow isn't down,
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
}

function loop() {
    requestAnimationFrame(loop);
    state();
    renderer.render(stage);
}

function play() {
    // apply velocity values
    player.x += player.vx;
    player.y += player.vy;

    updatePosition();

    // arena collisions
    var arenaCollide = contain(player, {
        x: 0,
        y: 0,
        height: window.innerHeight,
        width: window.innerWidth
    });
    if (arenaCollide != undefined) {
        player.vx = 0;
        player.vy = 0;
        return;
    }

    // monster collisions

        updateScore();
        changeBirdPosition();
        changeMonsterPosition();
        return;
    }

    // bird collisions
    if (hitTestRectangle(player, bird)) {
        scoreNum += 1;
        updateScore();
        changeBirdPosition();
        changeMonsterPosition();
        return;
    }
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// keyboard listener function from tutorial
function keyboard(keyCode) {
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
}

// rectangle collision function from tutorial
function hitTestRectangle(r1, r2) {
    //Define the variables we'll need to calculate
    var hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

    //hit will determine whether there's a collision
    hit = false;

    //Find the center points of each sprite
    r1.centerX = r1.x + r1.width / 2;
    r1.centerY = r1.y + r1.height / 2;
    r2.centerX = r2.x + r2.width / 2;
    r2.centerY = r2.y + r2.height / 2;

    //Find the half-widths and half-heights of each sprite
    r1.halfWidth = r1.width / 2;
    r1.halfHeight = r1.height / 2;
    r2.halfWidth = r2.width / 2;
    r2.halfHeight = r2.height / 2;

    //Calculate the distance vector between the sprites
    vx = r1.centerX - r2.centerX;
    vy = r1.centerY - r2.centerY;

    //Figure out the combined half-widths and half-heights
    combinedHalfWidths = r1.halfWidth + r2.halfWidth;
    combinedHalfHeights = r1.halfHeight + r2.halfHeight;

    //Check for a collision on the x axis
    if (Math.abs(vx) < combinedHalfWidths) {

        //A collision might be occuring. Check for a collision on the y axis
        if (Math.abs(vy) < combinedHalfHeights) {

            //There's definitely a collision happening
            hit = true;
        } else {

            //There's no collision on the y axis
            hit = false;
        }
    } else {

        //There's no collision on the x axis
        hit = false;
    }

    //`hit` will be either `true` or `false`
    return hit;
};

function contain(sprite, container) {
    var collision = undefined;
    if (sprite.x < container.x) {
        sprite.x = container.x;
        collision = "left";
    }
    if (sprite.y < container.y) {
        sprite.y = container.y;
        collision = "top";
    }
    if (sprite.x + sprite.width > container.width) {
        sprite.x = container.width - sprite.width;
        collision = "right";
    }
    if (sprite.y + sprite.height > container.height) {
        sprite.y = container.height - sprite.height;
        collision = "bottom";
    }
    return collision;
}
