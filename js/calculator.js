function runCalculator() {
    const CALCULATOR = (function() {
        var numberBuffer = "";
        var currTotal = "";
        
        var equationString = "";
        var currOperation = getResult(0);
        var lastOperand = [];
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
            },
            "endParens": {
                op: getResult,
                priority: 10,
            },
            ")": {
                op: getResult,
                priority: 0,
            },
            "(": {
                op: getResult,
                priority: 15,
            },
            "sin(": {
                op: function() {
                    return getTrig("sine");
                },
                priority: 15,
            },
            "cos(": {
                op: function() {
                    return getTrig("cosine");
                },
                priority: 15,
            },
            "tan(": {
                op: function() {
                    return getTrig("tangent");
                },
                priority: 15,
            },
            "sin-1(": {
                op: function() {
                    return getTrig("arcsine");
                },
                priority: 15,
            },
            "cos-1(": {
                op: function() {
                    return getTrig("arccosine");
                },
                priority: 15,
            },
            "tan-1(": {
                op: function() {
                    return getTrig("arctangent");
                },
                priority: 15,
            },

        };
        const NUM_OPERANDS = {
            PI: {
                val: Math.PI,
                string: "&pi;",
            },
            e: {
                val: Math.e,
                string: "e",
            },
        };
        const PEEK = function(arr) {
            return arr[arr.length - 1];
        };

        const RUN_ORDER = (function() {
            var calcVal = "";
            var lastVal = "";
            var totalString = "";
            var opStack = [stackItem("start",0)];
            var tempStack = [];
            const PREC_LIM = Math.pow(10,14);
            
            function checkEndParen(input,stacks) {
                if (input == ")") {
                    //do end parens stuff
                    //store our starting parenthesis for next calculation - make it able to update totalString properly
                    var parOp = PEEK(stacks.parent);
                    parOp.parens = PEEK(stacks.parent).operand;
                    //update parens op in parentStack so it can calculate/return when next operand is called
                    parOp.operand = "endParens";
                    parOp.storedVal = calcVal;
                    parOp.lastVal = lastVal;
                    //update for next operand
                    numberBuffer = "op";
                }
                else {
                    //clear numberBuffer for next entry
                    numberBuffer = "";
                }
            }

            function checkStack(input,stack,value) {
                //calculate items in stack until current operation has greater priority
                while (stack.length > 0 && OPERANDS[PEEK(stack).operand].priority >= OPERANDS[input].priority) {
                    var thisOp = stack.pop();
                    //update value for next operation (or to store in stack for this one)
                   
                    value = fixFloat(thisOp.op(value));

                    //put in tempStack so we can "undo" if operand is changed to something w/ higher priority
                    tempStack.push(thisOp);
                    //figure out how much we are replacing since parenthesis are...different
                    
                    var replaceVal = thisOp.operand == "endParens" ? thisOp.parens + thisOp.storedVal + ")" : thisOp.storedVal + thisOp.operand;
                    totalString = dropLast(totalString,replaceVal);
                }
                //put new operation into stack
                stack.push(stackItem(input, value));
                calcVal = value;
            }

            function clearOps() {
                opStack = [stackItem("start",0)];
                totalString = "";
            }
    
            function clearTemp() {
                tempStack = [];
            }

            function findLast(parentStack) {
                var nestedStack = PEEK(parentStack).parens;
                while(hasParens(nestedStack)) {
                    // console.log(nestedStack);
                    parentStack = nestedStack;
                    nestedStack = PEEK(parentStack).parens;
                }

                return {
                    parent: parentStack,
                    nested: nestedStack,
                }
            }

            function fixFloat(value) {
                return Math.round(value*PREC_LIM)/PREC_LIM;
            }

            function hasParens(stack) {
                var testOp = PEEK(stack);
                return testOp == undefined ? false : isParens(testOp.operand);
            }

            function isParens(string) {
                return /\(/.test(string);
            }
            
            function removeOperand(input) {
                //remove last operand, no replacement at this point
                if (lastOperand.length > 0) {
                    var lastOp = lastOperand.pop();
                    var thisOp;
                    var stack;
                    var stacks = {};
                    totalString = dropLast(totalString, lastOp);
                    if (hasParens(opStack)) {
                        stacks = findLast(opStack);
                        if (isParens(lastOp)) {
                            //simply remove the last item on the parent stack since no operations should have been run
                            stacks.parent.pop();
                        } else {
                            //remove operand
                            stack = stacks.nested;
                        }
                    } else {
                        stack = opStack;
                        stacks.parent = opStack;
                    }
                    if (!isParens(lastOp)) {
                        thisOp = stack.pop();
                        if (lastOp == ")") {
                            var peeked = tempStack[0] || {};
                            var addin = "";
                            var resetEndParen = false;
                            if (peeked.operand == "endParens") {
                                peeked.operand = peeked.parens;
                                resetEndParen = true;
                                addin = ")";
                                //do not have tempStack for previous endParens; cannot undo, so clear lastOperand
                                lastOperand = [];
                            } 
                            //reset parent object
                            thisOp.operand = thisOp.parens;
                            thisOp.parens = [];
                            //put back in parent stack
                            stack.push(thisOp);
                            stack = thisOp.parens;
                            stack.push(stackItem("start",0));
                            //reset
                            resetOps(stack,thisOp.storedVal);
                            totalString += addin;
                            if (resetEndParen) {
                                PEEK(stack).operand = "endParens";
                                calcVal = PEEK(stack).storedVal;
                                addin = "";
                            } else {
                                calcVal = thisOp.lastVal;
                                addin = calcVal;
                            }
                            return {
                                strings: setRunData(totalString + addin),
                                stack: stack,
                                stacks: stacks,
                            };
                        } else if (lastOperand.length > 0) {
                            //previous operand was endParen; can't undo
                            if (tempStack.length > 0 && tempStack[0].operand == "endParens") {

                                clearTemp();
                                //adjust lastVal so it sends the correct thing through for this case
                                lastVal = calcVal;
                                numberBuffer = "";
                                totalString = dropLast(totalString,lastVal + "");
                            } else {
                                numberBuffer = "";
                                
                                totalString = dropLast(totalString,lastVal + "");
                                resetOps(stack,thisOp.storedVal);
                            }
                            // lastOperand = [];
                            //since not running resetOps, need to drop here
                        } else {
                            resetOps(stack,thisOp.storedVal);
                        }
                    }

                    if (lastOperand.length == 0) {
                        //removed last one - fill calcVal w/storedVal so we have something for next operand
                        calcVal = thisOp.storedVal;
                        totalString = dropLast(totalString,calcVal);
                        numberBuffer = "op";
                    }
                }
                return {
                    strings: setRunData(totalString + calcVal),
                    stack: stack,
                    stacks: stacks,
                };
            }

            function resetOps(stack,oldVal) {
                var running = "";
                while (tempStack.length) {
                    var tempOp = tempStack.pop();
                    stack.push(tempOp);
                    if (isParens(tempOp.operand)) {
                        running += tempOp.operand + tempOp.storedVal;
                    } else {
                        running += tempOp.storedVal + tempOp.operand;
                    }
                    totalString = totalString.replace(oldVal,running);
                    oldVal = running;
                }
                // totalString += lastVal;
            }
            
            function runOrderOps(input) {
                var returnES = input;
                if (numberBuffer == " ") {
                    return setRunData(totalString,"","Number required to run operation");
                }
                if (numberBuffer === "0") {
                    if (opStack.length > 0 && PEEK(opStack).operand == "/") {
                        return setRunData(totalString,"","Cannot divide by 0");
                    }
                }
                //have number or pushed operand after equals or parens
                if (numberBuffer != "" || PEEK(lastOperand) == "=" || PEEK(lastOperand) == ")" || isParens(input)) {
                    //reset tempStack so we only have this operation's calcs to "undo" if necessary
                    if (!isParens(input)) {
                        clearTemp();
                    }
                    //add to stack
                    if (PEEK(lastOperand) == "=") {
                        //clear total string
                        totalString = "";
                        //add to stack
                        calcVal = numberBuffer != "" ? numberBuffer : calcVal;
                        if (isParens(input)) {
                            //opening parenthesis - assume multiplication intended
                            runOrderOps("*");
                            //now run with input again
                            runOrderOps(input);
                            return setRunData(totalString, "*" + input);
                        }
                        checkStack(input,opStack,calcVal);
                        //clear buffer for next one
                        numberBuffer = "";
                    //opening parenthesis right after number
                    } else if (numberBuffer != "" && isParens(input) && !isParens(PEEK(lastOperand))) {
                        //opening parenthesis right after number - assume multiplication intended
                        runOrderOps("*");
                        //now run with input again
                        runOrderOps(input);
                        return setRunData(totalString, "*" + input);
                    //regular
                    } else {
                        //set values for stack calculation
                        
                        if (numberBuffer == "op") {
                            //undid op; use last calcVal
                            calcVal = calcVal;
                        } else {
                            if (numberBuffer == "" && !isParens(input)) {
                                // if is opening parens, don't want to add random other numbers; 
                                //otherwise, use calcVal - must have backspaced operand and then entered new one
                                calcVal = calcVal;
                            } else {
                                calcVal = numberBuffer;
                            }
                        } 
                        // calcVal = (numberBuffer == "op" || numberBuffer == " ") ? calcVal : numberBuffer;
                        lastVal = calcVal;
                        //add lastOperand to val returned to ES if isParens
                        if (isParens(input)) {
                            //since would have removed lastOperand from ES under assumption switching
                            if (lastOperand.length > 0) {
                                //but not if equation began with parenthesis!
                                returnES = PEEK(lastOperand) + returnES;
                            }
                        }
                        
                        if (hasParens(opStack)) {
                            //have parenthesis
                            if (input == "=") {
                                //didn't add closing parenthesis - run first and then run again with equals
                                runOrderOps(")");
                                return runOrderOps("=");
                            }
                            //find lowest level and operate there
                            var stacks = findLast(opStack);

                            if (stacks.nested.length == 0) {
                                //first item for this parenthesis
                                stacks.nested.push(stackItem("start",0));
                            }
                            checkStack(input,stacks.nested,calcVal);
                            checkEndParen(input,stacks);
                        } else {
                            //no parenthesis in stack - run checkStack on opStack
                            if (input == ")") {
                                //no opening parenthesis to match - do nothing
                                var endParen = "";
                                var buffer = numberBuffer;
                                if (PEEK(lastOperand) == ")") {
                                    //we don't want to officially add the previous closing parens since it will be done next loop, but we do need it to show up!
                                    //also don't want numberBuffer on there since it is just for calculation next time
                                    endParen = ")";
                                    buffer = "";
                                } 
                                return setRunData(totalString + buffer,endParen,"Closing parenthesis without opening parenthesis"); 
                            }
                            checkStack(input,opStack,calcVal);
                            //clear numberBuffer for next entry
                            numberBuffer = "";
                        }
                    }
                    //update totalString - no equals sign at end
                    totalString += input == "=" ? calcVal : calcVal + input;
                //switching operation
                } else {
                    //switching operation
                    if (lastOperand.length > 0) {
                        //make sure we aren't trying to perform an operation with no numbers available!
                        if (!hasParens(opStack) && input == ")") {
                            //make sure we aren't trying to "change" to an end parenthesis with no open parenthesis in our stack
                            return setRunData(totalString,"","Closing parenthesis without opening parenthesis");
                        } else {
                            undoOp(input);
                        }
                    } else {
                        return setRunData(totalString,"","Must have number to perform operation");
                    }
                }
                //cannot clear numberBuffer here - will mess up nested parenthesis!
                // numberBuffer = "";
                lastOperand.push(input);
                return setRunData(totalString,returnES); 
            }

            function setRunData(tS,addToES,warning) {
                addToES = addToES || "";
                warning = warning || "";
                return {
                    tS: tS,
                    addES: addToES,
                    warning: warning,
                }
            }

            function stackItem(operand,storeVal) {
                return {
                    operand: operand,
                    storedVal: storeVal,
                    op: OPERANDS[operand].op(storeVal),
                    parens: [],
                }
            }

            function undoOp(input) {
                if (input == "backspace") {
                   var result = removeOperand();
                   return result.strings;
                } 
                if (isParens(PEEK(lastOperand)) && !isParens(input)) {
                    //don't want to have two operands in a row, so we can't change the parenthesis to a different operand unless another parenthesis type - do nothing
                    return setRunData(totalString, PEEK(lastOperand), "Can't have two non-parenthetical operands in a row"); 
                }
                var oldOperand = PEEK(lastOperand);
                var newPriority = OPERANDS[input].priority;
                var oldPriority = OPERANDS[oldOperand].priority;
                //pop last operation, update strings
                var result = removeOperand(input);
                //clear out the blank "start" in case we didn't make it back...
                totalString = totalString.replace("0start","");
                if (newPriority > oldPriority) {
                    //redo any calcs that should be done, add this calc to stack
                    checkStack(input,result.stack,lastVal);
                    //update total string for any calculations redone - include lastOperand in case there are two instances of lastVal (ie, 3-3 - replaces first instead of last)
                    totalString = totalString.replace(oldOperand + lastVal,oldOperand + calcVal);
                    totalString += lastVal + input;
                } else {
                    //lower priority - check for any calcs that should be run
                    if (newPriority < oldPriority) {
                        checkStack(input,result.stack,lastVal);
                    } else {
                        //same priority - just add op to stack
                        checkStack(input,result.stack,lastVal);
                    }
                    //update totalString
                    totalString += input == "=" ? calcVal : calcVal + input;
                }
                checkEndParen(input,result.stacks);
                //removeOperand's buffer is removed in checkEndParen if not
                //endParen - if endParen, set to "op", so don't change here!
                // numberBuffer = "";
            }

            return {
                run: runOrderOps,
                clearOps: clearOps,
                clearTemp: clearTemp,
                undo: undoOp,
            }
        })();

        function bufferNumbers(input) {
            if (numberBuffer == "op") {
                return setData(currTotal,equationString);
            }
            if (numberBuffer == "") {
                if (PEEK(lastOperand) != "="  && lastOperand.length > 0) {
                    //new number, clear lastOperand 
                    //unless it is negative, in which case we want to let user backspace
                    //out if intent was to change to minus
                    if (input != "-") {
                        lastOperand = [];
                    }
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
            return setData(equationString == "" ? numberBuffer : currTotal + numberBuffer,equationString + numberBuffer);
        }
        function calculate(input) {
            if (OPERANDS[input]) {
                var tempBuffer = numberBuffer;
                var peeked = PEEK(lastOperand);
                //negative number
                if (numberBuffer == "" && input == "-" && PEEK(lastOperand) != ")" && PEEK(lastOperand) != "=") {
                    //negative number - empty buffer, not following endParens or equals
                    return bufferNumbers(input);
                }
                //make sure no hanging decimal
                if (numberBuffer[numberBuffer.length-1] == ".") {
                    numberBuffer = dropLast(numberBuffer);
                    tempBuffer = numberBuffer;
                }                        
                var result = RUN_ORDER.run(input);
                //have warning - return without updating
                if (result.warning != "") {
                        return setData(currTotal + numberBuffer, equationString + numberBuffer, result.warning);
                }
                //continuation after equals
                if (peeked == "=") {
                    //have number after equals
                    if (tempBuffer != "") {
                        equationString = tempBuffer;
                        equationString += result.addES;
                        //have operand after equals
                    } else {
                        if (input == "=") {
                            //send clear-all - assume this is intended if second enter
                            return calculate("AC");
                        }else {
                            equationString = result.tS;
                        }
                    }
                    currTotal = result.tS;
                    return setData(currTotal,equationString, result.warning);
                } else {

                    if (tempBuffer != "") {
                        //regular

                        if (peeked != ")") {
                            //officially add numberBuffer to equationString
                            //but only if we didn't just close a parenthesis since end parenthesis puts its calculated value in numberBuffer
                                equationString += tempBuffer.replace("op","");
                        }
                    } else {
                        if (lastOperand.length > 0 && peeked != ")") {
                            //assume changing operand; remove last one
                            equationString = dropLast(equationString,peeked);
                        }
                    }
                }
                equationString += result.addES;
                currTotal = result.tS;
                return setData(currTotal,equationString, result.warning);
            } else if (/[0-9.]/.test(input)) {
                if (PEEK(lastOperand) == ")") {
                    //no operand selected after closing parenthesis - do nothing
                    return setData(currTotal,equationString,"Must have operand between closing parenthesis and number"); 
                }
                //have a number - add to buffer
               return bufferNumbers(input);
            } else {
                var result = {};
                switch (input) {
                    case "backspace":
                        if (numberBuffer != "" && numberBuffer != "op" && numberBuffer != " ") {
                            numberBuffer = dropLast(numberBuffer);
                            if (numberBuffer == "") {
                                numberBuffer = " ";
                            }
                        } else {
                            if (lastOperand.length > 0) {
                                equationString = dropLast(equationString,PEEK(lastOperand));
                                result = RUN_ORDER.undo(input);
                                currTotal = result.tS;
                                equationString += result.addES;
                            }
                            return setData(currTotal,equationString, result.warning);
                        }
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
                return setData(equationString == "" ? numberBuffer : currTotal + numberBuffer,equationString + numberBuffer, result.warning);
            }
        }
        
        function clearAll() {
            numberBuffer = "";
            equationString = "";
            currTotal = "";
            lastOperand = [];
            RUN_ORDER.clearOps();
            RUN_ORDER.clearTemp();
        }
        
        function clearNumberBuffer() {
            numberBuffer = " ";
        }

        function dropLast(string,operand) {
            var numChars = operand == undefined ? 1 : operand.length;
            if (operand != undefined) {
                if (string.slice(-1 * numChars) != operand) {
                    return string;
                }
            }
            return string.substring(0, string.length - numChars);
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

        function getTrig(funcType) {
            function degToRad(degrees) {
                return (degrees * Math.PI / 180);
            }
            function radToDeg(radians) {
                return (radians * 180 / Math.PI);
            }
            switch (funcType) {
                case "sine":
                    return function getSine(degrees) {
                        return Math.sin(degToRad(degrees));
                    }
                    break;
                case "cosine":
                    return function getCosine(degrees) {
                        return Math.cos(degToRad(degrees));
                    }
                    break;
                case "tangent":
                    return function getTangent(degrees) {
                        return Math.tan(degToRad(degrees));
                    }
                    break;
                case "arcsine":
                    return function getArcsine(val) {
                        return radToDeg(Math.asin(val));
                    }
                    break;
                case "arccosine":
                    return function getArccosine(val) {
                        return radToDeg(Math.acos(val));
                    }
                    break;
                case "arctangent":
                    return function getArctangent(val) {
                        return radToDeg(Math.atan(val));
                    }
                    break;
                default:
                    return getResult();
                    break;
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

        

        function setData(number, string, warning) {
            warning = warning || "";
            return {
                runningTotal: number,
                string: string,
                warning: warning,
            }
        }

        return {
            calculate: calculate,
        }
    })();

    var firstTest = [
        [4,"4","4",""],
        ["-","4-","4-",""],
        ["1","4-1","4-1",""],
        [".","4-1.","4-1.",""],
        [3,"4-1.3","4-1.3",""],
        ["-","2.7-","4-1.3-",""],
        ["7","2.7-7","4-1.3-7",""],
        //test warning for unmatched parenthesis
        [")","2.7-7","4-1.3-7","Closing parenthesis without opening parenthesis"],
        ["(","2.7-7*(","4-1.3-7*(",""],
        ["backspace","2.7-7*","4-1.3-7*",""],        
        ["backspace","2.7-7","4-1.3-7",""],        
        ["backspace","2.7-7","4-1.3-7",""],        
        [6,"2.7-7","4-1.3-7",""],        
        ["/","2.7-7/","4-1.3-7/",""],        
        ["(","2.7-7/(","4-1.3-7/(",""],        
        ["3","2.7-7/(3","4-1.3-7/(3",""],        
        ["+","2.7-7/(3+","4-1.3-7/(3+",""],        
        ["1","2.7-7/(3+1","4-1.3-7/(3+1",""],        
        ["1","2.7-7/(3+11","4-1.3-7/(3+11",""],        
        ["(","2.7-7/(3+11*(","4-1.3-7/(3+11*(",""],        
        ["5","2.7-7/(3+11*(5","4-1.3-7/(3+11*(5",""],        
        ["/","2.7-7/(3+11*(5/","4-1.3-7/(3+11*(5/",""],        
        ["2","2.7-7/(3+11*(5/2","4-1.3-7/(3+11*(5/2",""],        
        [")","2.7-7/(3+11*(2.5)","4-1.3-7/(3+11*(5/2)",""],        
        [")","2.7-7/(30.5)","4-1.3-7/(3+11*(5/2))",""],        
        ["backspace","2.7-7/(3+11*(2.5)","4-1.3-7/(3+11*(5/2)",""],  
        //make sure can't undo second closed parens      
        ["backspace","2.7-7/(3+11*(2.5)","4-1.3-7/(3+11*(5/2)",""],        
        ["-","2.7-7/(30.5-","4-1.3-7/(3+11*(5/2)-",""],        
        ["9","2.7-7/(30.5-9","4-1.3-7/(3+11*(5/2)-9",""],        
        [")","2.7-7/(21.5)","4-1.3-7/(3+11*(5/2)-9)",""],        
        ["backspace","2.7-7/(30.5-9","4-1.3-7/(3+11*(5/2)-9",""],        
        ["-","2.7-7/(21.5-","4-1.3-7/(3+11*(5/2)-9-",""],        
        [")","2.7-7/(21.5)","4-1.3-7/(3+11*(5/2)-9)",""],        
        ["4","2.7-7/(21.5)","4-1.3-7/(3+11*(5/2)-9)","Must have operand between closing parenthesis and number"],        
        ["*","2.7-0.32558139534884*","4-1.3-7/(3+11*(5/2)-9)*",""],        
        ["*","2.7-0.32558139534884*","4-1.3-7/(3+11*(5/2)-9)*",""],        
        ["-","2.7-0.32558139534884*-","4-1.3-7/(3+11*(5/2)-9)*-",""], 
        //intend for this to remove the `-` and `*`, then put `-` in place of the `*`       
        ["backspace","2.7-0.32558139534884* ","4-1.3-7/(3+11*(5/2)-9)* ",""], 
        ["backspace","2.7-0.32558139534884","4-1.3-7/(3+11*(5/2)-9)",""], 
        ["-","2.37441860465116-","4-1.3-7/(3+11*(5/2)-9)-",""], 
        //then change back to `*` and add `-3` to strings
        ["*","2.7-0.32558139534884*","4-1.3-7/(3+11*(5/2)-9)*",""], 
        ["-","2.7-0.32558139534884*-","4-1.3-7/(3+11*(5/2)-9)*-",""], 
        //test "changing op" unmatched parens error
        [")","2.7-0.32558139534884*-","4-1.3-7/(3+11*(5/2)-9)*-","Closing parenthesis without opening parenthesis"],        
        ["3","2.7-0.32558139534884*-3","4-1.3-7/(3+11*(5/2)-9)*-3",""],        
        ["3","2.7-0.32558139534884*-33","4-1.3-7/(3+11*(5/2)-9)*-33",""],        
        ["=","13.44418604651172","4-1.3-7/(3+11*(5/2)-9)*-33=",""],        
        ["AC","","",""],        
    ]
    
    var div0Test = [
        [5,"5","5",""],
        ["/","5/","5/",""],
        ["0","5/0","5/0",""],
        ["+","5/0","5/0","Cannot divide by 0"],
        ["4","5/04","5/04",""],
        ["-","1.25-","5/04-",""],
        ["1","1.25-1","5/04-1",""],
        ["=","0.25","5/04-1=",""],
        ["AC","","",""],        
    ]
    
    var neg1stTest = [
        //test negative first number
        ["-","-","-",""],        
        ["3","-3","-3",""],        
        ["0","-30","-30",""],        
        ["+","-30+","-30+",""],        
        ["(","-30+(","-30+(",""], 
        //test negative beginning of parenthesis section
        ["-","-30+(-","-30+(-",""], 
        ["4","-30+(-4","-30+(-4",""], 
        ["-","-30+(-4-","-30+(-4-",""], 
        ["1","-30+(-4-1","-30+(-4-1",""], 
        [")","-30+(-5)","-30+(-4-1)",""], 
        ["=","-35","-30+(-4-1)=",""], 
        ["AC","","",""],        
    ]
    
    var openOperandTest = [
        //test opening operand
        ["/","","","Must have number to perform operation"],        
        ["4","4","4",""],        
        ["-","4-","4-",""],        
        ["1","4-1","4-1",""],        
        ["-","3-","4-1-",""],        
        ["7","3-7","4-1-7",""],        
        ["backspace","3- ","4-1- ",""], 
        //no calculation if numberBuffer is " "       
        ["/","3- ","4-1- ","Number required to run operation"],        
        ["7","3-7","4-1-7",""],        
        ["/","3-7/","4-1-7/",""],        
        ["*","3-7*","4-1-7*",""],        
        ["+","-4+","4-1-7+",""],        
        ["*","3-7*","4-1-7*",""],        
        ["6","3-7*6","4-1-7*6",""],        
        [".","3-7*6.","4-1-7*6.",""],
        //test no double decimal        
        [".","3-7*6.","4-1-7*6.",""],  
        //test no trailing decimal      
        ["-","-39-","4-1-7*6-",""],        
        ["3","-39-3","4-1-7*6-3",""],        
        ["-","-42-","4-1-7*6-3-",""],        
        ["7","-42-7","4-1-7*6-3-7",""],        
        [")","-42-7","4-1-7*6-3-7","Closing parenthesis without opening parenthesis"],        
        [")","-42-7","4-1-7*6-3-7","Closing parenthesis without opening parenthesis"],        
        ["=","-49","4-1-7*6-3-7=",""],
        //test number after equals        
        ["5","5","5",""],        
        ["3","53","53",""],        
        ["backspace","5","5",""],        
        ["^","5^","5^",""],        
        ["2","5^2","5^2",""],        
        ["2","5^22","5^22",""],  
        //test CE      
        ["CE","5^ ","5^ ",""],        
        ["3","5^3","5^3",""],        
        ["AC","","",""],        
        ["3","3","3",""],        
        ["/","3/","3/",""],        
        ["8","3/8","3/8",""],        
        ["=","0.375","3/8=",""],        
        //test operand after equals
        ["+","0.375+","0.375+",""],        
        ["1","0.375+1","0.375+1",""],        
        ["=","1.375","0.375+1=",""],        
        ["=","","",""],        
        ["AC","","",""],        
    ]
    
    var trigTest = [
        ["sin(","sin(","sin(",""],        
        ["9","sin(9","sin(9",""],        
        ["0","sin(90","sin(90",""],        
        [")","sin(90)","sin(90)",""],        
        ["=","1","sin(90)=",""],        
        ["sin-1(","1*sin-1(","1*sin-1(",""],        
        ["1","1*sin-1(1","1*sin-1(1",""],        
        [")","1*sin-1(1)","1*sin-1(1)",""],        
        ["=","90","1*sin-1(1)=",""],        
        ["=","","",""],        
        ["cos(","cos(","cos(",""],        
        ["9","cos(9","cos(9",""],        
        ["0","cos(90","cos(90",""],        
        [")","cos(90)","cos(90)",""],        
        ["=","0","cos(90)=",""],        
        ["AC","","",""],        
        ["cos-1(","cos-1(","cos-1(",""],        
        ["0","cos-1(0","cos-1(0",""],        
        [")","cos-1(0)","cos-1(0)",""],        
        ["=","90","cos-1(0)=",""],        
        ["=","","",""],        
        ["tan(","tan(","tan(",""],        
        ["4","tan(4","tan(4",""],        
        ["5","tan(45","tan(45",""],        
        [")","tan(45)","tan(45)",""],        
        ["=","1","tan(45)=",""],        
        ["AC","","",""],        
        ["tan-1(","tan-1(","tan-1(",""],        
        ["1","tan-1(1","tan-1(1",""],        
        [")","tan-1(1)","tan-1(1)",""],        
        ["=","45","tan-1(1)=",""],        
        ["=","","",""],        
        
        ["AC","","",""],        
    ]

    function runTests(name,testArr) {
        for (var i=0; i<testArr.length; i++) {
            var subArr = testArr[i];
            var result = CALCULATOR.calculate(subArr[0]);
            if (result.runningTotal != subArr[1]) {
                console.log(name,subArr[0],"tS",subArr[1], result.runningTotal);
            } 
            if(result.string != subArr[2]) {
                console.log(name,subArr[0],"eS",subArr[2], result.string);
            } 
            if(result.warning != subArr[3]) {
                console.log(name,subArr[0],"warn",subArr[3], result.warning);
           }
        }
    }

    runTests("first",firstTest);
    runTests("div0",div0Test);
    runTests("neg1st",neg1stTest);
    runTests("openOperand",openOperandTest);
    runTests("trig",trigTest);

    //test opening operand
}

runCalculator();

//in the "keydown" click event, test if e.keyCode == 8, send "backspace" instead of String.fromCharCode(e.keyCode)
// var key = e.keycode
// switch (key) {
//     case 8:
//         key = "backspace";
//         break;
//     case 13:
//         key = "=";
//         break;
//     default:
//         key = String.fromCharCode(key);
//         break;
// }
// CALCULATOR.calculate(key);