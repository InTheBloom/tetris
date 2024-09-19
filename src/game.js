class Game {
    constructor () {
        this.board = new Board();
        this.mino_manager = new MinoManager();
        this.timing_manager = new TimingManager();
        this.is_running = false;
    }

    quit (canvas_element) {
        this.is_running = false;
        const ctx = canvas_element.getContext("2d");
        ctx.clearRect(0, 0, canvas_element.width, canvas_element.height);
    }

    // ゲームループも抱え込ませちゃう
    start () {
        this.is_running = true;
        this.board.draw_board(canvas);

        const game_roop = (timestamp) => {
            if (!this.is_running) {
                return;
            }

            (() => {
                // ネクスト補充
                if (typeof this.mino_manager.current_mino === "undefined") {
                    if (this.timing_manager.is_time_to_get_next_mino(timestamp)) {
                        this.mino_manager.get_next_mino();
                        this.mino_manager.current_mino.last_droped = timestamp - this.timing_manager.drop_interval;
                    }
                }

                // ゲームオーバー判定
                if (this.board.is_gameover(this.mino_manager.current_mino)) {
                    this.is_running = false;
                    console.log("gameover!");
                    return;
                }

                // 時間経過によるミノ設置判定
                if (this.timing_manager.is_time_to_place(this.mino_manager.current_mino, timestamp)) {
                    this.board.place_mino(this.mino_manager.current_mino);
                    this.mino_manager.current_mino = undefined;
                    return;
                }

                // ミノ自由落下判定
                {
                    const drop = this.timing_manager.is_time_to_drop(this.mino_manager.current_mino, timestamp);

                    if (0 < drop) {
                        for (let i = 0; i < Math.min(drop, 24); i++) {
                            if (!this.board.try_drop(this.mino_manager.current_mino)) break;
                        }
                        this.board.place_mino(this.mino_manager.current_mino);
                        this.board.draw_board(canvas);
                        this.board.clear_mino(this.mino_manager.current_mino);
                    }
                }

                // ハードドロップ
                if (this.timing_manager.try_hard_drop(this.mino_manager.current_mino, timestamp)) {
                    while (this.board.try_drop(this.mino_manager.current_mino)) {}
                    this.board.place_mino(this.mino_manager.current_mino);
                    this.board.draw_board(canvas);

                    this.mino_manager.current_mino = undefined;
                    return;
                }

                // ソフトドロップ
                this.timing_manager.try_soft_drop(this.mino_manager.current_mino, timestamp);

                // 右移動
                if (this.timing_manager.try_move_right(timestamp)) {
                    if (this.board.try_move_right(this.mino_manager.current_mino)) {
                        this.board.place_mino(this.mino_manager.current_mino);
                        this.board.draw_board(canvas);
                        this.board.clear_mino(this.mino_manager.current_mino);
                    }
                }

                // 左移動
                if (this.timing_manager.try_move_left(timestamp)) {
                    if (this.board.try_move_left(this.mino_manager.current_mino)) {
                        this.board.place_mino(this.mino_manager.current_mino);
                        this.board.draw_board(canvas);
                        this.board.clear_mino(this.mino_manager.current_mino);
                    }
                }

                // 各タイミング変数のリセット
                this.timing_manager.refresh_state(this.board, this.mino_manager, timestamp);
            })();

            window.requestAnimationFrame(game_roop);
        }

        window.requestAnimationFrame(game_roop);
    }
}
