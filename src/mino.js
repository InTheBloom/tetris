const color = {
    empty: "white",
    ghost: "gray",
    T: "purple",
    S: "green",
    Z: "red",
    L: "orange",
    J: "blue",
    O: "yellow",
    I: "cyan",
};

const block_size_px = Math.floor((window.innerHeight * 0.8) / 20);
const block_size_px_subscreen = Math.floor(block_size_px * 1.0);

const Mino = Object.freeze({
    T: {
        shape: [
            [
                [false, true, false],
                [true, true, true],
                [false, false, false],
            ],
            [
                [false, true, false],
                [false, true, true],
                [false, true, false],
            ],
            [
                [false, false, false],
                [true, true, true],
                [false, true, false],
            ],
            [
                [false, true, false],
                [true, true, false],
                [false, true, false],
            ]
        ]
    },
    S: {
        shape: [
            [
                [false, true, true],
                [true, true, false],
                [false, false, false],
            ],
            [
                [false, true, false],
                [false, true, true],
                [false, false, true],
            ],
            [
                [false, false, false],
                [false, true, true],
                [true, true, false],
            ],
            [
                [true, false, false],
                [true, true, false],
                [false, true, false],
            ],
        ]
    },
    Z: {
        shape: [
            [
                [true, true, false],
                [false, true, true],
                [false, false, false],
            ],
            [
                [false, false, true],
                [false, true, true],
                [false, true, false],
            ],
            [
                [false, false, false],
                [true, true, false],
                [false , true, true],
            ],
            [
                [false, true, false],
                [true, true, false],
                [true, false, false],
            ],
        ]
    },
    L: {
        shape: [
            [
                [false, false, true],
                [true, true, true],
                [false, false, false],
            ],
            [
                [false, true, false],
                [false, true, false],
                [false, true, true],
            ],
            [
                [false, false, false],
                [true, true, true],
                [true, false, false],
            ],
            [
                [true, true, false],
                [false, true, false],
                [false, true, false],
            ],
        ]
    },
    J: {
        shape: [
            [
                [true, false, false],
                [true, true, true],
                [false, false, false],
            ],
            [
                [false, true, true],
                [false, true, false],
                [false, true, false],
            ],
            [
                [false, false, false],
                [true, true, true],
                [false, false, true],
            ],
            [
                [false, true, false],
                [false, true, false],
                [true, true, false],
            ],
        ]
    },
    O: {
        shape: [
            [
                [true, true],
                [true, true],
            ],
            [
                [true, true],
                [true, true],
            ],
            [
                [true, true],
                [true, true],
            ],
            [
                [true, true],
                [true, true],
            ],
        ]
    },
    I: {
        shape: [
            [
                [false, false, false, false],
                [true, true, true, true],
                [false, false, false, false],
                [false, false, false, false],
            ],
            [
                [false, false, true, false],
                [false, false, true, false],
                [false, false, true, false],
                [false, false, true, false],
            ],
            [
                [false, false, false, false],
                [false, false, false, false],
                [true, true, true, true],
                [false, false, false, false],
            ],
            [
                [false, true, false, false],
                [false, true, false, false],
                [false, true, false, false],
                [false, true, false, false],
            ],
        ]
    },
});

class MinoState {
    constructor (mino_type) {
        this.direction = 0;
        this.mino_type = mino_type;

        this.last_droped = Infinity;
        this.last_grounded = Infinity;
        this.is_grounding_now = false;

        this.lowest_height = 2;
        this.placement_delay_count = 15;
    }

    set_control_point () {
        switch (this.mino_type) {
            case "T":
                this.control_point = [2, 3];
                break;
            case "S":
                this.control_point = [2, 3];
                break;
            case "Z":
                this.control_point = [2, 3];
                break;
            case "L":
                this.control_point = [2, 3];
                break;
            case "J":
                this.control_point = [2, 3];
                break;
            case "O":
                this.control_point = [2, 4];
                break;
            case "I":
                this.control_point = [2, 3];
                break;
            default:
                console.err("MinoState::Constructor: Invalid mino name.");
        }
    }

    init (timestamp, drop_interval, board) {
        this.direction = 0;

        this.last_droped = timestamp - drop_interval;
        this.last_grounded = Infinity;
        this.is_grounding_now = false;

        this.lowest_height = 2;
        this.placement_delay_count = 15;

        this.set_control_point();

        if (board.is_grounding(this)) {
            this.is_grounding_now = timestamp;
            this.last_grounded = timestamp;
        }
    }

    call_after_droped (ground, timestamp) {
        this.last_droped = timestamp;
        if (this.lowest_height < this.control_point[0]) {
            this.lowest_height = this.control_point[0];
            this.placement_delay_count = 15;
        }

        if (ground) {
            this.is_grounding_now = true;
            this.last_grounded = timestamp;
        }
        else {
            this.is_grounding_now = false;
            this.last_grounded = Infinity;
        }
    }

    call_after_moved_horizontally (ground, timestamp) {
        if (ground) {
            this.is_grounding_now = true;
            this.placement_delay_count--;
            this.last_grounded = timestamp;
        }
        else {
            if (this.is_grounding_now) {
                this.placement_delay_count--;
                this.last_droped = timestamp;
            }
            this.is_grounding_now = false;
            this.last_grounded = Infinity;
        }
    }

    call_after_rotate (ground, timestamp) {
        this.placement_delay_count--;

        if (ground) {
            this.is_grounding_now = true;
            this.last_grounded = timestamp;
        }
        else {
            if (this.is_grounding_now) {
                this.last_droped = timestamp;
            }
            this.is_grounding_now = false;
            this.last_grounded = Infinity;
        }
    }
}
