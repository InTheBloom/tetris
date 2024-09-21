class TimingManager {
    constructor () {
        // 各種インターバル
        this.drop_interval = 1000;
        this.place_interval = 500;

        // おいてからミノが出現するまで
        this.last_placed = 0;
        this.mino_spawn_interval = 100;

        // 右移動
        this.released_arrowright = true;
        this.last_released_arrowright = Infinity;

        // 左移動
        this.released_arrowleft = true;
        this.last_released_arrowleft = Infinity;

        // 左右移動共通
        this.repeat_interval = 300;
        this.horizontal_move_interval = 50;

        // ソフトドロップ用
        this.released_arrowup = true;

        // ハードドロップ用
        this.released_arrodown = true;

        // ホールド用
        this.used_hold = false;
        this.released_space = true;
        this.update_hold_view = true;

        // 右回転
        this.released_f = false;

        // 左回転
        this.released_a = false;

        // ネクスト再描画用
        this.update_next_view = true;
    }

    try_hold () {
        if (!is_pressed(" ")) {
            this.released_space = true;
            return false;
        }
        if (!this.released_space) return false;
        this.released_space = false;

        if (this.used_hold) return false;
        this.used_hold = true;

        this.update_hold_view = true;
        return true;
    }

    is_time_to_place (mino, timestamp) {
        if (typeof mino === "undefined") return false;
        if (mino.placement_delay_count <= 0 && mino.is_grounding_now) return true;
        if (timestamp - mino.last_grounded <= this.place_interval) return false;
        this.last_placed = timestamp;
        this.used_hold = false;
        this.update_hold_view = true;
        return true;
    }

    is_time_to_drop (mino, timestamp) {
        if (typeof mino === "undefined") return false;
        if (timestamp - mino.last_droped <= this.drop_interval) return -1;

        const drop = Math.floor((timestamp - mino.last_droped) / this.drop_interval);
        return drop;
    }

    is_time_to_get_next_mino (timestamp) {
        if (timestamp - this.last_placed <= this.mino_spawn_interval) return false;
        this.update_next_view = true;
        return true;
    }

    try_hard_drop (mino, timestamp) {
        if (typeof mino === "undefined") return false;

        if (!is_pressed("ArrowUp")) {
            this.released_arrowup = true;
            return false;
        }

        if (!this.released_arrowup) return false;
        this.released_arrowup = false;

        this.last_placed = timestamp;
        this.used_hold = false;
        this.update_hold_view = true;

        return true;
    }

    try_move_right (timestamp) {
        if (!is_pressed("ArrowRight")
            || (is_pressed("ArrowRight") && is_pressed("ArrowLeft"))) {
            this.last_released_arrowright = timestamp;
            this.released_arrowright = true;
            return false;
        }

        if (this.released_arrowright) {
            this.released_arrowright = false;
            return true;
        }

        if (timestamp - this.last_released_arrowright <= this.repeat_interval) return false;
        return true;
    }

    try_move_left (timestamp) {
        if (!is_pressed("ArrowLeft")
            || (is_pressed("ArrowLeft") && is_pressed("ArrowRight"))) {
            this.last_released_arrowleft = timestamp;
            this.released_arrowleft = true;
            return false;
        }

        if (this.released_arrowleft) {
            this.released_arrowleft = false;
            return true;
        }

        if (timestamp - this.last_released_arrowleft <= this.repeat_interval) return false;
        return true;
    }

    try_soft_drop (mino, timestamp) {
        if (typeof mino === "undefined") return false;

        if (is_pressed("ArrowDown")) {
            this.drop_interval = 1000 / 20;
            if (this.released_arrowdown) {
                mino.last_droped = timestamp - this.drop_interval;
                this.released_arrowdown = false;
            }
        }
        else {
            this.drop_interval = 1000;
            this.released_arrowdown = true;
        }
    }

    try_rotate_right () {
        if (!is_pressed("f")
            || (is_pressed("f") && is_pressed("a"))) {
            this.released_f = true;
            return false;
        }
        if (!this.released_f) return false;
        this.released_f = false;

        return true;
    }

    try_rotate_left () {
        if (!is_pressed("a")
            || (is_pressed("a") && is_pressed("f"))) {
            this.released_a = true;
            return false;
        }
        if (!this.released_a) return false;
        this.released_a = false;

        return true;
    }
}
