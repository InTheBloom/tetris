class TimingManager {
    constructor () {
        this.drop_interval = 1000;
        this.last_droped = performance.now();

        this.place_interval = 500;
        this.last_grounded = Infinity;
        this.is_grounding_now = false;

        this.last_placed = 0;
        this.mino_spawn_interval = 100;
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
        if (timestamp - this.last_droped <= this.drop_interval) return -1;

        const drop = Math.floor((timestamp - this.last_droped) / this.drop_interval);
        this.last_droped = timestamp;
        return drop;
    }

    is_time_to_get_next_mino (timestamp) {
        if (timestamp - this.last_placed <= this.mino_spawn_interval) return false;
        return true;
    }

    did_hard_drop (timestamp) {
        this.last_grounded = Infinity;
        this.is_grounding_now = false;
        this.last_placed = timestamp;

        this.last_droped = timestamp + this.mino_spawn_interval - this.drop_interval;
    }

    check_soft_drop () {
    }

    refresh_grounding_state (board, mino_manager, timestamp) {
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
}
