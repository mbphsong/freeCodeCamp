function runCalculator() {
    var calculator = (function() {
        var numberBuffer = "";
        var currTotal = 0;
        var equationString = "";
        var currOperation = function start(nB) {
            return nB;
        };
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
                            numberBuffer = numberBuffer.substring(0,numberBuffer.length-1);
                        }
                        equationString += numberBuffer;
                    }
                    numberBuffer = "";
                }
                lastOperand = input;
                currOperation = operands[input](currTotal);
                return {
                    runningTotal: currTotal,
                    string: equationString + input,
                };
            } else if (/[0-9.]/.test(input)) {
                if (numberBuffer == "") {
                    if (lastOperand != "=") {
                        equationString += lastOperand;
                    } else {
                        equationString = "";
                    }
                }
                numberBuffer += input;
                if (numberBuffer.substr(numberBuffer.length-2) == "..") {
                    //make sure don't end up with multiple decimals
                    numberBuffer = numberBuffer.substring(0,numberBuffer.length - 1);
                }

                return {
                    runningTotal: equationString == "" ? numberBuffer : currTotal,
                    string: equationString + numberBuffer,
                };
            }

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
    console.log(calculator.calculate("^"));
    // console.log(calculator.calculate("/"));
    console.log(calculator.calculate("2"));
    console.log(calculator.calculate("="));
}

runCalculator();