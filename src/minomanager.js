class MinoManager {
    constructor () {
        this.hold = undefined;
        this.current_mino = undefined;
        this.next_minos = [];
        this.appeared = new Array(7).fill(false);

        // 最初の準備
        for (let i = 0; i < 5; i++) this.refill();
    }

    get_next_mino () {
        this.current_mino = this.next_minos.shift();
        this.refill();
    }

    refill () {
        const candidate = [];
        let empty = true;
        for (let i = 0; i < this.appeared.length; i++) if (!this.appeared[i]) empty = false;
        if (empty) for (let i = 0; i < this.appeared.length; i++) this.appeared[i] = false;

        for (let i = 0; i < this.appeared.length; i++) {
            if (!this.appeared[i]) {
                candidate.push(i);
            }
        }

        const choice = Math.floor(candidate.length * Math.random());
        this.appeared[candidate[choice]] = true;
        this.next_minos.push(new MinoState(["T", "S", "Z", "L", "J", "O", "I"][candidate[choice]]));
    }
}
