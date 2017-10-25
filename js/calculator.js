function runCalculator() {
    const CALCULATOR = (function() {
        var numberBuffer = "";
        var currTotal = 0;
        var totalString = "";
        var equationString = "";
        var currOperation = getResult(0);
        var lastOperand = "";
        const OPERANDS = {
            "+": { 
                op: getSum,
                priority: 1,
            },
            "-": {
                op: getDifference,
                   priority: 1,
            },
            "*": { 
                op: getProduct,
                priority: 2,
            },
            "/": { 
                op: getQuotient,
                priority: 2,
            },
            "=": {
                op: function (total) {
                    RUN_ORDER.clearTemp();
                    RUN_ORDER.clearOps();
                    return getResult(total);
                },
                priority: 0,
            },
            "^": {
                op: getPower,
                priority: 3,
            },
            "start": {
                op: getResult,
                priority: 10,
            }
        };

        const RUN_ORDER = (function() {
            var calcVal = "";
            var lastVal = "";
            var opStack = [["start",0,getResult(0),0]];
            var tempStack = [];
            const PREC_LIM = Math.pow(10,14);
            const PEEK = function(arr) {
                return arr[arr.length - 1];
            }

            function checkStack(input,stack,value) {
                //calculate items in stack until current operation has greater priority
                while (stack.length > 0 && OPERANDS[PEEK(stack)[0]].priority >= OPERANDS[input].priority) {
                    var thisOp = stack.pop();
                    //update calcVal for next operation (or to store in stack for this one)
                    value = fixFloat(thisOp[2](value));
                    //put in tempStack so we can "undo" if operand is changed to something w/ higher priority
                    tempStack.push(thisOp);
                    totalString = totalString.replace(thisOp[1] + thisOp[0],"");
                }
                //put new operation into stack
                stack.push([input, value, OPERANDS[input].op(value),lastVal]);
                calcVal = value;
            }

            function clearOps() {
                opStack = [["start",0,getResult(0)]];
            }
    
            function clearTemp() {
                tempStack = [];
            }

            function fixFloat(value) {
                return Math.round(value*PREC_LIM)/PREC_LIM;
            }

            function resetOps(oldVal) {
                var running = "";
                while (tempStack.length) {
                    var tempOp = tempStack.pop();
                    opStack.push(tempOp);
                    running +=tempOp[1] + tempOp[0]
                    totalString = totalString.replace(oldVal,running);
                    oldVal = running;
                }
                totalString += lastVal;
            }
            
            function runOrderOps(input) { 
                if (numberBuffer != "" || lastOperand == "=") {
                    //have number or pushed operand after equals - run calculations
                    tempStack = [];
                    if (lastOperand == "=") {
                        //add to stack
                        checkStack(input,opStack,calcVal);
                        //clear total string
                        totalString = "";
                        equationString = calcVal;
                    } else {
                        if (numberBuffer[numberBuffer.length-1] == ".") {
                            //make sure no hanging decimal
                            numberBuffer = dropLast(numberBuffer);
                        }
                        //officially add numberBuffer to equationString
                        equationString += numberBuffer;
                        //set values for stack calculation
                        calcVal = numberBuffer == "" ? 0 : numberBuffer;
                        lastVal = numberBuffer;
                        checkStack(input,opStack,calcVal);
                    }
                    //update totalString - no equals sign at end
                    totalString += input == "=" ? calcVal : calcVal + input;
                    //clear numberBuffer for next entry
                    numberBuffer = "";
                } else {
                    //switching operation
                    totalString = dropLast(totalString);
                    var oldOp = opStack.pop();
                    var newPriority = OPERANDS[input].priority;
                    var oldPriority = OPERANDS[oldOp[0]].priority
                    if (newPriority > oldPriority) {
                        //undo calcs that shouldn't have been done per order of operations
                        resetOps(oldOp[1]);
                        //redo any calcs that should be done, add this calc to stack
                        checkStack(input,opStack,lastVal);
                        //update total string for any calculations redone - include lastOperand in case there are two instances of lastVal (ie, 3-3 - replaces first instead of last)
                        totalString = totalString.replace(lastOperand + lastVal,lastOperand + calcVal);
                        // numberBuffer = lastVal;
                        totalString += input;
                    } else {
                        //get rid of number at the end of string
                        totalString = totalString.replace(lastVal,"");
                        //lower priority - check for any calcs that should be run
                        if (newPriority < oldPriority) {
                            console.log(opStack);
                            checkStack(input,opStack,lastVal);
                            //update totalString
                            totalString += input == "=" ? calcVal : calcVal + input;
                        } else {
                            //same priority - just add op to stack
                            checkStack(input,opStack,calcVal);
                            totalString += input;
                        }
                    }

                }
                lastOperand = input;

                return setData(totalString,equationString + input); 
            }
            return {
                run: runOrderOps,
                clearOps: clearOps,
                clearTemp: clearTemp,
            }
        })();

        function calculate(input) {
            if (OPERANDS[input]) {
                // if (numberBuffer != "" || lastOperand == "=") {
                //     currTotal = currOperation(numberBuffer);
                //     if (lastOperand == "=") {
                //         equationString = currTotal;
                //     } else {
                //         if (numberBuffer[numberBuffer.length-1] == ".") {
                //             //make sure no hanging decimal
                //             numberBuffer = dropLast(numberBuffer);
                //         }
                //         equationString += numberBuffer;
                //     }
                //     numberBuffer = "";
                // }
                // lastOperand = input;
                // currOperation = OPERANDS[input].op(currTotal);
                return RUN_ORDER.run(input);
                // return setData(currTotal, equationString + input);
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

                return setData(equationString == "" ? numberBuffer : totalString + numberBuffer,equationString + numberBuffer);
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
                return setData(equationString == "" ? numberBuffer : totalString + numberBuffer,equationString + numberBuffer);
            }
        }
        
        function clearAll() {
            numberBuffer = "";
            equationString = "";
            currTotal = 0;
            lastOperand = "";
            totalString = "";
            // currOperation = getResult(0);
            RUN_ORDER.clearOps();
            RUN_ORDER.clearTemp();
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

    console.log(CALCULATOR.calculate(4));
    console.log(CALCULATOR.calculate("-"));
    console.log(CALCULATOR.calculate(1));
    console.log(CALCULATOR.calculate("-"));
    console.log(CALCULATOR.calculate(7));
    console.log(CALCULATOR.calculate("*"));
    console.log(CALCULATOR.calculate(6));
    console.log(CALCULATOR.calculate(4));
    console.log(CALCULATOR.calculate("/"));
    console.log(CALCULATOR.calculate("^"));
    console.log(CALCULATOR.calculate("2"));
    // console.log(CALCULATOR.calculate("."));
    // console.log(CALCULATOR.calculate("6"));
    console.log(CALCULATOR.calculate("-"));
    console.log(CALCULATOR.calculate("*"));
    console.log(CALCULATOR.calculate("3"));
    console.log(CALCULATOR.calculate("-"));
    console.log(CALCULATOR.calculate("*"));
    console.log(CALCULATOR.calculate("8"));
    console.log(CALCULATOR.calculate("="));
    console.log(CALCULATOR.calculate("-"));
    console.log(CALCULATOR.calculate("5"));
    console.log(CALCULATOR.calculate("3"));
    console.log(CALCULATOR.calculate("backspace"));
    console.log(CALCULATOR.calculate("^"));
    console.log(CALCULATOR.calculate("2"));
    console.log(CALCULATOR.calculate("2"));
    console.log(CALCULATOR.calculate("CE"));
    console.log(CALCULATOR.calculate("3"));
    console.log(CALCULATOR.calculate("+"));
    console.log(CALCULATOR.calculate("AC"));
    console.log(CALCULATOR.calculate("3"));
    console.log(CALCULATOR.calculate("/"));
    console.log(CALCULATOR.calculate("8"));
    console.log(CALCULATOR.calculate("="));
}

runCalculator();
console.log(6.6-8)
//in the "keydown" click event, test if e.keyCode == 8, send "backspace" instead of String.fromCharCode(e.keyCode)