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
    // 各キーの判定だけゲームパッドをかませる

    // R1
    if (key == "c" && gamepads && gamepads[0].buttons[5].pressed) return true;

    // 右
    if (key == "ArrowRight" && gamepads && gamepads[0].buttons[15].pressed) return true;

    // 左
    if (key == "ArrowLeft" && gamepads && gamepads[0].buttons[14].pressed) return true;

    // 下
    if (key == "ArrowDown" && gamepads && gamepads[0].buttons[13].pressed) return true;

    // 上
    if (key == " " && gamepads && gamepads[0].buttons[12].pressed) return true;

    // 〇
    if (key == "x" && gamepads && gamepads[0].buttons[1].pressed) return true;

    // ×
    if (key == "z" && gamepads && gamepads[0].buttons[0].pressed) return true;

    const v = key_manager.get(key);
    return typeof v === "undefined" ? false : v;
}








// ゲームパッドの機能もぶち込んだれ！！！！
// from: https://developer.mozilla.org/ja/docs/Web/API/Gamepad_API/Using_the_Gamepad_API
const gamepads = {};

function gamepadHandler(event, connected) {
    const gamepad = event.gamepad;
    // Note:
    // gamepad === navigator.getGamepads()[gamepad.index]

    if (connected) {
        gamepads[gamepad.index] = gamepad;
    } else {
        delete gamepads[gamepad.index];
    }
}

window.addEventListener(
    "gamepadconnected",
    (e) => {
        gamepadHandler(e, true);
    },
    false,
);
window.addEventListener(
    "gamepaddisconnected",
    (e) => {
        gamepadHandler(e, false);
    },
    false,
);

