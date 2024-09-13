document.addEventListener("DOMContentLoaded", main);

let canvas;
let game;

function main () {
    canvas = document.getElementById("screen");
    canvas.width = 10 * block_size_px + 11;
    canvas.height = 20 * block_size_px + 21;

    // ゲームの発火登録
    document.addEventListener("keydown", (e) => {
        if (e.key == 'Escape') {
            game = new Game();
            game.start();
        }
    });
}
