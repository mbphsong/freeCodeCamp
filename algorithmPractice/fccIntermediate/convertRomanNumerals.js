function convertToRoman(num) {
    var roman = "";
    var parsing = [
        {
            "name": 1000,
            "mod": num % 1000,
            "single": "M",
            "five": "n/a",
        },
        {
            "name": 100,
            "mod": 0,
            "single": "C",
            "five": "D",
        },
        {
            "name": 10,
            "mod": 0,
            "single": "X",
            "five": "L",
        },
        {
            "name": 1,
            "mod": 0,
            "single": "I",
            "five": "V",
        },
    ];

    function getSymbols(arabicNum, index) {
        if (index == 0) {
            //thousands - different rules
            for (var j=1; j<=arabicNum; j++) {
                roman += parsing[index].single;
            }
            return;
        }
        if (5 <= arabicNum && arabicNum <= 8) {
            roman += parsing[index].five;
        }
        switch(arabicNum) {
            case 3:
            case 8:
                roman += parsing[index].single;
            case 2:
            case 7:
                roman += parsing[index].single;
            case 1:
            case 6:
                roman += parsing[index].single;
                break;
            case 4:
                roman += parsing[index].single + parsing[index].five;
                break;
            case 9:
                roman += parsing[index].single + parsing[index - 1].single;
                break;
            default:
                break;
        }
    }

    getSymbols(Math.floor(num / parsing[0].name), 0);

    for (var i=1; i<parsing.length; i++) {
        var starting = parsing[i-1].mod;
        var divisor = parsing[i].name;

        parsing[i].mod = starting % divisor;

        getSymbols(Math.floor(starting / divisor), i);
    }
    return roman;
}

console.log(convertToRoman(2));
console.log(convertToRoman(83));
console.log(convertToRoman(649));