class Game {
    board = new Array(24);

    is_running = false;

    // ミノ関連
    hold = undefined;
    current_mino;
    next_minos = [];
    appeared = new Array(7).fill(false);

    // イベント関連
    last_droped;
    drop_interval = 1000;

    is_grounding_now;
    last_grounded;
    place_interval = 500;

    constructor () {
        for (let i = 0; i < this.board.length; i++) {
            this.board[i] = new Array(10).fill(color.empty);
        }

        for (let i = 0; i < 7; i++) this.refill();
        this.get_next_mino();
    }

    refill () {
        const candidate = [];
        let empty = true;
        for (let i = 0; i < this.appeared.length; i++) if (!this.appeared[i]) empty = false;
        if (empty) for (let i = 0; i < this.appeared.length; i++) this.appeared[i] = false;

        for (let i = 0; i < this.appeared.length; i++) {
            if (!this.appeared[i]) {
                candidate.push(i);
            }
        }

        const choice = Math.floor(candidate.length * Math.random());
        this.appeared[candidate[choice]] = true;
        this.next_minos.push(new MinoState(["T", "S", "Z", "L", "J", "O", "I"][candidate[choice]]));
    }

    get_next_mino () {
        this.current_mino = this.next_minos.shift();
        this.refill();
    }

    is_grounding () {
        const sh = Mino[this.current_mino.mino_type].shape[this.current_mino.direction];
        const m = this.current_mino;

        for (let i = 0; i < sh.length; i++) {
            for (let j = 0; j < sh[i].length; j++) {
                if (!sh[i][j]) continue;

                const ni = i + m.control_point[0] + 1;
                const nj = j + m.control_point[1];
                if (ni < this.board.length && nj < this.board[ni].length && this.board[ni][nj] != color.empty) return true;
                if (ni == this.board.length) return true;
            }
        }

        return false;
    }

