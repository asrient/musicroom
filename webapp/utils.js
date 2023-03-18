
export function durationFormat(sec) {
    if (sec < 0) {
        return "0:00";
    }
    var min = Math.floor(sec / 60);
    var sec = sec % 60;
    return min + ":" + (sec < 10 ? "0" : "") + sec;
}

export function setbgColor(colors) {
    if(!colors) {
        colors = [
            [61, 52, 52],
            [77, 41, 41],
        ]
    }
    document.getElementById('bg').style.background=`linear-gradient(120deg,rgb(${colors[0][0]} ${colors[0][1]} ${colors[0][2]}),rgb(${colors[1][0]} ${colors[1][1]} ${colors[1][2]}))`
}

export function resetBgColor () {
    setbgColor();
}
