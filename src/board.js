class Board {
    constructor () {
        this.board = new Array(24);
        for (let i = 0; i < this.board.length; i++) {
            this.board[i] = new Array(10).fill(color.empty);
        }
    }

    place_mino (mino) {
        if (typeof mino === "undefined") return;
        const sh = Mino[mino.mino_type].shape[mino.direction];

        for (let i = 0; i < sh.length; i++) {
            for (let j = 0; j < sh[i].length; j++) {
                const ni = i + mino.control_point[0];
                const nj = j + mino.control_point[1];
                if (sh[i][j]) this.board[ni][nj] = color[mino.mino_type];
            }
        }
    }

    clear_mino (mino) {
        if (typeof mino === "undefined") return;
        const sh = Mino[mino.mino_type].shape[mino.direction];

        for (let i = 0; i < sh.length; i++) {
            for (let j = 0; j < sh[i].length; j++) {
                const ni = i + mino.control_point[0];
                const nj = j + mino.control_point[1];
                if (sh[i][j]) this.board[ni][nj] = color.empty;
            }
        }
    }

    is_grounding (mino) {
        if (typeof mino === "undefined") return false;
        const sh = Mino[mino.mino_type].shape[mino.direction];

        for (let i = 0; i < sh.length; i++) {
            for (let j = 0; j < sh[i].length; j++) {
                if (!sh[i][j]) continue;

                const ni = i + mino.control_point[0] + 1;
                const nj = j + mino.control_point[1];
                if (ni < this.board.length && nj < this.board[ni].length && this.board[ni][nj] != color.empty) return true;
                if (ni == this.board.length) return true;
            }
        }

        return false;
    }

    is_gameover (mino) {
        // 条件1. 21段目にテトリミノを設置する。
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < this.board[i].length; j++) {
                if (this.board[i][j] != color.empty) return true;
            }
        }

        // 条件2. ネクストがすでに置かれたミノに被っている
        if (typeof mino === "undefined") return false;
        const sh = Mino[mino.mino_type].shape[mino.direction];

        for (let i = 0; i < sh.length; i++) {
            for (let j = 0; j < sh[i].length; j++) {
                if (!sh[i][j]) continue;
                const ni = i + mino.control_point[0];
                const nj = j + mino.control_point[1];

                if (this.board[ni][nj] != color.empty) return true;
            }
        }

        return false;
    }

    try_drop (mino) {
        if (typeof mino === "undefined") return false;

        const sh = Mino[mino.mino_type].shape[mino.direction];
        mino.control_point[0]++;

        let ok = true;
        for (let i = 0; i < sh.length; i++) {
            for (let j = 0; j < sh[i].length; j++) {
                const ni = i + mino.control_point[0];
                const nj = j + mino.control_point[1];
                if (!sh[i][j]) continue;
                if (this.board.length <= ni
                    || this.board[ni].length <= nj
                    || this.board[ni][nj] != color.empty) ok = false;
            }
        }

        if (!ok) mino.control_point[0]--;
        return ok;
    }

    try_move_right (mino) {
        if (typeof mino === "undefined") return false;

        const sh = Mino[mino.mino_type].shape[mino.direction];
        mino.control_point[1]++;

        let ok = true;
        for (let i = 0; i < sh.length; i++) {
            for (let j = 0; j < sh[i].length; j++) {
                const ni = i + mino.control_point[0];
                const nj = j + mino.control_point[1];
                if (!sh[i][j]) continue;
                if (this.board.length <= ni
                    || this.board[ni].length <= nj
                    || this.board[ni][nj] != color.empty) ok = false;
            }
        }

        if (!ok) mino.control_point[1]--;
        return ok;
    }

    try_move_left (mino) {
        if (typeof mino === "undefined") return false;

        const sh = Mino[mino.mino_type].shape[mino.direction];
        mino.control_point[1]--;

        let ok = true;
        for (let i = 0; i < sh.length; i++) {
            for (let j = 0; j < sh[i].length; j++) {
                const ni = i + mino.control_point[0];
                const nj = j + mino.control_point[1];
                if (!sh[i][j]) continue;
                if (this.board.length <= ni
                    || nj < 0
                    || this.board[ni][nj] != color.empty) ok = false;
            }
        }

        if (!ok) mino.control_point[1]++;
        return ok;
    }

    draw_board (canvas_element) {
        const ctx = canvas_element.getContext("2d");

        // 見える部分である下側20lineだけを描画

        // 枠線
        // strokeは指定座標を中心に、そこからlineWidth / 2だけ近傍に広がる。
        // ref: https://developer.mozilla.org/ja/docs/Web/API/Canvas_API/Tutorial/Applying_styles_and_colors
        ctx.beginPath();
        for (let i = 0; i <= this.board.length - 4; i++) {
            ctx.moveTo(0, i * block_size_px + i + 0.5);
            ctx.lineTo(canvas_element.width, i * block_size_px + i + 0.5);
        }
        for (let i = 0; i <= this.board[0].length; i++) {
            ctx.moveTo(i * block_size_px + i + 0.5, 0);
            ctx.lineTo(i * block_size_px + i + 0.5, canvas_element.height);
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
}
