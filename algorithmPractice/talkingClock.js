/* Solution strongly based on freeCodeCamp youTube video */
const ONES = [
    "",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
]

const TEENS = [
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
]

const TENS = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
]

const HOURS = [
    "twelve",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
]

function talkingClock(time) {
    const [h, m] = time.split(":").map(n => parseInt(n));
    var hours = HOURS[h % 12];
    var amPM = h < 12 ? "am." : "pm.";
    var minutes;
    if (m != 0) {
        if (m < 10) {
            minutes = `oh ${ONES[m]}`;
        }
        else if (m < 20) {
            minutes = `${TEENS[m % 10]}`;
        }
        else {
            minutes = `${TENS[Math.floor(m/10)]} ${ONES[m %10]}`;
        }
    }

    return ["It is",hours, minutes,amPM]
        .join(" ");
}

console.log(talkingClock("23:33"));