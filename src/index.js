document.addEventListener("DOMContentLoaded", main);

let canvas;
let game = undefined;

function main () {
    canvas = document.getElementById("screen");
    canvas.width = 10 * block_size_px + 11;
    canvas.height = 20 * block_size_px + 21;

    game = new Game();

    // ゲームのリセット
    document.addEventListener("keydown", (e) => {
        if (e.key == "Escape") {
            game.force_quit(canvas);
            game = new Game();
        }
    });

    // ゲームの開始
    document.addEventListener("keydown", (e) => {
        if (e.key == "Enter") {
            if (!game.is_running) game.start();
        }
    })
}
