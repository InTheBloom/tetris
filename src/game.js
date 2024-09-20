class Game {
    constructor () {
        this.board = new Board();
        this.mino_manager = new MinoManager();
        this.timing_manager = new TimingManager();
        this.is_running = false;
        this.is_gameovered = false;
    }

    quit (canvas_elements) {
        this.is_running = false;
        for (const c of canvas_elements) {
            const ctx = c.getContext("2d");
            ctx.clearRect(0, 0, c.width, c.height);
        }
    }

    // ゲームループも抱え込ませちゃう
    start () {
        this.is_running = true;
        this.board.draw_board(main_screen);

        const game_roop = (timestamp) => {
            if (!this.is_running) {
                return;
            }

            (() => {
                // ゲームオーバー判定
                if (this.board.is_gameover(this.mino_manager.current_mino)) {
                    this.is_running = false;
                    this.is_gameovered = true;
                    console.log("gameover!");
                    return;
                }

                // ネクスト補充
                if (typeof this.mino_manager.current_mino === "undefined") {
                    if (this.timing_manager.is_time_to_get_next_mino(timestamp)) {
                        this.mino_manager.get_next_mino();
                        this.mino_manager.current_mino.init(
                            timestamp,
                            this.timing_manager.drop_interval,
                            this.board);
                    }
                }

                // ホールド操作
                if (this.timing_manager.try_hold()) {
                    [this.mino_manager.current_mino, this.mino_manager.hold] = [this.mino_manager.hold, this.mino_manager.current_mino];
                    if (typeof this.mino_manager.current_mino !== "undefined") {
                        this.mino_manager.current_mino.init(
                            timestamp,
                            this.timing_manager.drop_interval,
                            this.board);
                    }
                    return;
                }

                // ホールドの描画
                this.board.draw_hold(hold_screen, this.mino_manager.hold, this.timing_manager.used_hold);

                // ネクストの描画
                this.board.draw_next(next_screen, this.mino_manager.next_minos);

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
                        let real = 0;
                        for (let i = 0; i < Math.min(drop, 24); i++) {
                            if (!this.board.try_drop(this.mino_manager.current_mino)) break;
                            real++;
                        }
                        this.board.place_mino(this.mino_manager.current_mino);
                        this.board.draw_board(main_screen);
                        this.board.clear_mino(this.mino_manager.current_mino);

                        if (0 < real) {
                            this.mino_manager.current_mino.call_after_droped(
                                this.board.is_grounding(this.mino_manager.current_mino),
                                timestamp);
                        }
                    }
                }

                // ハードドロップ
                if (this.timing_manager.try_hard_drop(this.mino_manager.current_mino, timestamp)) {
                    while (this.board.try_drop(this.mino_manager.current_mino)) {}
                    this.board.place_mino(this.mino_manager.current_mino);
                    this.board.draw_board(main_screen);

                    this.mino_manager.current_mino = undefined;
                    return;
                }

                // ソフトドロップ
                this.timing_manager.try_soft_drop(this.mino_manager.current_mino, timestamp);

                // 右移動
                if (this.timing_manager.try_move_right(timestamp)) {
                    if (this.board.try_move_right(this.mino_manager.current_mino)) {
                        this.board.place_mino(this.mino_manager.current_mino);
                        this.board.draw_board(main_screen);
                        this.board.clear_mino(this.mino_manager.current_mino);

                        this.mino_manager.current_mino.call_after_moved_horizontally(this.board.is_grounding(this.mino_manager.current_mino), timestamp);
                    }
                }

                // 左移動
                if (this.timing_manager.try_move_left(timestamp)) {
                    if (this.board.try_move_left(this.mino_manager.current_mino)) {
                        this.board.place_mino(this.mino_manager.current_mino);
                        this.board.draw_board(main_screen);
                        this.board.clear_mino(this.mino_manager.current_mino);

                        this.mino_manager.current_mino.call_after_moved_horizontally(
                            this.board.is_grounding(this.mino_manager.current_mino),
                            timestamp);
                    }
                }

                // 右回転

                // 左回転
            })();

            window.requestAnimationFrame(game_roop);
        }

        window.requestAnimationFrame(game_roop);
    }
}
