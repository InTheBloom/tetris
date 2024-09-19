class TimingManager {
    constructor () {
        this.drop_interval = 1000;
        this.last_droped = Infinity;

        this.place_interval = 500;
        this.last_grounded = Infinity;
        this.is_grounding_now = false;

        this.last_placed = 0;
        this.mino_spawn_interval = 100;

        this.released_arrowright = true;
        this.last_released_arrowright = Infinity;
        this.released_arrowleft = true;
        this.last_released_arrowleft = Infinity;
        this.repeat_interval = 300;
        this.horizontal_move_interval = 50;

        this.released_arrowup = true;

        this.released_arrodown = true;
    }

    is_time_to_place (timestamp) {
        if (timestamp - this.last_grounded <= this.place_interval) return false;
        this.last_grounded = Infinity;
        this.is_grounding_now = false;
        this.last_placed = timestamp;
        this.last_droped = timestamp + this.mino_spawn_interval - this.drop_interval;
        return true;
    }

    is_time_to_drop (timestamp) {
        if (this.last_droped == Infinity) this.last_droped = timestamp - this.drop_interval;;
        if (timestamp - this.last_droped <= this.drop_interval) return -1;

        const drop = Math.floor((timestamp - this.last_droped) / this.drop_interval);
        this.last_droped = timestamp;
        return drop;
    }

    is_time_to_get_next_mino (timestamp) {
        if (timestamp - this.last_placed <= this.mino_spawn_interval) return false;
        return true;
    }

    check_soft_drop () {
    }

    refresh_state (board, mino_manager, timestamp) {
        if (board.is_grounding(mino_manager.current_mino)) {
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
    }

    try_hard_drop (timestamp) {
        if (!is_pressed("ArrowUp")) {
            this.released_arrowup = true;
            return false;
        }

        if (!this.released_arrowup) return false;
        this.released_arrowup = false;

        this.last_grounded = Infinity;
        this.is_grounding_now = false;
        this.last_placed = timestamp;

        this.last_droped = timestamp + this.mino_spawn_interval - this.drop_interval;

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

    try_soft_drop (timestamp) {
        if (is_pressed("ArrowDown")) {
            this.drop_interval = 1000 / 20;
            if (this.released_arrowdown) {
                this.last_droped = timestamp - this.drop_interval;
                this.released_arrowdown = false;
            }
        }
        else {
            this.drop_interval = 1000;
            this.released_arrowdown = true;
        }
    }
}
