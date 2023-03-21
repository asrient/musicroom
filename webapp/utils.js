
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

export function generateUserColor(userId) {
    var colors = [
        "#da89b0",
        "#57a57b",
        "#955c89",
        "#55bea7",
        "#a95a61",
        "#52b4bc",
        "#9d6841",
        "#7aa3e0",
        "#75773a",
        "#716ba8",
        "#96b078",
        "#3a75aa",
        "#c5a269",
        "#65b5d8",
        "#de9184",
        "#1d686e",
        "#b797cd",
        "#487b50",
        "#418cab",
        "#358b85"];
    return colors[userId % colors.length];
}
