class Sound {
    constructor () {
    }

    play_line_clear_sound (line) {
        if (line == 0) return;

        let s;
        if (line <= 2) {
            s = new Audio("assets/lineclear1.wav");
        }
        else {
            s = new Audio("assets/lineclear2.wav");
        }

        s.play();
    }
}