    is_gameover () {
        // 条件1. ネクストがすでに置かれたミノに被っている
        const sh = Mino[this.current_mino.mino_type].shape[this.current_mino.direction];
        const m = this.current_mino;
        for (let i = 0; i < sh.length; i++) {
            for (let j = 0; j < sh[i].length; j++) {
                if (!sh[i][j]) continue;
                const ni = i + m.control_point[0];
                const nj = j + m.control_point[1];

                if (this.board[ni][nj] != color.empty) return true;
            }
        }

        // 条件2. 21段目にテトリミノを設置する。
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < this.board[i].length; j++) {
                if (this.board[i][j] != color.empty) return true;
            }
        }

        return false;
    }

    write_current_mino () {
        const sh = Mino[this.current_mino.mino_type].shape[this.current_mino.direction];
        const m = this.current_mino;

        for (let i = 0; i < sh.length; i++) {
            for (let j = 0; j < sh[i].length; j++) {
                const ni = i + m.control_point[0];
                const nj = j + m.control_point[1];
                if (sh[i][j]) this.board[ni][nj] = color[m.mino_type];
            }
        }
    }

    clear_current_mino () {
        const sh = Mino[this.current_mino.mino_type].shape[this.current_mino.direction];
        const m = this.current_mino;

        for (let i = 0; i < sh.length; i++) {
            for (let j = 0; j < sh[i].length; j++) {
                const ni = i + m.control_point[0];
                const nj = j + m.control_point[1];
                if (sh[i][j]) this.board[ni][nj] = color.empty;
            }
        }
    }

    force_quit (canvas) {
        this.is_running = false;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    try_drop () {
        const sh = Mino[this.current_mino.mino_type].shape[this.current_mino.direction];
        const m = this.current_mino;
        m.control_point[0]++;

        let ok = true;
        for (let i = 0; i < sh.length; i++) {
            for (let j = 0; j < sh[i].length; j++) {
                const ni = i + m.control_point[0];
                const nj = j + m.control_point[1];
                if (!sh[i][j]) continue;
                if (this.board.length <= ni
                    || this.board[ni].length <= nj
                    || this.board[ni][nj] != color.empty) ok = false;
            }
        }

        if (!ok) m.control_point[0]--;
        return ok;
    }

    try_move_right () {
        const sh = Mino[this.current_mino.mino_type].shape[this.current_mino.direction];
        const m = this.current_mino;
        m.control_point[1]++;

        let ok = true;
        for (let i = 0; i < sh.length; i++) {
            for (let j = 0; j < sh[i].length; j++) {
                const ni = i + m.control_point[0];
                const nj = j + m.control_point[1];
                if (!sh[i][j]) continue;
                if (this.board.length <= ni
                    || this.board[ni].length <= nj
                    || this.board[ni][nj] != color.empty) ok = false;
            }
        }

        if (!ok) m.control_point[1]--;
        return ok;
    }

    try_move_left () {
        const sh = Mino[this.current_mino.mino_type].shape[this.current_mino.direction];
        const m = this.current_mino;
        m.control_point[1]--;

        let ok = true;
        for (let i = 0; i < sh.length; i++) {
            for (let j = 0; j < sh[i].length; j++) {
                const ni = i + m.control_point[0];
                const nj = j + m.control_point[1];
                if (!sh[i][j]) continue;
                if (this.board.length <= ni
                    || nj < 0
                    || this.board[ni][nj] != color.empty) ok = false;
            }
        }

        if (!ok) m.control_point[1]++;
        return ok;
    }

    draw_board (canvas) {
        const ctx = canvas.getContext("2d");

        // 見える部分である下側20lineだけを描画

        // 枠線
        // strokeは指定座標を中心に、そこからlineWidth / 2だけ近傍に広がる。
        // ref: https://developer.mozilla.org/ja/docs/Web/API/Canvas_API/Tutorial/Applying_styles_and_colors
        ctx.beginPath();
        for (let i = 0; i <= this.board.length - 4; i++) {
            ctx.moveTo(0, i * block_size_px + i + 0.5);
            ctx.lineTo(canvas.width, i * block_size_px + i + 0.5);
        }
        for (let i = 0; i <= this.board[0].length; i++) {
            ctx.moveTo(i * block_size_px + i + 0.5, 0);
            ctx.lineTo(i * block_size_px + i + 0.5, canvas.height);
        }
        ctx.closePath();
        ctx.stroke();

        // マス
        for (let i = 4; i < this.board.length; i++) {
            for (let j = 0; j < this.board[i].length; j++) {
                ctx.fillStyle = this.board[i][j];
                ctx.fillRect(j * block_size_px + j + 1, (i - 4) * block_size_px + i - 4 + 1, block_size_px, block_size_px);
            }
        }
    }

    // ゲームループも抱え込ませちゃう
    start () {
        this.is_running = true;
        this.draw_board(canvas);

        // タイマー関連のリセット
        this.last_droped = performance.now();
        this.last_grounded = Infinity;
        this.is_grounding_now = false;

        const game_roop = (timestamp) => {
            if (!this.is_running) {
                return;
            }

            (() => {
                // ゲームオーバー判定
                if (this.is_gameover()) {
                    this.is_running = false;
                    console.log("gameover!");
                    return;
                }

                // 時間経過によるミノ設置判定
                if (this.place_interval < timestamp - this.last_grounded) {
                    this.write_current_mino();
                    this.get_next_mino();
                    this.last_grounded = Infinity;
                    return;
                }

                // ミノ自由落下判定
                if (this.drop_interval < timestamp - this.last_droped) {
                    const drop = Math.floor((timestamp - this.last_droped) / this.drop_interval);

                    for (let i = 0; i < Math.min(drop, 24); i++) {
                        if (!this.try_drop()) break;
                    }
                    this.write_current_mino();
                    this.draw_board(canvas);
                    this.clear_current_mino();

                    this.last_droped = timestamp
                        - (timestamp - this.last_droped) % this.drop_interval;
                }

                // 各タイミング変数のリセット
                if (this.is_grounding()) {
                    if (!this.is_grounding_now) {
                        this.last_grounded = timestamp;
                        this.is_grounding_now = true;
                    }
                    this.last_droped = timestamp;
                }
                else {
                    this.last_grounded = Infinity;
                    this.is_grounding_now = false;
                }

                // ハードドロップ
                if (is_pressed("ArrowUp")) {
                    while (this.try_drop()) {}
                    this.write_current_mino();
                    this.draw_board(canvas);
                    this.get_next_mino();
                    this.last_grounded = Infinity;
                    return;
                }

                // 右
                if (is_pressed("ArrowRight") && !is_pressed("ArrowLeft")) {
                    if (this.try_move_right()) {
                        this.write_current_mino();
                        this.draw_board(canvas);
                        this.clear_current_mino();
                    }
                }

                // 左
                if (is_pressed("ArrowLeft") && !is_pressed("ArrowRight")) {
                    if (this.try_move_left()) {
                        this.write_current_mino();
                        this.draw_board(canvas);
                        this.clear_current_mino();
                    }
                }
            })();

            window.requestAnimationFrame(game_roop);
        }

        window.requestAnimationFrame(game_roop);
    }
}
