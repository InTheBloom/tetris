class Game {
    board = new Array(22);

    is_running = false;
    hold = undefined;
    current_mino;
    next_minos = [];
    appeared = new Array(7).fill(false);

    last_droped = 0;
    interval = 1000;

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
            if (!this.appeared[i]) candidate.push(["T", "S", "Z", "L", "J", "O", "I"][i]);
        }
        this.next_minos.push(new MinoState(candidate[Math.floor(candidate.length * Math.random())]));
    }

    get_next_mino () {
        this.current_mino = this.next_minos.shift();
        this.refill();
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
    }

    draw_board (canvas) {
        const ctx = canvas.getContext("2d");

        // 見える部分である下側20lineだけを描画

        // 枠線
        // strokeは指定座標を中心に、そこからlineWidth / 2だけ近傍に広がる。
        // ref: https://developer.mozilla.org/ja/docs/Web/API/Canvas_API/Tutorial/Applying_styles_and_colors
        ctx.beginPath();
        for (let i = 0; i <= this.board.length - 2; i++) {
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
        for (let i = 2; i < this.board.length; i++) {
            for (let j = 0; j < this.board[i].length; j++) {
                ctx.fillStyle = this.board[i][j];
                ctx.fillRect(j * block_size_px + j + 1, (i - 2) * block_size_px + i - 2 + 1, block_size_px, block_size_px);
            }
        }
    }

    // ゲームループも抱え込ませちゃう
    start () {
        this.is_running = true;

        function game_roop (timestamp) {
            if (!game.is_running) {
                return;
            }

            // ミノが設置されたか？

            // ミノが自由落下したか？
            if (game.interval < timestamp - game.last_droped) {
                game.try_drop();
                game.write_current_mino();
                game.draw_board(canvas);
                game.clear_current_mino();
                game.last_droped = timestamp;
            }
            window.requestAnimationFrame(game_roop);
        }

        window.requestAnimationFrame(game_roop);
    }
}
