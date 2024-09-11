document.addEventListener("DOMContentLoaded", main);

const color = {
    empty: "white",
    T: "purple",
    S: "green",
    Z: "red",
    L: "orange",
    J: "blue",
    O: "yellow",
    I: "cyan",
};

let canvas;

const board = new Array(22);
for (let i = 0; i < board.length; i++) {
    board[i] = new Array(10).fill(color.empty);
}

const block_size_px = Math.floor((window.innerHeight * 0.8) / 20);

function write_mino (mino_state) {
    const m = Mino[mino_state.mino_type].shape[mino_state.direction];
    for (let i = 0; i < m.length; i++) {
        for (let j = 0; j < m[i].length; j++) {
            const ni = i + mino_state.control_point[0], nj = j + mino_state.control_point[1];
            if (m[i][j]) board[ni][nj] = color[mino_state.mino_type];
        }
    }
}

function clear_mino (mino_state) {
    const m = Mino[mino_state.mino_type].shape[mino_state.direction];
    for (let i = 0; i < m.length; i++) {
        for (let j = 0; j < m[i].length; j++) {
            const ni = i + mino_state.control_point[0], nj = j + mino_state.control_point[1];
            if (m[i][j]) board[ni][nj] = color.empty;
        }
    }
}

function draw_board () {
    const ctx = canvas.getContext("2d");

    // 見える部分である下側20lineだけを描画

    // 枠線
    // strokeは指定座標を中心に、そこからlineWidth / 2だけ近傍に広がる。
    // ref: https://developer.mozilla.org/ja/docs/Web/API/Canvas_API/Tutorial/Applying_styles_and_colors
    ctx.beginPath();
    for (let i = 0; i <= board.length - 2; i++) {
        ctx.moveTo(0, i * block_size_px + i + 0.5);
        ctx.lineTo(canvas.width, i * block_size_px + i + 0.5);
    }
    for (let i = 0; i <= board[0].length; i++) {
        ctx.moveTo(i * block_size_px + i + 0.5, 0);
        ctx.lineTo(i * block_size_px + i + 0.5, canvas.height);
    }
    ctx.closePath();
    ctx.stroke();

    // マス
    for (let i = 2; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            ctx.fillStyle = board[i][j];
            ctx.fillRect(j * block_size_px + j + 1, (i - 2) * block_size_px + i - 2 + 1, block_size_px, block_size_px);
        }
    }
}

function try_drop (mino_state) {
    const m = Mino[mino_state.mino_type].shape[mino_state.direction];
    mino_state.control_point[0]++;

    let ok = true;
    for (let i = 0; i < m.length; i++) {
        for (let j = 0; j < m[i].length; j++) {
            const ni = i + mino_state.control_point[0], nj = j + mino_state.control_point[1];
            if (!m[i][j]) continue;
            if (board.length <= ni || board[ni].length <= nj || board[ni][nj] != color.empty) ok = false;
        }
    }

    if (!ok) mino_state.control_point[0]--;
}

function main () {
    canvas = document.getElementById("screen");
    canvas.width = 10 * block_size_px + 11;
    canvas.height = 20 * block_size_px + 21;

    const game_state = new GameState();
    game_state.is_running = true;
    game_state.update();

    function game_roop (timestamp) {
        if (!game_state.is_running) {
            return;
        }

        // ミノが設置されたか？

        // ミノが自由落下したか？
        if (game_state.interval < timestamp - game_state.last_droped) {
            try_drop(game_state.operating);
            write_mino(game_state.operating);
            draw_board();
            clear_mino(game_state.operating);
            game_state.last_droped = timestamp;
        }
        window.requestAnimationFrame(game_roop);
    }

    window.requestAnimationFrame(game_roop);
}

