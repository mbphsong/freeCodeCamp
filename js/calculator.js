$(document).ready(function dR() {
    var letterBuffer = "";
    var shiftPressed = false;
    var rT = "";
    var eString = "";
    var warn = "";
    
    const CALCULATOR = (function() {
        var numberBuffer = "";
        var currTotal = "";
        var lastResult = 0;
        var equationString = "";
        var currOperation = getResult(0);
        var lastOperand = [];
        var lastConstant = "";
        var degRad = "degrees";
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
            "sin<sup>-1</sup>(": {
                op: function() {
                    return getTrig("arcsine");
                },
                priority: 15,
            },
            "cos<sup>-1</sup>(": {
                op: function() {
                    return getTrig("arccosine");
                },
                priority: 15,
            },
            "tan<sup>-1</sup>(": {
                op: function() {
                    return getTrig("arctangent");
                },
                priority: 15,
            },
            "log<sub>10</sub>(": {
                op: function() {
                    return getLog(10);
                },
                priority: 15,
            },
            "ln(": {
                op: function() {
                    return getLog("e");
                },
                priority: 15,
            },
            "log<sub>2</sub>(": {
                op: function() {
                    return getLog(2);
                },
                priority: 15,
            },
            "!": {
                op: function(val) {
                    return function getFact() {
                        return FACTORIAL(val);
                    }
                },
                priority: 10,
            },
            "e^(": {
                op: function() {
                    return getPower(Math.E);
                },
                priority: 15,
            },
            "10^(": {
                op: function() {
                    return getPower(10);
                },
                priority: 15,
            },
            "2^(": {
                op: function() {
                    return getPower(2);
                },
                priority: 15,
            },
            "&radic;(": {
                op: getSqRt,
                priority: 15,
            },
            "<sup>2</sup>": {
                op: getSquare,
                priority: 3,
            },
        };
        const NUM_CONSTANTS = {
            PI: {
                val: function() {
                    return Math.PI;
                },
                string: "&pi;",
            },
            e: {
                val: function() {
                    return Math.E;
                },
                string: "e",
            },
            Ans: {
                val: function() {
                    return lastResult;
                },
                string: "Ans",
            },
        };
        const REQ_OP_AFTER = new Set(["!", 
        "<sup>2</sup>"]);
        const FACTORIAL = (function() {
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
    
            return factorial;
        })();
        const PEEK = function(arr) {
            return arr[arr.length - 1];
        };
        const numberWithCommas = function(x) {
            //separate integer from decimal
            var splits = x.toString().split(".");
            //add commas to integer
            splits[0] = splits[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            //join back together
            return  splits.join(".");
        }

        const RUN_ORDER = (function() {
            var calcVal = "";
            var lastVal = "";
            var totalString = "";
            var opStack = [stackItem("start",0)];
            var tempStack = [];
            const PREC_LIM = Math.pow(10,10);
            
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
                   
                    value = fixFloat(thisOp.op(value,degRad));

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

            function isTrig(str) {
                return /cos|tan|sin/.test(str);
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
                                strings: setRunData(totalString + numberWithCommas(addin)),
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
                                totalString = dropLast(totalString,lastVal);
                                if (lastOperand.length == 1 && PEEK(lastOperand) == ")") {
                                    //can't undo only remaining item, so clear it out
                                    lastOperand = [];
                                }
                            } else {
                                numberBuffer = "";
                                
                                totalString = dropLast(totalString,lastVal);
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
                        if (thisOp) {
                            //only if not undefined (doesn't exist on empty parens at beginning of eS)
                            calcVal = thisOp.storedVal;
                        }
                        totalString = dropLast(totalString,calcVal + "");
                        numberBuffer = totalString != "" ? "op" : "";
                    }
                    //make sure we don't have the placeholder in totalString
                    totalString = totalString.replace("0start","");
                    return {
                        strings: setRunData(totalString + numberWithCommas(calcVal)),
                        stack: stack,
                        stacks: stacks,
                    };
                } else {
                    return {
                        string: setRunData(totalString),
                        stacks: {},
                    }
                }
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
                //have constant
                if (NUM_CONSTANTS[input]) {
                    numberBuffer = "constant";
                    lastConstant = input;
                    //clear totalString if after equals
                    if (PEEK(lastOperand) == "=") {
                        //fill lastResult
                        lastResult = totalString;
                        totalString = "";
                    }
                    return setRunData(totalString + NUM_CONSTANTS[input].string,NUM_CONSTANTS[input].string);
                }
                //check for missing numbers, div by 0
                if (numberBuffer == " " && !isParens(input)) {
                    return setRunData(totalString,"","Number required to run operation");
                }
                if (numberBuffer == "-") {
                    return setRunData(totalString,"","Number required to run operation");
                }
                if (numberBuffer === "0" || (numberBuffer == "constant" && lastConstant == "Ans" && lastResult == 0)) {
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
                        //fill lastResult (strip commas so will calculate)
                        lastResult = totalString.replace(",","");
                        //clear total string
                        totalString = "";
                        //clear lastOperand - can't undo past the equals!
                        lastOperand = [];
                        //add to stack
                        calcVal = numberBuffer != "" && numberBuffer != "op" ? numberBuffer : calcVal;
                        if (numberBuffer == "constant") {
                            calcVal = NUM_CONSTANTS[lastConstant].val();
                        }
                        if (isParens(input)) {
                            if (numberBuffer != "" && numberBuffer != " ") {
                                //opening parenthesis after number - assume multiplication intended
                                runOrderOps("*");
                                //now run with input again
                                runOrderOps(input);
                                return setRunData(totalString, "*" + input);
                            } else {
                                //opening parenthesis after equals - assume intended to start over
                                calcVal = "";
                            }
                        }
                        lastVal = calcVal;
                        checkStack(input,opStack,calcVal);
                        if (REQ_OP_AFTER.has(input)) {
                            //only operates on the number it receives, so need an operand after
                            numberBuffer = "op";
                        } else {
                            //clear buffer for next one
                            numberBuffer = "";
                        }
                    //opening parenthesis right after number
                    } else if (numberBuffer != "" && numberBuffer != " " && isParens(input) && !isParens(PEEK(lastOperand))) {
                        //opening parenthesis right after number - assume multiplication intended
                        runOrderOps("*");
                        //now run with input again
                        runOrderOps(input);
                        return setRunData(totalString, "*" + input);
                    //regular
                    } else {
                        //set values for stack calculation
                        if (numberBuffer == "op") {
                            //undid op or factorial; use last calcVal
                            calcVal = calcVal;
                        } else {
                            if (numberBuffer == "" && !isParens(input)) {
                                // if is opening parens, don't want to add random other numbers; 
                                //otherwise, use calcVal - must have backspaced operand and then entered new one
                                calcVal = calcVal;
                            } else {
                                if (numberBuffer == "constant") {
                                    calcVal = NUM_CONSTANTS[lastConstant].val();
                                } else {

                                    calcVal = numberBuffer;
                                }
                            }
                        } 
                        lastVal = calcVal;
                        //add lastOperand to val returned to ES if isParens
                        if (isParens(input)) {
                            //since would have removed lastOperand from ES under assumption switching
                            if (lastOperand.length > 0) {
                                //but not if equation began with parenthesis!
                                returnES = PEEK(lastOperand) + returnES;
                            }
                            if (calcVal == " ") {
                                //check for deleted number before parens
                                calcVal = "";
                            }
                        }
                        
                        if (hasParens(opStack)) {
                            //have parenthesis
                            if (input == "=") {
                                //didn't add closing parenthesis - run first and then run again with equals
                                runOrderOps(")");
                                var result = runOrderOps("=");
                                return setRunData(result.tS,")" + result.addES);
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
                                var buffer = numberWithCommas(numberBuffer);
                                if (PEEK(lastOperand) == ")") {
                                    //we don't want to officially add the previous closing parens since it will be done next loop, but we do need it to show up!
                                    //also don't want numberBuffer on there since it is just for calculation next time
                                    endParen = ")";
                                    buffer = "";
                                } 
                                return setRunData(totalString + buffer,endParen,"Closing parenthesis without opening parenthesis"); 
                            }
                            checkStack(input,opStack,calcVal);
                            if (REQ_OP_AFTER.has(input)) {
                                //only operates on the number it receives, so need an operand after
                                numberBuffer = "op";
                            } else {
                                //clear numberBuffer for next entry
                                numberBuffer = "";
                            }
                        }
                    }
                    //update totalString - no equals sign at end
                    totalString += input == "=" ? numberWithCommas(calcVal) : numberWithCommas(calcVal) + input;
                //switching operation
                } else {
                    //switching operation
                    if (lastOperand.length > 0) {
                        //make sure we aren't trying to perform an operation with no numbers available!
                        if (!hasParens(opStack) && input == ")") {
                            //make sure we aren't trying to "change" to an end parenthesis with no open parenthesis in our stack
                            return setRunData(totalString,"","Closing parenthesis without opening parenthesis");
                        } else {
                            var thisRes = undoOp(input);
                            if (thisRes) {
                                //warning sent back
                                return thisRes;
                            }
                        }
                    } else {
                        if (totalString == "" && input == "=") {
                            //if we pressed equals with a blank string, ignore it
                            return setRunData(totalString,"","");
                        } else {
                            return setRunData(totalString,"","Must have number to perform operation");
                        }
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
                    storedVal: numberWithCommas(storeVal),
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
                if (newPriority > oldPriority) {
                    //redo any calcs that should be done, add this calc to stack
                    checkStack(input,result.stack,lastVal);
                    //update total string for any calculations redone - include lastOperand in case there are two instances of lastVal (ie, 3-3 - replaces first instead of last)
                    totalString = totalString.replace(oldOperand + lastVal,oldOperand + calcVal);
                    totalString += numberWithCommas(lastVal) + input;
                } else {
                    //lower priority - check for any calcs that should be run
                    if (newPriority < oldPriority) {
                        checkStack(input,result.stack,lastVal);
                    } else {
                        //same priority - just add op to stack
                        checkStack(input,result.stack,lastVal);
                    }
                    //update totalString
                    totalString += input == "=" ? numberWithCommas(calcVal) : numberWithCommas(calcVal) + input;
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
            if (numberBuffer.match(/op|constant/)) {
                return setData(currTotal,equationString,"Operand required");
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
            if ((numberBuffer.match(/\.{1}/g) || []).length > 1) {
                //make sure don't end up with multiple decimals
                numberBuffer = dropLast(numberBuffer);
            }
            return setData(equationString == "" ? filterBuffer(numberBuffer) : currTotal + filterBuffer(numberBuffer),equationString + filterBuffer(numberBuffer));
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
                        return setData(currTotal + filterBuffer(numberBuffer), equationString + filterBuffer(numberBuffer), result.warning);
                }
                //continuation after equals - but skip if we've added a constant
                if (peeked == "=" && !tempBuffer.match(/op|constant/)) {
                    //have number after equals
                    if (tempBuffer != "") {
                        equationString = filterBuffer(tempBuffer);
                        equationString += result.addES;
                        //have operand after equals
                    } else {
                        if (input == "=") {
                            //send clear-all - assume this is intended if second enter
                            return calculate("AC");
                        } else {
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
                                equationString += filterBuffer(tempBuffer);
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
            } else if (NUM_CONSTANTS[input]) {
                if (numberBuffer != "") {
                    //assume multiplication, run with this first
                    var firstResult = calculate("*");
                    if (firstResult.warning != "") {
                        return setData(currTotal + filterBuffer(numberBuffer), equationString + filterBuffer(numberBuffer), firstResult.warning);
                    }
                }
                bufferNumbers(input);
                //go ahead and send constant through
                var result = RUN_ORDER.run(input);
                if (result.warning != "") {
                    return setData(currTotal + filterBuffer(numberBuffer), equationString + filterBuffer(numberBuffer), result.warning);
                }
                equationString += result.addES;
                currTotal = result.tS;
                return setData(currTotal,equationString, result.warning);
                
            } else if (/^[0-9.]+?$/.test(input)) {
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
                    if (numberBuffer != "" && !numberBuffer.match(/op| |constant/)) {
                        numberBuffer = dropLast(numberBuffer);
                        if (numberBuffer == "") {
                            numberBuffer = " ";
                        }
                    } else {
                        if (numberBuffer == "constant") {
                            //remove constant
                            numberBuffer = " ";
                            currTotal = dropLast(currTotal,lastConstant);
                            equationString = dropLast(equationString,lastConstant);
                            lastConstant = "";
                        } else if (lastOperand.length > 0) {
                            equationString = dropLast(equationString,PEEK(lastOperand));
                            result = RUN_ORDER.undo(input);
                            currTotal = result.tS;
                            equationString += result.addES;
                        }
                        return setData(currTotal.replace("0start",""),equationString, result.warning);
                    }
                    break;
                    case "AC":
                    clearAll();
                    break;
                    case "CE":
                    clearNumberBuffer();
                    break;
                    case "degrees":
                    case "radians":
                    degRad = input;
                    break;
                    default:
                    break;
                }
                
                return setData(equationString == "" ? filterBuffer(numberBuffer) : currTotal + filterBuffer(numberBuffer),equationString + filterBuffer(numberBuffer), result.warning);
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
            //force coercion if number sent through instead of string - otherwise length property won't work and it won't get dropped!
            operand = operand != undefined ? numberWithCommas(operand) : operand;
            var numChars = operand == undefined ? 1 : operand.length;
            
            if (operand != undefined) {
                if (string.slice(-1 * numChars) != operand) {
                    return string;
                }
            }
            return string.substring(0, string.length - numChars);
        }
        
        function filterBuffer(str) {
            //remove placeholders that are purely for purposes of validation
            str = str.replace(/constant| |op/,"");
            //format w/commas
            return numberWithCommas(str);
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

        function getLog(base) {
            switch (base) {
                case 10:
                    return function calcbase10Log(arg) {
                        return Math.log10(arg);
                    }
                    break;
                case 2:
                    return function calcBase2Log(arg) {
                        return Math.log2(arg);
                    }
                    break;
                case "e":
                    return function calcLn(arg) {
                        return Math.log(arg);
                    }
                    break;
                default:
                    return function altBase(arg) {
                        return Math.log(arg) / Math.log(base);
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

        function getSquare() {
            return function squared(val) {
                return Math.pow(val,2);
            }
        }

        function getSqRt() {
            return function calcSqRt(val) {
                return Math.sqrt(val);
            };
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
                    return function getSine(val,type) {
                        val = type == "degrees" ? degToRad(val) : val;
                        return Math.sin(val);
                    }
                    break;
                    case "cosine":
                    return function getCosine(val,type) {
                        val = type == "degrees" ? degToRad(val) : val;
                        return Math.cos(val);
                    }
                    break;
                    case "tangent":
                    return function getTangent(val,type) {
                        val = type == "degrees" ? degToRad(val) : val;
                        return Math.tan(val);
                    }
                    break;
                case "arcsine":
                    return function getArcsine(val,type) {
                        var calced = Math.asin(val);
                        return type == "degrees" ? radToDeg(calced) : calced;
                    }
                    break;
                    case "arccosine":
                    return function getArccosine(val,type) {
                        var calced = Math.acos(val);
                        return type == "degrees" ? radToDeg(calced) : calced;
                    }
                    break;
                    case "arctangent":
                    return function getArctangent(val,type) {
                        var calced = Math.atan(val);
                        return type == "degrees" ? radToDeg(calced) : calced;
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
            dropLast: dropLast,
        }
    })();

    function updateDisplay() {
        var endRem = "";
        var openPar = (rT.match(/\({1}/g) || []).length;
        var closedPar = (rT.match(/\){1}/g) || []).length;
        for (var  i=1; i<=openPar - closedPar; i++) {
            endRem += ")";
        }

        $(".eS").html(eString + letterBuffer);
        $(".tS").html(rT + letterBuffer);
        $(".end-reminder").html(endRem);
        $(".warn").html(warn);
    }

    function bufferLetters(ltr) {
        const ltrMap = {
            "sin": "19-9-14",
            "cos": "3-15-19",
            "tan": "20-1-14",
            "asin": "1-19-9-14",
            "acos": "1-3-15-19",
            "atan": "1-20-1-14",
            "arcsin": "1-19-9-14",
            "arccos": "1-3-15-19",
            "arctan": "1-20-1-14",
            "ln": "12-14",
            "logten": "12-15-7-10",
            "logtwo": "12-15-7-2",
            "ans": "1-14-19",
            "e": "e",
            "pi": "16-9",
            "rad": "rad",
            "deg": "deg",
        };
        letterBuffer += ltr.toLowerCase();
        if (ltrMap[letterBuffer]) {
            //have a valid operand
            updateDisplay();
            $(".kC_" + ltrMap[letterBuffer]).click();
        } else {
            //update display w/new letter
            updateDisplay();
        }
    }

    function setClicks() {
        $(".calcButton").on("click", function bC(e) {
            letterBuffer = "";
            console.log(e.target.className);
            var result = CALCULATOR.calculate($(e.target).attr("data-calc"));
            eString = result.string;
            rT = result.runningTotal;
            warn = result.warning;
            updateDisplay();
        });
        //tie keyboard to calculator buttons
        $(document).on("keydown keyup", function kC(e) {
            var kC = (e.which) ? e.which : e.keyCode;
            //keep from sending the last button clicked if "enter"
            e.preventDefault();
            const shiftMap = {
                "m49": "5-24-3",
                "m54": "5-24-16",
                "m56": "42",
                "m57": "16-1-18",
                "m48": "5-14-4",
                "m187": "43",
            };
            console.log(kC);
            if (kC == 16) {
                //shift key
                shiftPressed = e.type == "keydown";
            } else {
                if (shiftPressed) {
                    //if we have a map item for this key when combined with shift, assign that
                    kC = shiftMap["m" + kC] || kC;
                }
                if (e.type == "keydown") {
                    //don't want to run twice!
                    warn = "";

                    if (65 <= kC && kC <= 90) {
                        //letter
                        bufferLetters(String.fromCharCode(kC));
                    } else if (kC == 8 && letterBuffer != "") {
                        //backspace with letterBuffer - remove letters
                        letterBuffer = CALCULATOR.dropLast(letterBuffer);
                        updateDisplay();
                    } else {
                        //not a letter, so trigger click if button exists
                        $(".kC_" + kC).click();
                    } 
                }
                //mimic click
                $(".kC_" + kC).toggleClass("active",e.type == "keydown");
                if (e.type == "keyup" && shiftMap["m" + kC]) {
                    //make sure we don't get stuck if shift comes up first
                    $(".kC_" + shiftMap["m" + kC]).toggleClass("active",e.type == "keydown");
                }
                 
            }
        });
        //catch "click" on short press
        $(".calcButton").on("touchstart touchend", function tC(e) {
            $(e.target).toggleClass("active",e.type == "touchstart");
        });
        //toggle deg/rad buttons
        $(".toggle").on("click", function togC(e) {
            if (!e.target.classList.contains("pushed")) {
                $(".toggle").toggleClass("pushed");
            }
        });
    }
    
    function unitTests() {
        var firstTest = [
            [4, "4", "4", ""],
            ["-", "4-", "4-", ""],
            ["1", "4-1", "4-1", ""],
            [".", "4-1.", "4-1.", ""],
            [3, "4-1.3", "4-1.3", ""],
            ["-", "2.7-", "4-1.3-", ""],
            ["7", "2.7-7", "4-1.3-7", ""],
            //test warning for unmatched parenthesis
            [")", "2.7-7", "4-1.3-7", "Closing parenthesis without opening parenthesis"],
            ["(", "2.7-7*(", "4-1.3-7*(", ""],
            ["backspace", "2.7-7*", "4-1.3-7*", ""],
            ["backspace", "2.7-7", "4-1.3-7", ""],
            ["backspace", "2.7-7", "4-1.3-7", ""],
            [6, "2.7-7", "4-1.3-7", "Operand required"],
            ["/", "2.7-7/", "4-1.3-7/", ""],
            ["(", "2.7-7/(", "4-1.3-7/(", ""],
            ["3", "2.7-7/(3", "4-1.3-7/(3", ""],
            ["+", "2.7-7/(3+", "4-1.3-7/(3+", ""],
            ["1", "2.7-7/(3+1", "4-1.3-7/(3+1", ""],
            ["1", "2.7-7/(3+11", "4-1.3-7/(3+11", ""],
            ["(", "2.7-7/(3+11*(", "4-1.3-7/(3+11*(", ""],
            ["5", "2.7-7/(3+11*(5", "4-1.3-7/(3+11*(5", ""],
            ["/", "2.7-7/(3+11*(5/", "4-1.3-7/(3+11*(5/", ""],
            ["2", "2.7-7/(3+11*(5/2", "4-1.3-7/(3+11*(5/2", ""],
            [")", "2.7-7/(3+11*(2.5)", "4-1.3-7/(3+11*(5/2)", ""],
            [")", "2.7-7/(30.5)", "4-1.3-7/(3+11*(5/2))", ""],
            ["backspace", "2.7-7/(3+11*(2.5)", "4-1.3-7/(3+11*(5/2)", ""],
            //make sure can't undo second closed parens      
            ["backspace", "2.7-7/(3+11*(2.5)", "4-1.3-7/(3+11*(5/2)", ""],
            ["-", "2.7-7/(30.5-", "4-1.3-7/(3+11*(5/2)-", ""],
            ["9", "2.7-7/(30.5-9", "4-1.3-7/(3+11*(5/2)-9", ""],
            [")", "2.7-7/(21.5)", "4-1.3-7/(3+11*(5/2)-9)", ""],
            ["backspace", "2.7-7/(30.5-9", "4-1.3-7/(3+11*(5/2)-9", ""],
            ["-", "2.7-7/(21.5-", "4-1.3-7/(3+11*(5/2)-9-", ""],
            [")", "2.7-7/(21.5)", "4-1.3-7/(3+11*(5/2)-9)", ""],
            ["4", "2.7-7/(21.5)", "4-1.3-7/(3+11*(5/2)-9)", "Must have operand between closing parenthesis and number"],
            ["*", "2.7-0.3255813953*", "4-1.3-7/(3+11*(5/2)-9)*", ""],
            ["*", "2.7-0.3255813953*", "4-1.3-7/(3+11*(5/2)-9)*", ""],
            ["-", "2.7-0.3255813953*-", "4-1.3-7/(3+11*(5/2)-9)*-", ""],
            //intend for this to remove the `-` and `*`, then put `-` in place of the `*`       
            ["backspace", "2.7-0.3255813953*", "4-1.3-7/(3+11*(5/2)-9)*", ""],
            ["backspace", "2.7-0.3255813953", "4-1.3-7/(3+11*(5/2)-9)", ""],
            ["-", "2.3744186047-", "4-1.3-7/(3+11*(5/2)-9)-", ""],
            //then change back to `*` and add `-3` to strings
            ["*", "2.7-0.3255813953*", "4-1.3-7/(3+11*(5/2)-9)*", ""],
            //test "changing op" unmatched parens error
            [")", "2.7-0.3255813953*", "4-1.3-7/(3+11*(5/2)-9)*", "Closing parenthesis without opening parenthesis"],
            ["-", "2.7-0.3255813953*-", "4-1.3-7/(3+11*(5/2)-9)*-", ""],
            ["3", "2.7-0.3255813953*-3", "4-1.3-7/(3+11*(5/2)-9)*-3", ""],
            ["3", "2.7-0.3255813953*-33", "4-1.3-7/(3+11*(5/2)-9)*-33", ""],
            ["=", "13.4441860449", "4-1.3-7/(3+11*(5/2)-9)*-33=", ""],
            ["AC", "", "", ""],
        ];
        var div0Test = [
            [5, "5", "5", ""],
            ["/", "5/", "5/", ""],
            ["0", "5/0", "5/0", ""],
            ["+", "5/0", "5/0", "Cannot divide by 0"],
            ["4", "5/04", "5/04", ""],
            ["-", "1.25-", "5/04-", ""],
            ["1", "1.25-1", "5/04-1", ""],
            ["=", "0.25", "5/04-1=", ""],
            ["AC", "", "", ""],
        ];
        var neg1stTest = [
            //test negative first number
            ["-", "-", "-", ""],
            ["3", "-3", "-3", ""],
            ["0", "-30", "-30", ""],
            ["+", "-30+", "-30+", ""],
            ["(", "-30+(", "-30+(", ""],
            //test negative beginning of parenthesis section
            ["-", "-30+(-", "-30+(-", ""],
            ["4", "-30+(-4", "-30+(-4", ""],
            ["-", "-30+(-4-", "-30+(-4-", ""],
            ["1", "-30+(-4-1", "-30+(-4-1", ""],
            [")", "-30+(-5)", "-30+(-4-1)", ""],
            ["=", "-35", "-30+(-4-1)=", ""],
            ["AC", "", "", ""],
        ];
        var openOperandTest = [
            //test opening operand
            ["/", "", "", "Must have number to perform operation"],
            ["4", "4", "4", ""],
            ["-", "4-", "4-", ""],
            ["1", "4-1", "4-1", ""],
            ["-", "3-", "4-1-", ""],
            ["7", "3-7", "4-1-7", ""],
            ["backspace", "3-", "4-1-", ""],
            //no calculation if numberBuffer is " "       
            ["/", "3-", "4-1-", "Number required to run operation"],
            ["7", "3-7", "4-1-7", ""],
            ["/", "3-7/", "4-1-7/", ""],
            ["*", "3-7*", "4-1-7*", ""],
            ["+", "-4+", "4-1-7+", ""],
            ["*", "3-7*", "4-1-7*", ""],
            ["6", "3-7*6", "4-1-7*6", ""],
            [".", "3-7*6.", "4-1-7*6.", ""],
            //test no double decimal        
            [".", "3-7*6.", "4-1-7*6.", ""],
            //test no trailing decimal      
            ["-", "-39-", "4-1-7*6-", ""],
            ["3", "-39-3", "4-1-7*6-3", ""],
            ["-", "-42-", "4-1-7*6-3-", ""],
            ["7", "-42-7", "4-1-7*6-3-7", ""],
            [")", "-42-7", "4-1-7*6-3-7", "Closing parenthesis without opening parenthesis"],
            [")", "-42-7", "4-1-7*6-3-7", "Closing parenthesis without opening parenthesis"],
            ["=", "-49", "4-1-7*6-3-7=", ""],
            //test number after equals        
            ["5", "5", "5", ""],
            ["3", "53", "53", ""],
            ["backspace", "5", "5", ""],
            ["^", "5^", "5^", ""],
            ["2", "5^2", "5^2", ""],
            ["2", "5^22", "5^22", ""],
            //test CE      
            ["CE", "5^", "5^", ""],
            ["3", "5^3", "5^3", ""],
            ["AC", "", "", ""],
            ["3", "3", "3", ""],
            ["/", "3/", "3/", ""],
            ["8", "3/8", "3/8", ""],
            ["=", "0.375", "3/8=", ""],
            //test operand after equals
            ["+", "0.375+", "0.375+", ""],
            ["1", "0.375+1", "0.375+1", ""],
            ["=", "1.375", "0.375+1=", ""],
            //test backspace after operand after equals
            ["+", "1.375+", "1.375+", ""],
            ["backspace", "1.375", "1.375", ""],
            ["-", "1.375-", "1.375-", ""],
            ["1", "1.375-1", "1.375-1", ""],
            ["=", "0.375", "1.375-1=", ""],
            ["=", "", "", ""],
            //second backspace test
            ["sin(", "sin(", "sin(", ""],
            ["9", "sin(9", "sin(9", ""],
            ["0", "sin(90", "sin(90", ""],
            [")", "sin(90)", "sin(90)", ""],
            ["=", "1", "sin(90)=", ""],
            ["*", "1*", "1*", ""],
            ["sin(", "1*sin(", "1*sin(", ""],
            ["backspace", "1*", "1*", ""],
            ["backspace", "1", "1", ""],
            ["backspace", "1", "1", ""],
            ["+", "1+", "1+", ""],
            ["2", "1+2", "1+2", ""],
            ["=", "3", "1+2=", ""],
            // parens after number after equals
            ["2", "2", "2", ""],
            ["(", "2*(", "2*(", ""],
            ["3", "2*(3", "2*(3", ""],
            ["/", "2*(3/", "2*(3/", ""],
            ["5", "2*(3/5", "2*(3/5", ""],
            [")", "2*(0.6)", "2*(3/5)", ""],
            ["=", "1.2", "2*(3/5)=", ""],
            //parens after deleted number after equals
            ["2", "2", "2", ""],
            ["backspace", "", "", ""],
            ["(", "(", "(", ""],
            ["3", "(3", "(3", ""],
            ["/", "(3/", "(3/", ""],
            ["5", "(3/5", "(3/5", ""],
            [")", "(0.6)", "(3/5)", ""],
            ["=", "0.6", "(3/5)=", ""],
            //parens after operand after equals
            ["/", "0.6/", "0.6/", ""],
            ["(", "0.6/(", "0.6/(", ""],
            ["5", "0.6/(5", "0.6/(5", ""],
            ["+", "0.6/(5+", "0.6/(5+", ""],
            ["5", "0.6/(5+5", "0.6/(5+5", ""],
            [")", "0.6/(10)", "0.6/(5+5)", ""],
            ["=", "0.06", "0.6/(5+5)=", ""],
            //backspace after operand after equals then operand
            ["*", "0.06*", "0.06*", ""],
            ["*", "0.06*", "0.06*", ""],
            ["backspace", "0.06", "0.06", ""],
            ["-", "0.06-", "0.06-", ""],
            ["AC", "", "", ""],
            //delete opening parens
            ["(", "(", "(", ""],
            ["backspace", "", "", ""],
            //prevent changing opening parens to non-parens operand
            ["(", "(", "(", ""],
            ["+", "(", "(", "Can't have two non-parenthetical operands in a row"],
            ["AC", "", "", ""],
            //test operand inside parens
            ["3", "3", "3", ""],
            ["(", "3*(", "3*(", ""],
            ["+", "3*(", "3*(", "Can't have two non-parenthetical operands in a row"],

            ["AC", "", "", ""],
        ];
        var trigTest = [
            ["sin(", "sin(", "sin(", ""],
            ["9", "sin(9", "sin(9", ""],
            ["0", "sin(90", "sin(90", ""],
            [")", "sin(90)", "sin(90)", ""],
            ["=", "1", "sin(90)=", ""],
            ["sin<sup>-1</sup>(", "sin<sup>-1</sup>(", "sin<sup>-1</sup>(", ""],
            ["1", "sin<sup>-1</sup>(1", "sin<sup>-1</sup>(1", ""],
            [")", "sin<sup>-1</sup>(1)", "sin<sup>-1</sup>(1)", ""],
            ["=", "90", "sin<sup>-1</sup>(1)=", ""],
            ["=", "", "", ""],
            ["cos(", "cos(", "cos(", ""],
            ["9", "cos(9", "cos(9", ""],
            ["0", "cos(90", "cos(90", ""],
            [")", "cos(90)", "cos(90)", ""],
            ["=", "0", "cos(90)=", ""],
            ["AC", "", "", ""],
            ["cos<sup>-1</sup>(", "cos<sup>-1</sup>(", "cos<sup>-1</sup>(", ""],
            ["0", "cos<sup>-1</sup>(0", "cos<sup>-1</sup>(0", ""],
            [")", "cos<sup>-1</sup>(0)", "cos<sup>-1</sup>(0)", ""],
            ["=", "90", "cos<sup>-1</sup>(0)=", ""],
            ["=", "", "", ""],
            ["tan(", "tan(", "tan(", ""],
            ["4", "tan(4", "tan(4", ""],
            ["5", "tan(45", "tan(45", ""],
            [")", "tan(45)", "tan(45)", ""],
            ["=", "1", "tan(45)=", ""],
            ["AC", "", "", ""],
            ["tan<sup>-1</sup>(", "tan<sup>-1</sup>(", "tan<sup>-1</sup>(", ""],
            ["1", "tan<sup>-1</sup>(1", "tan<sup>-1</sup>(1", ""],
            [")", "tan<sup>-1</sup>(1)", "tan<sup>-1</sup>(1)", ""],
            ["=", "45", "tan<sup>-1</sup>(1)=", ""],
            ["=", "", "", ""],
            ["sin<sup>-1</sup>(", "sin<sup>-1</sup>(", "sin<sup>-1</sup>(", ""],
            ["sin(", "sin<sup>-1</sup>(sin(", "sin<sup>-1</sup>(sin(", ""],
            ["3", "sin<sup>-1</sup>(sin(3", "sin<sup>-1</sup>(sin(3", ""],
            ["0", "sin<sup>-1</sup>(sin(30", "sin<sup>-1</sup>(sin(30", ""],
            [")", "sin<sup>-1</sup>(sin(30)", "sin<sup>-1</sup>(sin(30)", ""],
            [")", "sin<sup>-1</sup>(0.5)", "sin<sup>-1</sup>(sin(30))", ""],
            ["+", "30+", "sin<sup>-1</sup>(sin(30))+", ""],
            ["2", "30+2", "sin<sup>-1</sup>(sin(30))+2", ""],
            ["=", "32", "sin<sup>-1</sup>(sin(30))+2=", ""],
            ["AC", "", "", ""],
            //test operations inside parens        
            ["sin(", "sin(", "sin(", ""],
            ["3", "sin(3", "sin(3", ""],
            ["5", "sin(35", "sin(35", ""],
            ["+", "sin(35+", "sin(35+", ""],
            ["5", "sin(35+5", "sin(35+5", ""],
            ["5", "sin(35+55", "sin(35+55", ""],
            [")", "sin(90)", "sin(35+55)", ""],
            ["=", "1", "sin(35+55)=", ""],
            //test changing degRad
            ["AC", "", "", ""],
            ["sin(", "sin(", "sin(", ""],
            ["1.5", "sin(1.5", "sin(1.5", ""],
            ["708", "sin(1.5708", "sin(1.5708", ""],
            ["radians", "sin(1.5708", "sin(1.5708", ""],
            [")", "sin(1.5708)", "sin(1.5708)", ""],
            ["=", "1", "sin(1.5708)=", ""],
            ["sin<sup>-1</sup>(", "sin<sup>-1</sup>(", "sin<sup>-1</sup>(", ""],
            ["1", "sin<sup>-1</sup>(1", "sin<sup>-1</sup>(1", ""],
            [")", "sin<sup>-1</sup>(1)", "sin<sup>-1</sup>(1)", ""],
            ["degrees", "sin<sup>-1</sup>(1)", "sin<sup>-1</sup>(1)", ""],
            ["=", "90", "sin<sup>-1</sup>(1)=", ""],
            ["=", "", "", ""],
            //
            ["sin(", "sin(", "sin(", ""],
            ["9", "sin(9", "sin(9", ""],
            ["0", "sin(90", "sin(90", ""],
            [")", "sin(90)", "sin(90)", ""],
            ["=", "1", "sin(90)=", ""],
            ["*", "1*", "1*", ""],
            ["sin(", "1*sin(", "1*sin(", ""],
            ["backspace", "1*", "1*", ""],
            ["backspace", "1", "1", ""],
            ["+", "1+", "1+", ""],
            ["AC", "", "", ""],
        ];
        var constantsTest = [
            //test pi opening
            ["PI", "&pi;", "&pi;", ""],
            ["-", "3.1415926536-", "&pi;-", ""],
            ["2", "3.1415926536-2", "&pi;-2", ""],
            ["=", "1.1415926536", "&pi;-2=", ""],
            //test pi w/no operand after equals - treat like number    
            ["PI", "&pi;", "&pi;", ""],
            ["+", "3.1415926536+", "&pi;+", ""],
            ["1", "3.1415926536+1", "&pi;+1", ""],
            ["-", "4.1415926536-", "&pi;+1-", ""],
            [".1415926536", "4.1415926536-.1415926536", "&pi;+1-.1415926536", ""],
            ["+", "4+", "&pi;+1-.1415926536+", ""],
            ["1", "4+1", "&pi;+1-.1415926536+1", ""],
            //pi after number w/no operand between
            ["PI", "4+1*&pi;", "&pi;+1-.1415926536+1*&pi;", ""],
            ["=", "7.1415926536", "&pi;+1-.1415926536+1*&pi;=", ""],
            ["AC", "", "", ""],
            //pi after operand
            ["5", "5", "5", ""],
            ["/", "5/", "5/", ""],
            ["PI", "5/&pi;", "5/&pi;", ""],
            ["+", "1.5915494309+", "5/&pi;+", ""],
            ["2", "1.5915494309+2", "5/&pi;+2", ""],
            ["=", "3.5915494309", "5/&pi;+2=", ""],
            //test e
            ["5", "5", "5", ""],
            ["/", "5/", "5/", ""],
            ["e", "5/e", "5/e", ""],
            ["+", "1.8393972059+", "5/e+", ""],
            ["2", "1.8393972059+2", "5/e+2", ""],
            ["=", "3.8393972059", "5/e+2=", ""],
            ["AC", "", "", ""],
        ];
        var logsTest = [
            //test log base 10
            ["log<sub>10</sub>(", "log<sub>10</sub>(", "log<sub>10</sub>(", ""],
            ["1", "log<sub>10</sub>(1", "log<sub>10</sub>(1", ""],
            ["0", "log<sub>10</sub>(10", "log<sub>10</sub>(10", ""],
            ["0", "log<sub>10</sub>(100", "log<sub>10</sub>(100", ""],
            [")", "log<sub>10</sub>(100)", "log<sub>10</sub>(100)", ""],
            ["=", "2", "log<sub>10</sub>(100)=", ""],
            //test 10 pow
            ["10^(", "10^(", "10^(", ""],
            ["Ans", "10^(Ans", "10^(Ans", ""],
            [")", "10^(2)", "10^(Ans)", ""],
            ["=", "100", "10^(Ans)=", ""],

            //test log base 2     
            ["3", "3", "3", ""],
            ["+", "3+", "3+", ""],
            ["log<sub>2</sub>(", "3+log<sub>2</sub>(", "3+log<sub>2</sub>(", ""],
            ["1", "3+log<sub>2</sub>(1", "3+log<sub>2</sub>(1", ""],
            ["6", "3+log<sub>2</sub>(16", "3+log<sub>2</sub>(16", ""],
            ["/", "3+log<sub>2</sub>(16/", "3+log<sub>2</sub>(16/", ""],
            ["2", "3+log<sub>2</sub>(16/2", "3+log<sub>2</sub>(16/2", ""],
            [")", "3+log<sub>2</sub>(8)", "3+log<sub>2</sub>(16/2)", ""],
            ["*", "3+3*", "3+log<sub>2</sub>(16/2)*", ""],
            //test backspace        
            ["backspace", "3+3", "3+log<sub>2</sub>(16/2)", ""],
            ["backspace", "3+3", "3+log<sub>2</sub>(16/2)", ""],
            ["*", "3+3*", "3+log<sub>2</sub>(16/2)*", ""],
            ["5", "3+3*5", "3+log<sub>2</sub>(16/2)*5", ""],
            ["=", "18", "3+log<sub>2</sub>(16/2)*5=", ""],
            ["=", "", "", ""],
            //test 2 pow
            ["2^(", "2^(", "2^(", ""],
            ["4", "2^(4", "2^(4", ""],
            [")", "2^(4)", "2^(4)", ""],
            ["=", "16", "2^(4)=", ""],
            ["=", "", "", ""],
            //test ln
            ["ln(", "ln(", "ln(", ""],
            ["e", "ln(e", "ln(e", ""],
            [")", "ln(2.7182818285)", "ln(e)", ""],
            ["=", "1", "ln(e)=", ""],
            //test e^x
            ["e^(", "e^(", "e^(", ""],
            ["2", "e^(2", "e^(2", ""],
            [")", "e^(2)", "e^(2)", ""],
            ["=", "7.3890560989", "e^(2)=", ""],
            ["ln(", "ln(", "ln(", ""],
            ["Ans", "ln(Ans", "ln(Ans", ""],
            [")", "ln(7.3890560989)", "ln(Ans)", ""],
            ["=", "2", "ln(Ans)=", ""],
            ["AC", "", "", ""],
        ];
        var factorialTest = [
            //basic test
            ["5", "5", "5", ""],
            ["!", "5!", "5!", ""],
            ["=", "120", "5!=", ""],
            ["AC", "", "", ""],
            //test no number after
            ["5", "5", "5", ""],
            ["!", "5!", "5!", ""],
            ["3", "5!", "5!", "Operand required"],
            ["*", "120*", "5!*", ""],
            //test after end parenthesis
            ["(", "120*(", "5!*(", ""],
            ["3", "120*(3", "5!*(3", ""],
            ["+", "120*(3+", "5!*(3+", ""],
            ["1", "120*(3+1", "5!*(3+1", ""],
            [")", "120*(4)", "5!*(3+1)", ""],
            ["!", "120*4!", "5!*(3+1)!", ""],
            ["=", "2,880", "5!*(3+1)!=", ""],
            ["AC", "", "", ""],
        ];
        var ansTest = [
            ["3", "3", "3", ""],
            ["+", "3+", "3+", ""],
            ["2", "3+2", "3+2", ""],
            ["=", "5", "3+2=", ""],
            ["1", "1", "1", ""],
            ["0", "10", "10", ""],
            ["/", "10/", "10/", ""],
            ["Ans", "10/Ans", "10/Ans", ""],
            ["+", "2+", "10/Ans+", ""],
            ["2", "2+2", "10/Ans+2", ""],
            ["=", "4", "10/Ans+2=", ""],
            //test divide by 0
            ["-", "4-", "4-", ""],
            ["4", "4-4", "4-4", ""],
            ["=", "0", "4-4=", ""],
            ["3", "3", "3", ""],
            ["/", "3/", "3/", ""],
            ["Ans", "3/Ans", "3/Ans", ""],
            ["+", "3/Ans", "3/Ans", "Cannot divide by 0"],
            ["backspace", "3/", "3/", ""],
            ["1", "3/1", "3/1", ""],
            ["=", "3", "3/1=", ""],
            //test operand after =       
            ["*", "3*", "3*", ""],
            ["2", "3*2", "3*2", ""],
            ["+", "6+", "3*2+", ""],
            //test letters w/numbers      
            ["hi2", "6+", "3*2+", ""],
            ["2hi", "6+", "3*2+", ""],
            ["h2hi", "6+", "3*2+", ""],
            //test multi-digit numbers      
            ["32", "6+32", "3*2+32", ""],
            ["AC", "", "", ""],
        ];
        var miscTest = [
            //can't do operand after negative w/no digits
            ["2", "2", "2", ""],
            ["+", "2+", "2+", ""],
            ["-", "2+-", "2+-", ""],
            ["/", "2+-", "2+-", "Number required to run operation"],
            ["AC", "", "", ""],
            ["ln(", "ln(", "ln(", ""],
            [")", "ln(", "ln(", "Can't have two non-parenthetical operands in a row"],
            ["AC", "", "", ""],
            //test parenthesis as exponent
            ["2", "2", "2", ""],
            ["^", "2^", "2^", ""],
                //test backspace first operand
            ["backspace", "2", "2", ""],
            ["backspace", "2", "2", ""],
            ["^", "2^", "2^", ""],
            ["(", "2^(", "2^(", ""],
            ["3", "2^(3", "2^(3", ""],
            ["+", "2^(3+", "2^(3+", ""],
                //test backspace first operand inside parens
            ["backspace", "2^(3", "2^(3", ""],
            ["backspace", "2^(3", "2^(3", ""],
            ["+", "2^(3+", "2^(3+", ""],
            ["2", "2^(3+2", "2^(3+2", ""],
            [")", "2^(5)", "2^(3+2)", ""],
            ["=", "32", "2^(3+2)=", ""],
            //test squared
            ["<sup>2</sup>", "32<sup>2</sup>", "32<sup>2</sup>", ""],
            ["=", "1,024", "32<sup>2</sup>=", ""],
            //test square root
            ["&radic;(", "&radic;(", "&radic;(", ""],
            ["Ans", "&radic;(Ans", "&radic;(Ans", ""],
            [")", "&radic;(1,024)", "&radic;(Ans)", ""],
            ["=", "32", "&radic;(Ans)=", ""],
            ["AC", "", "", ""],
            //test no second decimal in string
            ["6", "6", "6", ""],
            [".", "6.", "6.", ""],
            [".", "6.", "6.", ""],
            ["3", "6.3", "6.3", ""],
            [".", "6.3", "6.3", ""],
            ["AC", "", "", ""],
            //test opening equals do nothing
            ["=", "", "", ""],
            //test equals when missing end parens
            ["(", "(", "(", ""],
            ["(", "((", "((", ""],
            ["(", "(((", "(((", ""],
            ["3", "(((3", "(((3", ""],
            ["=", "3", "(((3)))=", ""],
            //test formatting w/commas for > 999
            ["1", "1", "1", ""],
            ["1", "11", "11", ""],
            ["0", "110", "110", ""],
            ["0", "1,100", "1,100", ""],
            ["+", "1,100+", "1,100+", ""],
            ["3", "1,100+3", "1,100+3", ""],
            ["-", "1,103-", "1,100+3-", ""],
            ["*", "1,100+3*", "1,100+3*", ""],
            ["9", "1,100+3*9", "1,100+3*9", ""],
            ["9", "1,100+3*99", "1,100+3*99", ""],
            ["9", "1,100+3*999", "1,100+3*999", ""],
            ["/", "1,100+2,997/", "1,100+3*999/", ""],
            ["^", "1,100+3*999^", "1,100+3*999^", ""],
            ["+", "4,097+", "1,100+3*999+", ""],
            ["(", "4,097+(", "1,100+3*999+(", ""],
            ["4", "4,097+(4", "1,100+3*999+(4", ""],
            ["*", "4,097+(4*", "1,100+3*999+(4*", ""],
            ["1", "4,097+(4*1", "1,100+3*999+(4*1", ""],
            ["1", "4,097+(4*11", "1,100+3*999+(4*11", ""],
            ["3", "4,097+(4*113", "1,100+3*999+(4*113", ""],
            ["3", "4,097+(4*1,133", "1,100+3*999+(4*1,133", ""],
            [")", "4,097+(4,532)", "1,100+3*999+(4*1,133)", ""],
            ["AC", "", "", ""],
        ];
        function runTests(name, testArr) {
            for (var i = 0; i < testArr.length; i++) {
                var subArr = testArr[i];
                var result = CALCULATOR.calculate(subArr[0]);
                if (result.runningTotal != subArr[1]) {
                    console.log(name, subArr[0], "tS", subArr[1], result.runningTotal);
                    // console.log(subArr[1].length,":"+result.runningTotal+ ":")
                }
                if (result.string != subArr[2]) {
                    console.log(name, subArr[0], "eS", subArr[2], result.string);
                    // console.log(subArr[2].length,":"+result.string+ ":")
                }
                if (result.warning != subArr[3]) {
                    console.log(name, subArr[0], "warn", subArr[3], result.warning);
                }
            }
        }
        runTests("first", firstTest);
        runTests("div0", div0Test);
        runTests("neg1st", neg1stTest);
        runTests("openOperand", openOperandTest);
        runTests("trig", trigTest);
        runTests("constants", constantsTest);
        runTests("log", logsTest);
        runTests("factorial", factorialTest);
        runTests("Ans", ansTest);
        runTests("Misc",miscTest);
    }
    
    setClicks();
    // unitTests();
});
