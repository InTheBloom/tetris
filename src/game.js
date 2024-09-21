class Game {
    constructor () {
        this.board = new Board();
        this.mino_manager = new MinoManager();
        this.timing_manager = new TimingManager();
        this.score_manager = new ScoreManager(highest_cleared_lines_board);
        this.sound = new Sound();


        this.max_fps = 60;
        this.current_time;
        this.is_running = false;
        this.is_gameovered = false;
    }

    quit (canvas_elements) {
        this.is_running = false;

        // 終了時にやらないとちょっとまずい処理
        this.sound.stop_bgm();
        this.score_manager.update_highest();

        for (const c of canvas_elements) {
            const ctx = c.getContext("2d");
            ctx.clearRect(0, 0, c.width, c.height);
        }
    }

    // ゲームループ
    start () {
        this.is_running = true;
        this.board.draw_board(main_screen);

        this.current_time = performance.now();

        this.sound.play_bgm();

        const game_roop = (timestamp) => {
            if (timestamp - this.current_time < 1 / this.max_fps) {
                requestAnimationFrame(game_roop);
                return;
            }
            this.current_time = timestamp;

            if (!this.is_running) {
                this.score_manager.update_highest();
                this.sound.stop_bgm();
                return;
            }

            (() => {
                // ゲームオーバー判定
                if (this.board.is_gameover(this.mino_manager.current_mino)) {
                    this.is_running = false;
                    this.is_gameovered = true;
                    alert("gameover!\nPress ESC to reset.");

                    this.score_manager.update_highest();
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

                // ライン消去
                const count = this.board.check_cleared_lines();
                this.sound.play_line_clear_sound(count);
                this.score_manager.update_score(count);

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
                if (this.timing_manager.update_hold_view) {
                    this.timing_manager.update_hold_view = false;
                    this.board.draw_hold(hold_screen, this.mino_manager.hold, this.timing_manager.used_hold);
                }

                // ネクストの描画
                if (this.timing_manager.update_next_view) {
                    this.timing_manager.update_next_view = false;
                    this.board.draw_next(next_screen, this.mino_manager.next_minos);
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

                        this.mino_manager.current_mino.call_after_moved_horizontally(this.board.is_grounding(this.mino_manager.current_mino),
                            timestamp);
                    }
                }

                // 右回転
                if (this.timing_manager.try_rotate_right()) {
                    if (this.board.try_rotate_right(this.mino_manager.current_mino)) {
                        this.board.place_mino(this.mino_manager.current_mino);
                        this.board.draw_board(main_screen);
                        this.board.clear_mino(this.mino_manager.current_mino);

                        this.mino_manager.current_mino.call_after_rotate(this.board.is_grounding(this.mino_manager.current_mino),
                            timestamp);
                    }
                }

                // 左回転
                if (this.timing_manager.try_rotate_left()) {
                    if (this.board.try_rotate_left(this.mino_manager.current_mino)) {
                        this.board.place_mino(this.mino_manager.current_mino);
                        this.board.draw_board(main_screen);
                        this.board.clear_mino(this.mino_manager.current_mino);

                        this.mino_manager.current_mino.call_after_rotate(this.board.is_grounding(this.mino_manager.current_mino),
                            timestamp);
                    }
                }
            })();

            window.requestAnimationFrame(game_roop);
        }

        window.requestAnimationFrame(game_roop);
    }
}
