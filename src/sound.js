class Sound {
    constructor () {
        this.bgms = [
            new Audio("assets/190117-chill-japan-calm-simple-nostalgic-143427.mp3"),
            new Audio("assets/nostalgic-love-203001.mp3"),
            new Audio("assets/starry-sky-calm-dreamy-piano-235728.mp3"),
            new Audio("assets/your-smile-haunts-me-bittersweet-calm-piano-solo-233861.mp3"),
        ];
        this.current_track = 0;

        this.f;
    }

    play_bgm () {
        this.f = (e) => {
            this.bgms[this.current_track].currentTime = 0;
            this.current_track++;
            this.current_track %= this.bgms.length;
            this.bgms[this.current_track].play();
        };

        for (const bgm of this.bgms) {
            bgm.volume = 0.1;
            bgm.addEventListener("ended", this.f);
        }
        this.bgms[0].play();
    }

    stop_bgm () {
        for (const bgm of this.bgms) {
            bgm.removeEventListener("ended", this.f);
        }

        for (const bgm of this.bgms) {
            bgm.pause();
        }
    }

    modify_volume (level) {
        for (const bgm of this.bgms) {
            bgm.volume = level;
        }
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

        s.volume = parseFloat(soundeffect_volume.value);
        s.play();
    }
}
