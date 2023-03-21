
export function durationFormat(sec) {
    if (sec < 0) {
        return "0:00";
    }
    var min = Math.floor(sec / 60);
    var sec = sec % 60;
    return min + ":" + (sec < 10 ? "0" : "") + sec;
}

export function avg(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function setbgColor(colors) {
    if(!colors) {
        colors = [
            [61, 52, 52],
            [77, 41, 41],
        ]
    }
    else {
        colors = colors.map((color)=>{
            let factor = 1;
            color.forEach(c => {
                if (c > 120) factor = 0.5;
            });
            return color.map((c)=>{
                return Math.floor(c*factor)
            });
        });
    }
    document.getElementById('bg').style.background=`rgb(${colors[0][0]} ${colors[0][1]} ${colors[0][2]})`
}

export function resetBgColor () {
    setbgColor();
}

export function currentScreenType () {
    return window.innerWidth < 768 ? "mobile" : "desktop";
};
