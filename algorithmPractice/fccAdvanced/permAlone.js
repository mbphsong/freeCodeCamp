function permAlone(str) {
    var perms = 0;
    var memoize = true;
    var re = /(.)\1+/g;
    var matches;
    var numMatches;
    var map = {};
    var getRoutes = function (currLetter,letterStr) {
        var key = currLetter + letterStr;
        var count = 0;
        
        if (letterStr.length == 0) {
            //reached the end - complete permutation
            return 1;
        }
        
        if (map[key]) {
            //already been here, no need to recalculate
            return map[key];
        }
        
        for (var i=0; i<letterStr.length; i++) {
            if (currLetter != letterStr[i]) {
                count += getRoutes(letterStr[i],letterStr.substr(0,i) + letterStr.substr(i + 1));
            }
        }
        
        map[key] = count;
        return count;
    };
    var f = (function() {
        var factorials = [1,1];
        var currProduct = 1;

        function loopFactorial(value) {
            if (value == 0) {
                return 1;
            }
            if (factorials[value] != undefined) {
                return factorials[value];
            }

            factorials[value] = value * loopFactorial(value - 1);
            return factorials[value];
        }
        function factorial(value) {
            if (isNaN(value) || (parseInt(value) != value)) {
                console.log("Argument `" + value + "` not valid. Please pass an integer");
                return;
            }
            return loopFactorial(value);
        }

        return {
            factorial: factorial,
        }
    })();
    
    //knock out the quick calculations instead of looping for those
    str = str.split("").sort().join("");
    matches = str.match(re);
    numMatches = matches != null ? matches.length : 0;
    if (numMatches == 0) {
        //no duplicate letters, so return simple factorial
        return f.factorial(str.length);
    }

    for (var i=0; i<numMatches; i++) {
        //get info on our duplicates
        var numChar = matches[i].length;
        var remChar = str.length - numChar;

        if (numChar - remChar > 1) {
            //not enough letters to divide all of the duplicates; no permutations possible
            return 0;
        }

        if (numChar - remChar == 1) {
            //must have one of each of remChar between all numChar
            return f.factorial(numChar) * f.factorial(remChar);
        }

    }
    //use looper if more complicated

    if (memoize) {
        //use recursion and memoization - possibility of stack overflow with recursion if large number, but memoization should reduce calculations 
        return getRoutes("",str);
    } else {
        //use stack - avoids possibility of stack overflow, but potentially very heavy time/memory cost
        //takes a bit on "aaabbccefg", prohibitively slow on "aaabbbccdefg"
        var stack = [];
        function newNode(index, letterStr) {
            var copy = letterStr.substr(0,index) + letterStr.substr(index + 1);
            return {
                letter: letterStr[index],
                letterStr: copy,
            }
        }
        stack.push({letter: "", letterStr: str});

        while (stack.length) {
            var thisNode = stack.pop();
            var letterStr = thisNode.letterStr;
            if (letterStr.length == 0) {
                //reached the end
                perms++;
            } else {
                for (var i=0; i<letterStr.length; i++) {
                    //loop through remaining letters, see if they can be next
                    if (thisNode.letter != letterStr[i]) {
                        stack.push(newNode(i,letterStr));
                    }
                }
            }
        }
    }
        
    
    return perms;
}

