"use strict";

const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");
const fasterButton = document.getElementById("fasterButton");
hidefasterButton();
hidereplayButton();

let Game = {
    Width: canvas.width,
    Height: canvas.height,
    Level: 1,
};

const MainCircle = {
    X: Game.Width / 2,
    Y: Game.Height - 275,
    Radius: 30,
};

class Circle {
    constructor(number) { //kör objektumok
        this.X = Game.Width / 2;
        this.Y = 325 + number * 50;
        this.Text = number;
        this.Radius = 10;
        this.OfMainCircle = false;
        this.Angle = 45.5;
        this.BaseRadius = 10;
        this.Radius = this.BaseRadius;
    }
}

const circles = Array.from({ length: 8 }, (_, i) => new Circle(i)); //ezek a kis körök amiket belövünk
let CountOfClick = 0;
let GameOver = false;
let GameWin = false;
let CircleR = 3;
let speed = 0.025;

canvas.addEventListener("click", () => {
    if (GameOver || GameWin) return;
    const currentCircle = circles[CountOfClick]; //ha nyert/vesztett akkor semmi, különben változóba rakjuk a jelenlegi körünket

    for (const circle of circles) {
        if (circle === currentCircle || !circle.OfMainCircle) continue; //a ciklus atlepi a koroket amik megegyeznek a currentcircle valtozoval / nincsenek hozzarendelve a maincircle-hez
        if (
            currentCircle.X > circle.X - 27.5 &&
            currentCircle.X < circle.X + 12.5 && //megnezzuk hogy "utkoznek e" a korok
            circle.Y > Game.Height / 2
        ) {
            GameOver = true;
            return;
        }
    }

    currentCircle.OfMainCircle = true;  //hozzákapcsoljuk a maincircle-hez a kiskört, majd növeljük a kiskörszámlálót, ha eléri a kiskörök drabahosszát akkor win.
    CountOfClick++;
    GameWin = CountOfClick === circles.length;
});

function Update() {
    context.clearRect(0, 0, Game.Width, Game.Height);

    if (GameOver) {
        context.fillStyle = "#ff004a";
        showreplayButton();
        if (CircleR > 0) {
            CircleR -= 0.15;
        }
    } else if (GameWin) {      //animációk és szinezések ha nyersz/vesztesz
        context.fillStyle = "#00ff31";
        showfasterButton();
        CircleR += 0.15;
        if (speed > 0) {
            speed -= 0.00025;
        }
    } else {
        context.fillStyle = "#fff";
    }

    context.fillRect(0, 0, Game.Width, Game.Height);

    for (const circle of circles) { //animációk a kiskörök hozzácsatolásához
        if (!circle.OfMainCircle) {
            const Ytmp = circle.Y - CountOfClick * 50;
            context.beginPath();
            context.fillStyle = "#000";
            context.arc(circle.X, Ytmp, circle.Radius, 0, Math.PI * 2);
            context.fill();
            context.fillStyle = "#fff";
            context.font = "15px sans-serif";
            const text = (-circle.Text + circles.length).toString();
            const textWidth = context.measureText(text).width;
            const textX = circle.X - textWidth / 2;
            const textY = Ytmp - circle.Radius / -2; // kozepre tesszuk a meg ki nem lott korokben a szamokat
            context.fillText(text, textX, textY);
            context.closePath();
        } else {
            circle.X = MainCircle.X + Math.cos(circle.Angle) * MainCircle.Radius * CircleR;
            circle.Y = MainCircle.Y + Math.sin(circle.Angle) * MainCircle.Radius * CircleR;
            circle.Angle += speed;
            context.beginPath();
            context.fillStyle = "#000";
            context.moveTo(circle.X, circle.Y);
            context.lineTo(MainCircle.X, MainCircle.Y);
            context.stroke();
            context.closePath();
            context.beginPath();
            context.arc(circle.X, circle.Y, circle.Radius, 0, Math.PI * 2);
            context.fill();
            context.fillStyle = "#fff";
            context.font = "15px sans-serif";
            const text = (-circle.Text + circles.length).toString();
            const textWidth = context.measureText(text).width;
            context.fillText(text, circle.X - textWidth / 2, circle.Y + 4); // középre mennek a kilőtt körök számai
            context.closePath();
        }
    }

    context.beginPath();
    context.fillStyle = "#000";
    context.arc(MainCircle.X, MainCircle.Y, MainCircle.Radius, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#fff";
    context.font = "25px sans-serif";
    context.fillText(Game.Level.toString(), MainCircle.X / 1.05, MainCircle.Y * 1.05); // centered legyen a main circle textje
    context.closePath();
}

function resetGame() {
    // Gyorsitas
    circles.forEach((circle, i) => {
        circle.OfMainCircle = false;
        circle.Angle = 45.5;
        circle.X = Game.Width / 2;
        circle.Y = 325 + i * 50;
    });

    CircleR = 3;
    speed = 0.025;
}
function resetGameBigger() {
    // gyorsitas es kiskornagyitas
    circles.forEach((circle, i) => {
        circle.OfMainCircle = false;
        circle.Angle = 45.5;
        circle.X = Game.Width / 2;
        circle.Y = 325 + i * 50;

       
        circle.Radius = circle.BaseRadius * 1.2;
    });

    CircleR = 3;
    speed = 0.025;
}

let pressCount = 0;

fasterButton.addEventListener("click", () => {
    pressCount++;

    if (pressCount % 2 === 1) {
        // minden elso press
        resetGame();
        fasterButton.textContent = "BIGGER";
    } else {
        // minden masodik press
        resetGameBigger();
        fasterButton.textContent = "FASTER";
    }

    GameOver = false;
    GameWin = false;
    CountOfClick = 0;
    hidefasterButton();
    hidereplayButton();
    gameLoop();
    Game.Level++;
});

replayButton.addEventListener("click", () => {
    location.reload();
});

function hidefasterButton() {
    fasterButton.style.display = "none";
}
function showfasterButton() {
    fasterButton.style.display = ""; 
}
function hidereplayButton() {
    replayButton.style.display = "none";
}
function showreplayButton() {
    replayButton.style.display = ""; 
}

function gameLoop() {
    Update();
    requestAnimationFrame(gameLoop);
}

gameLoop();
