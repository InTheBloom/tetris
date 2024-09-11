class GameState {
    is_running = false;
    hold = undefined;
    operating;
    next;

    last_droped = 0;
    interval = 1000;

    constructor () {
    }

    update () {
        this.operating = new MinoState(["T", "S", "Z", "L", "J", "O", "I"][Math.floor(7 * Math.random())]);
    }
}
