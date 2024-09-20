document.addEventListener("DOMContentLoaded", main);

let main_screen, hold_screen, next_screen;
let game = undefined;

function main () {
    main_screen = document.getElementById("main_screen");
    main_screen.width = 10 * block_size_px + 11;
    main_screen.height = 20 * block_size_px + 21;

    hold_screen = document.getElementById("hold_screen");
    hold_screen.width = 6 * block_size_px_subscreen;
    hold_screen.height = 4 * block_size_px_subscreen;

    next_screen = document.getElementById("next_screen");
    next_screen.width = 6 * block_size_px_subscreen;
    next_screen.height = 15 * block_size_px_subscreen;

    game = new Game();

    // ゲームのリセット
    document.addEventListener("keydown", (e) => {
        if (e.key == "Escape") {
            game.quit([main_screen, hold_screen, next_screen]);
            game = new Game();
        }
    });

    // ゲームの開始
    document.addEventListener("keydown", (e) => {
        if (e.key == "Enter") {
            if (!game.is_running && !game.is_gameovered) game.start();
        }
    })
}
