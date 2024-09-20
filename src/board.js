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

        // ゴーストの描画
        let max_depth = mino.control_point[0];
        while (true) {
            let ok = true;
            for (let i = 0; i < sh.length; i++) {
                for (let j = 0; j < sh[i].length; j++) {
                    const ni = i + max_depth;
                    const nj = j + mino.control_point[1];
                    if (!sh[i][j]) continue;
                    if (this.board.length <= ni
                        || this.board[i].length <= nj
                        || this.board[ni][nj] != color.empty) ok = false;
                }
            }
            if (!ok) {
                max_depth--;
                break;
            }

            max_depth++;
        }

        for (let i = 0; i < sh.length; i++) {
            for (let j = 0; j < sh[i].length; j++) {
                const ni = i + max_depth;
                const nj = j + mino.control_point[1];
                if (sh[i][j]) {
                    this.board[ni][nj] = color.ghost;
                }
            }
        }

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

        // ゴーストの削除
        for (let i = 0; i < this.board.length; i++) {
            for (let j = 0; j < this.board[i].length; j++) {
                if (this.board[i][j] == color.ghost) this.board[i][j] = color.empty;
            }
        }

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
                if (ni < this.board.length && nj < this.board[ni].length && this.board[ni][nj] != color.empty && this.board[ni][nj] != color.ghost) return true;
                if (ni == this.board.length) return true;
            }
        }

        return false;
    }

    is_gameover (mino) {
        // 条件1. 21段目にテトリミノを設置する。
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < this.board[i].length; j++) {
                if (this.board[i][j] != color.empty && this.board[i][j] != color.ghost) return true;
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

                if (this.board[ni][nj] != color.empty && this.board[ni][nj] != color.ghost) return true;
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
                    || (this.board[ni][nj] != color.empty && this.board[ni][nj] != color.ghost)) ok = false;
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
                    || (this.board[ni][nj] != color.empty && this.board[ni][nj] != color.ghost)) ok = false;
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
                    || (this.board[ni][nj] != color.empty && this.board[ni][nj] != color.ghost)) ok = false;
            }
        }

        if (!ok) mino.control_point[1]++;
        return ok;
    }

    check_no_collision (mino) {
        const m = Mino[mino.mino_type].shape[mino.direction];
        for (let i = 0; i < m.length; i++) {
            for (let j = 0; j < m[i].length; j++) {
                const ni = i + mino.control_point[0];
                const nj = j + mino.control_point[1];
                if (!m[i][j]) continue;
                if (ni < 0 || this.board.length <= ni) return false;
                if (nj < 0 || this.board[ni].length <= nj) return false;
                if (this.board[ni][nj] != color.empty
                && this.board[ni][nj] != color.ghost) return false;
            }
        }

        return true;
    }

    // Super Roation Systemの実装(めんどい)
    // 参考: https://tetrisch.github.io/main/srs.html
    // なんか右回転D->Aの図が誤っているっぽい。(その通り実装すると一部回転入れができない)
    try_rotate_right (mino) {
        if (typeof mino === "undefined") return false;

        const origin = mino.control_point.slice();
        if (mino.mino_type == "O") return true;

        if (mino.mino_type == "I") {
            switch (mino.direction) {
                case 0:
                    mino.direction = 1;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[1]--;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[1] += 3;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[1] -= 3;
                    mino.control_point[0] -= 2;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[1] += 3;
                    mino.control_point[0] += 3;
                    if (this.check_no_collision(mino)) return true;

                    mino.direction = 0;
                    break;

                case 1:
                    mino.direction = 2;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[1]--;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[1] += 3;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[1] -= 3;
                    mino.control_point[0] -= 2;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[1] += 3;
                    mino.control_point[0] += 3;
                    if (this.check_no_collision(mino)) return true;

                    mino.direction = 1;
                    break;

                case 2:
                    mino.direction = 3;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[1] += 2;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[1] -= 3;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[1] += 3;
                    mino.control_point[0]--;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[1] -= 3;
                    mino.control_point[0] += 3;
                    if (this.check_no_collision(mino)) return true;

                    mino.direction = 2;
                    break;

                case 3:
                    mino.direction = 0;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[1] -= 2;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[1] += 3;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[0] += 2;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[0] -= 3;
                    mino.control_point[1] -= 3;
                    if (this.check_no_collision(mino)) return true;

                    mino.direction = 3;
                    break;

                default:
                    console.err("Board.try_rotate_right: invalid direction");
                    break;
            }
        }
        else {
            switch (mino.direction) {
                case 0:
                    mino.direction = 1;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[1]--;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[0]--;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[1]++;
                    mino.control_point[0] += 3;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[1]--;
                    if (this.check_no_collision(mino)) return true;

                    mino.direction = 0;
                    break;

                case 1:
                    mino.direction = 2;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[1]++;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[0]++;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[1]--;
                    mino.control_point[0] -= 3;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[1]++;
                    if (this.check_no_collision(mino)) return true;

                    mino.direction = 1;
                    break;

                case 2:
                    mino.direction = 3;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[1]++;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[0]--;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[1]--;
                    mino.control_point[0] += 3;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[1]++;
                    if (this.check_no_collision(mino)) return true;

                    mino.direction = 2;
                    break;

                case 3:
                    mino.direction = 0;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[1]--;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[0]++;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[1]++;
                    mino.control_point[0] -= 3;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[1]--;
                    if (this.check_no_collision(mino)) return true;

                    mino.direction = 3;
                    break;

                default:
                    console.err("Board.try_rotate_right: invalid direction");
                    break;
            }
        }

        mino.control_point = origin;
        return false;
    }

    try_rotate_left (mino) {
        if (typeof mino === "undefined") return false;

        const origin = mino.control_point.slice();
        if (mino.mino_type == "O") return true;

        if (mino.mino_type == "I") {
            switch (mino.direction) {
                case 0:
                    mino.direction = 3;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[1]--;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[1] += 3;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[1] -= 3;
                    mino.control_point[0] -= 2;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[1] += 3;
                    mino.control_point[0] += 3;
                    if (this.check_no_collision(mino)) return true;

                    mino.direction = 0;
                    break;

                case 1:
                    mino.direction = 0;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[1] += 2;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[1] -= 3;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[1] += 3;
                    mino.control_point[0]--;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[1] -= 3;
                    mino.control_point[0] += 3;
                    if (this.check_no_collision(mino)) return true;

                    mino.direction = 1;
                    break;

                case 2:
                    mino.direction = 1;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[1]++;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[1] -= 3;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[1] += 3;
                    mino.control_point[0] += 2;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[1] -= 3;
                    mino.control_point[0] -= 3;
                    if (this.check_no_collision(mino)) return true;

                    mino.direction = 2;
                    break;

                case 3:
                    mino.direction = 2;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[1] -= 2;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[1] += 3;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[0] += 2;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[0] -= 3;
                    mino.control_point[1] -= 3;
                    if (this.check_no_collision(mino)) return true;

                    mino.direction = 3;
                    break;

                default:
                    console.err("Board.try_rotate_right: invalid direction");
                    break;
            }
        }
        else {
            switch (mino.direction) {
                case 0:
                    mino.direction = 3;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[1]++;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[0]--;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[1]--;
                    mino.control_point[0] += 3;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[1]++;
                    if (this.check_no_collision(mino)) return true;

                    mino.direction = 0;
                    break;

                case 1:
                    mino.direction = 0;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[1]++;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[0]++;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[1]--;
                    mino.control_point[0] -= 3;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[1]++;
                    if (this.check_no_collision(mino)) return true;

                    mino.direction = 1;
                    break;

                case 2:
                    mino.direction = 1;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[1]--;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[0]--;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[1]++;
                    mino.control_point[0] += 3;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[1]--;
                    if (this.check_no_collision(mino)) return true;

                    mino.direction = 2;
                    break;

                case 3:
                    mino.direction = 2;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[1]--;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[0]++;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[1]++;
                    mino.control_point[0] -= 3;
                    if (this.check_no_collision(mino)) return true;

                    mino.control_point[1]--;
                    if (this.check_no_collision(mino)) return true;

                    mino.direction = 3;
                    break;

                default:
                    console.err("Board.try_rotate_right: invalid direction");
                    break;
            }
        }

        mino.control_point = origin;
        return false;
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

    draw_hold (canvas_element, hold, used_hold) {
        const ctx = canvas_element.getContext("2d");
        ctx.clearRect(0, 0, canvas_element.width, canvas_element.height);
        if (typeof hold === "undefined") return;

        const m = Mino[hold.mino_type].shape[0];
        // ミノによって開始地点を変える。
        let cur = [1, 1.5];
        if (hold.mino_type == "I") cur = [0.5, 1];

        for (let i = 0; i < m.length; i++) {
            cur[1] = 1.5;
            if (hold.mino_type == "I") cur[1] = 1;

            for (let j = 0; j < m[i].length; j++) {
                if (m[i][j]) {
                    ctx.fillStyle = color[hold.mino_type];
                    if (used_hold) ctx.fillStyle = color.ghost;
                    ctx.fillRect(cur[1] * block_size_px_subscreen, cur[0] * block_size_px_subscreen, block_size_px_subscreen, block_size_px_subscreen);
                }

                cur[1]++;
            }
            cur[0]++;
        }
    }

    draw_next (canvas_element, next) {
        const ctx = canvas_element.getContext("2d");
        ctx.clearRect(0, 0, canvas_element.width, canvas_element.height);
        let cur = [0.5, 1.5];

        for (let x = 0; x < next.length; x++) {
            const mino = next[x];
            const m = Mino[mino.mino_type].shape[0];

            if (mino.mino_type == "I") cur[0]--;

            for (let i = 0; i < m.length; i++) {
                cur[1] = 1.5;
                if (mino.mino_type == "I") cur[1] = 1;

                for (let j = 0; j < m[i].length; j++) {
                    if (m[i][j]) {
                        ctx.fillStyle = color[mino.mino_type];
                        ctx.fillRect(cur[1] * block_size_px_subscreen, cur[0] * block_size_px_subscreen, block_size_px_subscreen, block_size_px_subscreen);
                    }

                    cur[1]++;
                }

                cur[0]++;
            }

            if (mino.mino_type == "O") cur[0]++;
            if (mino.mino_type == "I") cur[0]--;
        }
    }
}
