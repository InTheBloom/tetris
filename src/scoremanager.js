class ScoreManager {
    constructor (html_element) {
        this.sum_of_cleared_lines = 0;
        if (!window.localStorage.hasOwnProperty("highest")) {
            window.localStorage.highest = 0;
        }

        html_element.innerHTML = `${window.localStorage.highest}`;
    }
    
    refresh (html_element) {
        html_element.innerHTML = `${this.sum_of_cleared_lines}`;
    }

    update_score (lines) {
        this.sum_of_cleared_lines += lines;
        this.refresh(cleared_lines_board);
    }

    update_highest () {
        if (window.localStorage.highest < this.sum_of_cleared_lines) {
            window.localStorage.highest = this.sum_of_cleared_lines;
        }
    }
}