function permAlone2(str) {
    var perms = 0;
    var math = false;
    var memoize = true;
    
    str = str.split("").sort().join("");
    
    if (math) {
        //couldn't get this one to work...not sure how to calc dups/repeats with more letters repeated/more repeates per letter
        var numSplitters = 0;
        var startingChars = 0;
        var denominator = 1;
        var re = /(.)\1+/g;
        var matches = str.match(re);
        var totalChar = str.length;
        var numMatches = matches != null ? matches.length : 0;
        var items = {
            dups: [],
            mostChar: {
                index:0,
                count: 0,
            },
            repeatedLetters: 0,
        }
        var f = (function() {
            var factorials = [1,1];
            var currProduct = 1;

            function loopFactorial(value) {
                if (value == 0) {
                    return 1;
                }
                if (factorials[value] != undefined) {
                    return factorials[value];
                }

                factorials[value] = value * loopFactorial(value - 1)
                return factorials[value];
            }
            function factorial(value) {
                if (isNaN(value) || (parseInt(value) != value)) {
                    console.log("Argument `" + value + "` not valid. Please pass an integer");
                    return;
                }
                return loopFactorial(value);
            }

            return {
                factorial: factorial,
            }
        })();

        if (numMatches == 0) {
            //no duplicate letters, so return simple factorial
            return f.factorial(totalChar);
        }

        for (var i=0; i<numMatches; i++) {
            //get info on our duplicates
            var numChar = matches[i].length;
            var remChar = totalChar - numChar;

            if (numChar - remChar > 1) {
                //not enough letters to divide all of the duplicates; no permutations possible
                return 0;
            }

            if (numChar - remChar == 1) {
                //must have one of each of remChar between all numChar
                return f.factorial(numChar) * f.factorial(remChar);
            }

            if (numChar > items.mostChar.count) {
                //set our highest number multiple as "splitters"
                items.mostChar.count = numChar;
                items.mostChar.index = items.dups.length;
            }
            items.dups.push(numChar);
            denominator *= f.factorial(numChar);
            items.repeatedLetters += numChar;
        }

        items.dups.splice(items.mostChar.index,1);
        numSplitters = items.mostChar.count;
        startingChars = totalChar - numSplitters;
        //now that we know which number is our splitters, remove - don't want this as part of denominator for perms that have repeating chars
        denominator /= f.factorial(numSplitters);

        //get starting number - includes repeating chars for any that aren't the splitters
        perms = calcPerms(startingChars,denominator,numSplitters);
        console.log(perms);
        //remove permutations with repeating letters
        perms -= calcInvalid(items.dups,numSplitters,startingChars, items, totalChar);

        //account for duplicates in opposite positions
        perms *= denominator * f.factorial(numSplitters);

        function calcPerms(numPositions,repetitions,splitters) {
            var startingPerms = f.factorial(numPositions) / repetitions;
            console.log(numPositions);
            var placeSplitters = calcCombos(numPositions + 1, splitters);
            return startingPerms * placeSplitters;
        }

        function calcCombos(n,r) {
            //n is number of places available
            //r is number of places to fill
            return f.factorial(n) / (f.factorial(r) * f.factorial(n - r));
        }

        function calcInvalid(repeats, splitters, numPositions, dups, total) {
            var invalid = 0;
            var nonRepeated = total - dups.repeatedLetters;
            if (repeats.length == 0) {
                //only had splitters, so no invalid to subtract
                return 0;
            }
            invalid = calcPerms(numPositions - 1,1,splitters);
            //remove the duplicated permutations, ie a+a+bb and aa+b+b can be the same as aa+bb
            for (var numPos=numPositions-2; numPos >= dups.dups.length + nonRepeated; numPos--) {
                invalid -= calcPerms(numPos,1,splitters);
            }
            return invalid;
        }
    } else if (memoize) {
        //use recursion and memoization - possibility of stack overflow with recursion if large number, but memoization should reduce calculations
        var map = {};
        
        function getRoutes(currLetter,letterStr) {
            var key = currLetter + letterStr;
            var count = 0;
            
            if (letterStr.length == 0) {
                //reached the end - complete permutation
                return 1;
            }
            
            if (map[key]) {
                //already been here, no need to recalculate
                return map[key];
            }
            
            for (var i=0; i<letterStr.length; i++) {
                if (currLetter != letterStr[i]) {
                    count += getRoutes(letterStr[i],letterStr.substr(0,i) + letterStr.substr(i + 1));
                }
            }
            
            map[key] = count;
            return count;
        }
        
        return getRoutes("",str);
    } else {
        //use stack - avoids possibility of stack overflow, but potentially very heavy time/memory cost
        var stack = [];
        function newNode(index, letterStr) {
            var copy = letterStr.substr(0,index) + letterStr.substr(index + 1);
            return {
                letter: letterStr[index],
                letterStr: copy,
            }
        }
        stack.push({letter: "", letterStr: str});

        while (stack.length) {
            var thisNode = stack.pop();
            var letterStr = thisNode.letterStr;
            if (letterStr.length == 0) {
                //reached the end
                perms++;
            } else {
                for (var i=0; i<letterStr.length; i++) {
                    //loop through remaining letters, see if they can be next
                    if (thisNode.letter != letterStr[i]) {
                        stack.push(newNode(i,letterStr));
                    }
                }
            }
        }
    }
    return perms;
}

console.log(permAlone('aab')); //2
console.log(permAlone("abcdefa")); //3600
console.log(permAlone("zzzzzzzz")); //0
console.log(permAlone("a")); //1
console.log(permAlone("abfdefa")); //2640
console.log(permAlone("aaab")); //0
console.log(permAlone("aaabb")); //12
console.log(permAlone("aabbcc")); //240
console.log(permAlone("aabb")); //8
console.log(permAlone("aabbccdd")); //13824
console.log(permAlone("aaabbccefg")); //1146240
console.log(permAlone("aaabbbccdefg"));//127370880
console.log(permAlone("aaabbccddefg")); //158457600