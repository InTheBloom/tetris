// キー入力関連をラップする
const key_manager = new Map();

document.addEventListener("keydown", (e) => {
    if (typeof game !== "undefined" && game.is_running) {
        e.preventDefault();
    }

    key_manager.set(e.key, true);
});

document.addEventListener("keyup", (e) => {
    key_manager.set(e.key, false);
});

function is_pressed (key) {
    const v = key_manager.get(key);
    return typeof v === "undefined" ? false : v;
}
