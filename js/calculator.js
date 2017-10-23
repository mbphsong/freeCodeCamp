function runCalculator() {
    var calculator = (function() {
        var numberBuffer = "";
        var currTotal = 0;
        var equationString = "";
        var currOperation = getResult(0);
        var lastOperand = "";
        var operands = {
            "+": getSum,
            "-": getDifference,
            "*": getProduct,
            "/": getQuotient,
            "=": getResult,
            "^": getPower,
        };

        function calculate(input) {
            if (operands[input]) {
                if (numberBuffer != "" || lastOperand == "=") {
                    currTotal = currOperation(numberBuffer);
                    if (lastOperand == "=") {
                        equationString = currTotal;
                    } else {
                        if (numberBuffer[numberBuffer.length-1] == ".") {
                            //make sure no hanging decimal
                            numberBuffer = dropLast(numberBuffer);
                        }
                        equationString += numberBuffer;
                    }
                    numberBuffer = "";
                }
                lastOperand = input;
                currOperation = operands[input](currTotal);
                return setData(currTotal, equationString + input);
            } else if (/[0-9.]/.test(input)) {
                //have a number - add to buffer
                if (numberBuffer == "") {
                    if (lastOperand != "=") {
                        //new number, go ahead and officially add lastOperand to string
                        equationString += lastOperand;
                    } else {
                        //hit "equals" and then entered a number rather than operand - start new equation
                        equationString = "";
                    }
                }
                numberBuffer = numberBuffer.replace(" ","");
                numberBuffer += input;
                if (numberBuffer.substr(numberBuffer.length-2) == "..") {//make sure don't end up with multiple decimals
                    numberBuffer = dropLast(numberBuffer);
                }

                return setData(equationString == "" ? numberBuffer : currTotal,equationString + numberBuffer);
            } else {
                switch (input) {
                    case "backspace":
                        numberBuffer = dropLast(numberBuffer);
                        break;
                    case "AC":
                        clearAll();
                        break;
                    case "CE":
                        clearNumberBuffer();
                        break;
                    default:
                        break;
                }
                return setData(equationString == "" ? numberBuffer : currTotal,equationString + numberBuffer);
            }
        }
        
        function clearAll() {
            numberBuffer = "";
            equationString = "";
            currTotal = 0;
            lastOperand = "";
            currOperation = getResult(0);
        }
        
        function clearNumberBuffer() {
            numberBuffer = " ";
        }
        
        function dropLast(string) {
            return string.substring(0, string.length - 1);
        }

        function getDifference(minuend) {
            var args = [].slice.call(arguments);
            if (args.length == 2) {
                return minuend - args[1];
            } else {
                return function subtractEm(subtrahend) {
                    return minuend - subtrahend;
                }
            }
        }

        function getPower(base) {
            var args = [].slice.call(arguments);
            if (args.length == 2) {
                return Math.pow(base,args[1]);
            } else {
                return function exponential(exponent) {
                    return Math.pow(base,exponent);
                }
            }
        }

        function getProduct(multiplicand) {
            var args = [].slice.call(arguments);
            if (args.length == 2) {
                return multiplicand * args[1];
            } else {
                return function multiplyEm(multiplier) {
                    return multiplicand * multiplier;
                }
            }
        }

        function getQuotient(dividend) {
            var args = [].slice.call(arguments);
            if (args.length == 2) {
                return dividend / args[1];
            } else {
                return function divideEm(divisor) {
                    return dividend / divisor;
                }
            }
        }

        function getResult(result) {
            return function continueOrNot(val) {
                if (val == "") {
                    //user hit another operand - return previous result for currTotal
                    return result;
                } else {
                    //user entered a new number, so starting new calculation
                    return val;
                }
            }
        }

        function getSum(augend) {
            var args = [].slice.call(arguments);
            //`+` will not convert strings to number, so multiply by 1 to ensure correct type
            augend *= 1;
            if (args.length == 2) {
                return augend + args[1] * 1;
            } else {
                return function addEm(addend) {
                    return augend + addend * 1;
                }
            }
        }

        function setData(number, string) {
            return {
                runningTotal: number,
                string: string,
            }
        }

        return {
            calculate: calculate,
        }
    })();

    console.log(calculator.calculate(4));
    console.log(calculator.calculate("+"));
    console.log(calculator.calculate("5"));
    console.log(calculator.calculate("."));
    console.log(calculator.calculate("6"));
    console.log(calculator.calculate("-"));
    console.log(calculator.calculate("3"));
    console.log(calculator.calculate("-"));
    console.log(calculator.calculate("*"));
    console.log(calculator.calculate("8"));
    console.log(calculator.calculate("="));
    // console.log(calculator.calculate("-"));
    console.log(calculator.calculate("5"));
    console.log(calculator.calculate("3"));
    console.log(calculator.calculate("backspace"));
    console.log(calculator.calculate("^"));
    console.log(calculator.calculate("2"));
    console.log(calculator.calculate("2"));
    console.log(calculator.calculate("CE"));
    console.log(calculator.calculate("3"));
    console.log(calculator.calculate("+"));
    console.log(calculator.calculate("AC"));
    console.log(calculator.calculate("3"));
    console.log(calculator.calculate("/"));
    console.log(calculator.calculate("8"));
    console.log(calculator.calculate("="));
}

runCalculator();

//in the "keydown" click event, test if e.keyCode == 8, send "backspace" instead of String.fromCharCode(e.keyCode)