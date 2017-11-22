// $(document).ready(function dR() {
    var letterBuffer = "";
    var shiftPressed = false;
    var ctrlPressed = false;
    var rT = "";
    var eString = "";
    var warn = "";
    
    const CALCULATOR = (function() {
        var numberBuffer = "";
        var currTotal = "";
        var lastResult = 0;
        var equationString = "";
        var currOperation = getResult(0);
        var lastOperator = [];
        var lastConstant = "";
        var degRad = "degrees";
        const OPERATORS = {
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
            "<sup>2 </sup>": {
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
        const REQ_OP_AFTER = new Set(["!","<sup>2 </sup>",")"]);
        const FACTORIAL = (function() {
            var factorials = [1,1];
            var currProduct = 1;
            const PREC_LIM = Math.pow(10,10);
    
            function loopFactorial(value) {
                if (value < 1) {
                    return 1;
                }
                if (factorials[value] != undefined) {
                    return factorials[value];
                }
    
                factorials[value] = value * loopFactorial(value - 1);
                return factorials[value];
            }
            function factorial(value) {
                if (isNaN(value)) {
                    return NaN;
                }
                if ((parseInt(value) != value)) {
                    result = loopFactorial(value) * mockGamma(fixFloat(value % 1));
                    return result;
                }
                return loopFactorial(value);
            }

            function fixFloat(value) {
                var epsilon = (1/PREC_LIM)/10;
                var rounded = Math.round(value*PREC_LIM)/PREC_LIM;
                
                if (Math.abs(value - rounded) < epsilon) {
                    return rounded;
                } else {
                    return value;
                }
            }

            function mockGamma(fraction) {
                var exp = 1/fraction;
                if (Math.pow(1,exp) == Math.pow(-1,exp)) {
                    //even
                    console.log(Math.sqrt(Math.PI)*fraction);
                    return Math.sqrt(Math.PI)*fraction;
                } else {
                    //odd
                }
                return 1;
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
            var parenKeepVal = "";
            var totalString = "";
            var opStack = [stackItem("start",0)];
            var tempStack = [];
            const PREC_LIM = Math.pow(10,10);
            
            function checkEndParen(input,stacks) {
                if (input == ")") {
                    //do end parens stuff
                    //store our starting parenthesis for next calculation - make it able to update totalString properly
                    var parOp = PEEK(stacks.parent);
                    parOp.parens = PEEK(stacks.parent).operator;
                    //update parens op in parentStack so it can calculate/return when next operator is called
                    parOp.operator = "endParens";
                    parOp.storedVal = calcVal;
                    parOp.lastVal = lastVal;
                }
            }

            function checkStack(input,stack,value) {
                //calculate items in stack until current operation has greater priority
                while (stack.length > 0 && OPERATORS[PEEK(stack).operator].priority >= OPERATORS[input].priority) {
                    var thisOp = stack.pop();
                    var startingVal = value;
                    //update value for next operation (or to store in stack for this one)
                   
                    value = fixFloat(thisOp.op(value,degRad));
                    if (value !== value) {
                        //NaN
                        if (isLog(thisOp.parens) && startingVal < 0) {
                            return setRunData(totalString,"","Cannot take log of negative number");
                        }
                        if (thisOp.operator == "!" && !Number.isInteger(startingVal)) {
                            return setRunData(totalString,"","Cannot get factorial of non-integer");
                        }
                        return setRunData(totalString,"","Calculation error");
                    }
                    //put in tempStack so we can "undo" if operator is changed to something w/ higher priority
                    tempStack.push(thisOp);
                    //figure out how much we are replacing since parenthesis are...different
                    var replaceVal = thisOp.operator == "endParens" ? thisOp.parens + thisOp.storedVal + ")" : thisOp.storedVal + thisOp.operator;
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
                var epsilon = (1/PREC_LIM)/10;
                var rounded = Math.round(value*PREC_LIM)/PREC_LIM;
                
                if (Math.abs(value - rounded) < epsilon) {
                    return rounded;
                } else {
                    return value;
                }
            }
            function hasParens(stack) {
                var testOp = PEEK(stack);
                return testOp == undefined ? false : isParens(testOp.operator);
            }

            function isLog(operator) {
                if (typeof operator == "string") {
                    return /log|ln/.test(operator);
                } else {
                    return false;
                }
            }

            function isParens(string) {
                return /\(/.test(string);
            }
            
            function removeOperator(input) {
                //remove last operator, no replacement at this point
                if (lastOperator.length > 0) {
                    var lastOp = lastOperator.pop();
                    var penOp = PEEK(lastOperator);
                    var thisOp;
                    var stack;
                    var stacks = {};
                    var addES = "";
                    var lastRedoneOp = "";
                    totalString = dropLast(totalString, lastOp);
                    if (hasParens(opStack)) {
                        stacks = findLast(opStack);
                        if (isParens(lastOp)) {
                            //simply remove the last item on the parent stack since no operations should have been run
                            stacks.parent.pop();
                        } else {
                            //remove operator
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
                            if (peeked.operator == "endParens") {
                                peeked.operator = peeked.parens;
                                resetEndParen = true;
                                addin = ")";
                                //do not have tempStack for previous endParens; cannot undo, so clear 
                                lastOperator = [];
                            }
                            //reset parent object - allow for possibility of "unable to undo" endParens
                            thisOp.operator = isParens(thisOp.parens) ? thisOp.parens : thisOp.operator;
                            thisOp.parens = [];
                            //put back in parent stack
                            stack.push(thisOp);
                            stack = thisOp.parens;
                            stack.push(stackItem("start",0));
                            //reset
                            lastRedoneOp = resetOps(stack,thisOp.storedVal);
                            totalString += addin;
                            if (resetEndParen) {
                                PEEK(stack).operator = "endParens";
                                calcVal = PEEK(stack).storedVal;
                                addin = "";
                            } else if (thisOp.lastVal != undefined) {
                                calcVal = thisOp.lastVal;
                                addin = calcVal;
                            } else {
                                //can't undo the endparens; maintain old calcVal
                                addin = calcVal;
                                addES = ")";
                                stack = stacks.nested || stacks.parent;
                            }
                            
                            addin = addin == undefined ? "" : numberWithCommas(addin);
                            return {
                                strings: setRunData(totalString + addin,addES),
                                stack: stack,
                                stacks: stacks,
                            };
                        } else if (lastOperator.length > 0) {
                            //previous operator was endParen; can't undo
                            if (tempStack.length > 0 && tempStack[0].operator == "endParens") {
                                clearTemp();
                                //adjust lastVal so it sends the correct thing through for this case
                                lastVal = calcVal;
                                numberBuffer = "";
                                totalString = dropLast(totalString,lastVal);
                                if (lastOperator.length == 1 && penOp == ")") {
                                    //can't undo only remaining item, so clear it out
                                    lastOperator = [];
                                }
                            } else {
                                numberBuffer = "";
                                lastRedoneOp = resetOps(stack,thisOp.storedVal);
                            }
                            //since not running resetOps, need to drop here
                        } else {
                            lastRedoneOp = resetOps(stack,thisOp.storedVal);
                        }
                    } else {
                        //removed parens - set lastVal to our lastVal before the parenthesis
                        //otherwise we use any calculated value before the parenthesis
                        lastVal = parenKeepVal;
                    }
                    if (lastOperator.length == 0 || REQ_OP_AFTER.has(penOp)) {
                        //removed last one - fill calcVal w/storedVal so we have something for next operator
                        if (thisOp) {
                            //only if not undefined (doesn't exist on empty parens at beginning of eS)
                            // if we have a lastVal, use it - otherwise, storedVal

                            calcVal = lastVal == "" ? thisOp.storedVal : lastVal;
                        } else {
                            lastVal = parenKeepVal;
                        }
                        totalString = dropLast(totalString,calcVal);
                        numberBuffer = totalString != "" ? "op" : "";
                        if (REQ_OP_AFTER.has(lastOp) || REQ_OP_AFTER.has(penOp)) {
                            //make sure we set numberBuffer b/c for this we don't care what totalString is
                            numberBuffer = "op";
                        }
                    }
                    // make sure we don't have the placeholder in totalString
                    totalString = totalString.replace("0start","");
                    var showVal;
                    //in case of req_op_after penOp that is no longer in lastOperator, get returned value from lastRedoneOp and fill in penOp
                    penOp = penOp != undefined ? penOp : lastRedoneOp;
                    if (REQ_OP_AFTER.has(penOp) && penOp != ")") {
                        //don't want to show the calcVal on totalString if the now-most-recent op needs to have an op after it
                        //unless was endParens, since then we need the result
                        if (totalString.substr(-1 * penOp.length) == penOp) {
                            showVal = "";
                        //unless, of course, we shouldn't have undone this one and therefore won't show unless we add it back in
                        } else if (calcVal == "") {
                            //just in case there isn't actually anything here...even though there should be
                            showVal = ""; 
                            addES = "";
                        } else {
                            showVal = numberWithCommas(fixFloat(calcVal)) + penOp;
                            addES = penOp;
                            //since we can't undo, clear lastOperator so it won't freak out if `backspace` sent again!
                            lastOperator = [];
                            //since we shouldn't have removed it in the first place, put it back in
                            opStack.push(thisOp);
                        }
                    } else {
                        //otherwise, make sure we don't change blank string into a zero when we fixFloat
                        showVal = calcVal == "" ? calcVal : numberWithCommas(fixFloat(calcVal));
                    } 
                        
                    return {
                        strings: setRunData(totalString + showVal,addES),
                        stack: stack,
                        stacks: stacks,
                    };
                } else {
                    return {
                        strings: setRunData(totalString,PEEK(lastOperator) || ""),
                        stacks: {},
                    }
                }
            }

            function resetOps(stack,oldVal) {
                var running = "";
                var tempOp;
                while (tempStack.length) {
                    tempOp = tempStack.pop();
                    stack.push(tempOp);
                    if (isParens(tempOp.operator)) {
                        running += tempOp.operator + tempOp.storedVal;
                    } else {
                        running += tempOp.storedVal + tempOp.operator;
                    }
                    totalString = totalString.replace(oldVal,running);
                    oldVal = running;
                }
                return tempOp != undefined ? tempOp.operator : "";
            }
            
            function runOrderOps(input) {
                var returnES = input;
                var lastOp = PEEK(lastOperator);
                
                //check for missing numbers, div by 0
                if (numberBuffer == " " && !isParens(input)) {
                    return setRunData(totalString,"","Number required to run operation");
                }
                if (numberBuffer == "-") {
                    return setRunData(totalString,"","Number required to run operation");
                }
                if (numberBuffer === "0" || (numberBuffer == "constant" && lastConstant == "Ans" && lastResult == 0)) {
                    if (opStack.length > 0 && PEEK(opStack).operator == "/") {
                        return setRunData(totalString,"","Cannot divide by 0");
                    }
                }
                
                if (lastOp == "=") {
                    //fill lastResult (strip commas so will calculate)
                    lastResult = totalString.replace(",","");
                    //clear total string
                    totalString = "";
                    //clear lastOperator - can't undo past the equals!
                    lastOperator = [];
                }
                //have constant
                if (NUM_CONSTANTS[input]) {
                    numberBuffer = "constant";
                    lastConstant = input;
                    return setRunData(totalString + NUM_CONSTANTS[input].string,NUM_CONSTANTS[input].string);
                }
                //have number or pushed operator after equals or parens
                if (numberBuffer != "" || lastOp == "=" || isParens(input)) {
                    //reset tempStack so we only have this operation's calcs to "undo" if necessary
                    if (!isParens(input)) {
                        clearTemp();
                    }
                    //add to stack
                    if (lastOp == "=") {
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
                        var thisRes = checkStack(input,opStack,calcVal);
                        if (thisRes) {
                            //if we have something returned, error
                            return thisRes;
                        }
                    //opening parenthesis right after number
                    } else if (numberBuffer != "" && numberBuffer != " " && isParens(input) && !isParens(lastOp)) {
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
                        } else if (numberBuffer == "" && !isParens(input)) {
                            //must have backspaced operator and then entered new one
                            calcVal = calcVal;
                        } else if (numberBuffer == "constant") {
                            calcVal = NUM_CONSTANTS[lastConstant].val();
                        } else if (isParens(input)) {
                            calcVal = numberBuffer;
                            parenKeepVal = lastVal == "" ? parenKeepVal : lastVal;
                        } else {
                            calcVal = numberBuffer;
                        } 
                        lastVal = calcVal;
                        //add lastOperator to val returned to ES if isParens
                        if (isParens(input)) {
                            //since would have removed lastOperator from ES under assumption switching
                            if (lastOperator.length > 0) {
                                //but not if equation began with parenthesis!
                                returnES = lastOp + returnES;
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
                            var thisRes = checkStack(input,stacks.nested,calcVal);
                            if (thisRes) {
                                //if we have something returned, error
                                return thisRes;
                            }
                            checkEndParen(input,stacks);
                        } else {
                            //no parenthesis in stack - run checkStack on opStack
                            if (input == ")") {
                                //no opening parenthesis to match - do nothing
                                var endParen = "";
                                var buffer = numberWithCommas(numberBuffer);
                                if (lastOp == ")") {
                                    //we don't want to officially add the previous closing parens since it will be done next loop, but we do need it to show up!
                                    //also don't want numberBuffer on there since it is just for calculation next time
                                    endParen = ")";
                                    buffer = "";
                                } 
                                return setRunData(totalString + buffer,endParen,"Closing parenthesis without opening parenthesis"); 
                            }
                            var thisRes = checkStack(input,opStack,calcVal)
                            ;
                            if (thisRes) {
                                //if we have something returned, error
                                return thisRes;
                            }
                        }
                    }
                    //update totalString - no equals sign at end
                    totalString += input == "=" ? numberWithCommas(calcVal) : numberWithCommas(calcVal) + input;
                //switching operation
                } else {
                    //switching operation
                    if (lastOperator.length > 0) {
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
                if (REQ_OP_AFTER.has(input)) {
                    //only operates on the number it receives, so need an operator after
                    numberBuffer = "op";
                }  else {
                    numberBuffer = "";
                }
                lastOperator.push(input);
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

            function stackItem(operator,storeVal) {
                return {
                    operator: operator,
                    storedVal: numberWithCommas(storeVal),
                    op: OPERATORS[operator].op(storeVal),
                    parens: [],
                }
            }

            function undoOp(input) {
                if (input == "backspace") {
                    if (PEEK(lastOperator) == "=") {
                        lastOperator = ["="];
                        return setRunData("","clear");
                    }
                    var result = removeOperator();

                   return result.strings;
                } 
                if (isParens(PEEK(lastOperator)) && !isParens(input)) {
                    //don't want to have two operators in a row, so we can't change the parenthesis to a different operator unless another parenthesis type - do nothing
                    return setRunData(totalString, PEEK(lastOperator), "Can't have two non-parenthetical operators in a row"); 
                }
                var oldOperator = PEEK(lastOperator);
                var newPriority = OPERATORS[input].priority;
                var oldPriority = OPERATORS[oldOperator].priority;
                //pop last operation, update strings
                var result = removeOperator(input);
                if (newPriority > oldPriority) {
                    //redo any calcs that should be done, add this calc to stack
                    var thisRes = checkStack(input,result.stack,lastVal);
                    if (thisRes) {
                        //if we have something returned, error
                        return thisRes;
                    }
                    //update total string for any calculations redone - include lastOperator in case there are two instances of lastVal (ie, 3-3 - replaces first instead of last)
                    // totalString = totalString.replace(oldOperator + lastVal,oldOperator + calcVal);
                    totalString += numberWithCommas(lastVal) + input;
                } else {
                    // add op to stack
                        var thisRes = checkStack(input,result.stack,lastVal);
                        if (thisRes) {
                            //if we have something returned, error
                            return thisRes;
                        }
                    //update totalString
                    totalString += input == "=" ? numberWithCommas(calcVal) : numberWithCommas(calcVal) + input;
                }
                checkEndParen(input,result.stacks);
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
                return setData(currTotal,equationString,"Operator required");
            }
            if (numberBuffer == "") {
                if (PEEK(lastOperator) != "="  && lastOperator.length > 0) {
                    //new number, clear lastOperator 
                    //unless it is negative, in which case we want to let user backspace
                    //out if intent was to change to minus
                    if (input != "-") {
                        lastOperator = [];
                    }
                } else {
                    //hit "equals" and then entered a number rather than operator - start new equation
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
            if (OPERATORS[input]) {
                var tempBuffer = numberBuffer;
                var peeked = PEEK(lastOperator);
                //negative number
                if (numberBuffer == "" && input == "-" && PEEK(lastOperator) != ")" && PEEK(lastOperator) != "=") {
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
                        updateES(result.addES);

                        //have operator after equals
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
                        if (lastOperator.length > 0 && peeked != ")") {
                            //assume changing operator; remove last one
                            equationString = dropLast(equationString,peeked);
                        }
                    }
                }
                
                updateES(result.addES);
                
                currTotal = result.tS;
                return setData(currTotal,equationString, result.warning);
            } else if (NUM_CONSTANTS[input]) {
                if (numberBuffer != "" && numberBuffer != " " && numberBuffer != "op") {
                    //assume multiplication, run with this first
                    var firstResult = calculate("*");
                    if (firstResult.warning != "") {
                        return setData(currTotal + filterBuffer(numberBuffer), equationString + filterBuffer(numberBuffer), firstResult.warning);
                    }
                }
                if (numberBuffer == "op") {
                    return setData(currTotal,equationString,"Operator required");
                }
                bufferNumbers(input);
                //go ahead and send constant through
                var result = RUN_ORDER.run(input);
                if (result.warning != "") {
                    return setData(currTotal + filterBuffer(numberBuffer), equationString + filterBuffer(numberBuffer), result.warning);
                }
                updateES(result.addES);
                currTotal = result.tS;
                return setData(currTotal,equationString, result.warning);
                
            } else if (/^[0-9.]+?$/.test(input)) {
                if (REQ_OP_AFTER.has(PEEK(lastOperator))) {
                    //no operator selected after closing parenthesis - do nothing
                    return setData(currTotal,equationString,"Operator required"); 
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
                            currTotal = dropLast(currTotal,NUM_CONSTANTS[lastConstant].string);
                            equationString = dropLast(equationString,NUM_CONSTANTS[lastConstant].string);
                            lastConstant = "";
                        } else if (lastOperator.length > 0) {
                            equationString = dropLast(equationString,PEEK(lastOperator));
                            result = RUN_ORDER.undo(input);
                            currTotal = result.tS;
                            updateES(result.addES);
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
            lastOperator = [];
            RUN_ORDER.clearOps();
            RUN_ORDER.clearTemp();
        }
        
        function clearNumberBuffer() {
            numberBuffer = " ";
        }

        function dropLast(string,operator) {
            //force coercion if number sent through instead of string - otherwise length property won't work and it won't get dropped!
            operator = operator != undefined ? numberWithCommas(operator) : operator;
            var numChars = operator == undefined ? 1 : operator.length;
            
            if (operator != undefined) {
                if (string.slice(-1 * numChars) != operator) {
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
                    //user hit another operator - return previous result for currTotal
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

        function updateES(eSres) {
            if (eSres == "clear") {
                equationString = "";
            }
            else {
                equationString += eSres;
            }
        }

        return {
            calculate: calculate,
            dropLast: dropLast,
        }
    })();

    function updateDisplay() {
        var endRem = "";
        var tSfontSize = 1.5;
        var openPar = (rT.match(/\({1}/g) || []).length;
        var closedPar = (rT.match(/\){1}/g) || []).length;
        for (var  i=1; i<=openPar - closedPar; i++) {
            endRem += ")";
        }

        $(".eS").html(eString + letterBuffer);
        $(".tS").html(rT + letterBuffer + "<span>" + endRem + "</span>");
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
            //have a valid operator
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
            // console.log(e.currentTarget.className);
            var result = CALCULATOR.calculate($(e.currentTarget).attr("data-calc"));
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
            // console.log(kC);
            if (kC == 16) {
                //shift key
                shiftPressed = e.type == "keydown";
            } else if (kC == 17) {
                //ctrl key - allow copy
                ctrlPressed = e.type == "keydown";
            } else {
                if (ctrlPressed) {
                    try {
                        document.execCommand("copy");
                        return;
                    } catch(err) {
                        return;
                    }
                    return;
                }
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
            $(e.currentTarget).toggleClass("active",e.type == "touchstart");
        });
        //toggle deg/rad buttons
        $(".toggle").on("click", function togC(e) {
            if (!e.currentTarget.classList.contains("pushed")) {
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
            [6, "2.7-7", "4-1.3-7", "Operator required"],
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
            ["4", "2.7-7/(21.5)", "4-1.3-7/(3+11*(5/2)-9)", "Operator required"],
            ["*", "2.7-0.32558139534883723*", "4-1.3-7/(3+11*(5/2)-9)*", ""],
            ["*", "2.7-0.32558139534883723*", "4-1.3-7/(3+11*(5/2)-9)*", ""],
            ["-", "2.7-0.32558139534883723*-", "4-1.3-7/(3+11*(5/2)-9)*-", ""],
            // intend for this to remove the `-` and `*`, then put `-` in place of the `*`       
            ["backspace", "2.7-0.32558139534883723*", "4-1.3-7/(3+11*(5/2)-9)*", ""],
            ["backspace", "2.7-0.32558139534883723", "4-1.3-7/(3+11*(5/2)-9)", ""],
            ["-", "2.374418604651163-", "4-1.3-7/(3+11*(5/2)-9)-", ""],
            //then change back to `*` and add `-3` to strings
            ["*", "2.7-0.32558139534883723*", "4-1.3-7/(3+11*(5/2)-9)*", ""],
            //test "changing op" unmatched parens error
            [")", "2.7-0.32558139534883723*", "4-1.3-7/(3+11*(5/2)-9)*", "Closing parenthesis without opening parenthesis"],
            ["-", "2.7-0.32558139534883723*-", "4-1.3-7/(3+11*(5/2)-9)*-", ""],
            ["3", "2.7-0.32558139534883723*-3", "4-1.3-7/(3+11*(5/2)-9)*-3", ""],
            ["3", "2.7-0.32558139534883723*-33", "4-1.3-7/(3+11*(5/2)-9)*-33", ""],
            ["=", "13.444186046511629", "4-1.3-7/(3+11*(5/2)-9)*-33=", ""],
            ["AC", "", "", ""],
        ];
        var bSTest = [
            ["2", "2", "2", ""],
            ["+", "2+", "2+", ""],
            ["3", "2+3", "2+3", ""],
            ["+", "5+", "2+3+", ""],
            ["backspace", "2+3", "2+3", ""],
            ["backspace", "2+3", "2+3", ""],
            ["-", "5-", "2+3-", ""],
            ["4", "5-4", "2+3-4", ""],
            ["+", "1+", "2+3-4+", ""],
            ["backspace", "5-4", "2+3-4", ""],
            ["backspace", "5-4", "2+3-4", ""],
            ["*", "5-4*", "2+3-4*", ""],
            ["6", "5-4*6", "2+3-4*6", ""],
            ["+", "-19+", "2+3-4*6+", ""],
            ["backspace", "5-4*6", "2+3-4*6", ""],
            ["backspace", "5-4*6", "2+3-4*6", ""],
            ["(", "5-24*(", "2+3-4*6*(", ""],
            ["backspace", "5-24*", "2+3-4*6*", ""],
            ["backspace", "5-4*6", "2+3-4*6", ""],
            ["backspace", "5-4*6", "2+3-4*6", ""],
            ["/", "5-24/", "2+3-4*6/", ""],
            ["(", "5-24/(", "2+3-4*6/(", ""],
            ["(", "5-24/((", "2+3-4*6/((", ""],
            ["backspace", "5-24/(", "2+3-4*6/(", ""],
            ["backspace", "5-24/", "2+3-4*6/", ""],
            ["backspace", "5-4*6", "2+3-4*6", ""],
            ["backspace", "5-4*6", "2+3-4*6", ""],
            ["(", "5-24*(", "2+3-4*6*(", ""],
            ["7", "5-24*(7", "2+3-4*6*(7", ""],
            ["backspace", "5-24*(", "2+3-4*6*(", ""],
            ["backspace", "5-24*(", "2+3-4*6*(", ""],
            ["8", "5-24*(8", "2+3-4*6*(8", ""],
            ["!", "5-24*(8!", "2+3-4*6*(8!", ""],
            ["backspace", "5-24*(8", "2+3-4*6*(8", ""],
            ["backspace", "5-24*(8", "2+3-4*6*(8", ""],
            ["!", "5-24*(8!", "2+3-4*6*(8!", ""],
            ["+", "5-24*(40,320+", "2+3-4*6*(8!+", ""],
            ["backspace", "5-24*(8!", "2+3-4*6*(8!", ""],
            ["backspace", "5-24*(8", "2+3-4*6*(8", ""],
            ["backspace", "5-24*(8", "2+3-4*6*(8", ""],
            ["+", "5-24*(8+", "2+3-4*6*(8+", ""],
            ["7", "5-24*(8+7", "2+3-4*6*(8+7", ""],
            ["+", "5-24*(15+", "2+3-4*6*(8+7+", ""],
            ["backspace", "5-24*(8+7", "2+3-4*6*(8+7", ""],
            ["backspace", "5-24*(8+7", "2+3-4*6*(8+7", ""],
            ["*", "5-24*(8+7*", "2+3-4*6*(8+7*", ""],
            ["backspace", "5-24*(8+7", "2+3-4*6*(8+7", ""],
            ["backspace", "5-24*(8+7", "2+3-4*6*(8+7", ""],
            ["*", "5-24*(8+7*", "2+3-4*6*(8+7*", ""],
            ["5", "5-24*(8+7*5", "2+3-4*6*(8+7*5", ""],
            ["-", "5-24*(43-", "2+3-4*6*(8+7*5-", ""],
            ["backspace", "5-24*(8+7*5", "2+3-4*6*(8+7*5", ""],
            ["backspace", "5-24*(8+7*5", "2+3-4*6*(8+7*5", ""],
            ["^", "5-24*(8+7*5^", "2+3-4*6*(8+7*5^", ""],
            ["backspace", "5-24*(8+7*5", "2+3-4*6*(8+7*5", ""],
            ["backspace", "5-24*(8+7*5", "2+3-4*6*(8+7*5", ""],
            ["<sup>2 </sup>", "5-24*(8+7*5<sup>2 </sup>", "2+3-4*6*(8+7*5<sup>2 </sup>", ""],
            ["PI", "5-24*(8+7*5<sup>2 </sup>", "2+3-4*6*(8+7*5<sup>2 </sup>", "Operator required"],
            ["/", "5-24*(8+175/", "2+3-4*6*(8+7*5<sup>2 </sup>/", ""],
            ["backspace", "5-24*(8+7*5<sup>2 </sup>", "2+3-4*6*(8+7*5<sup>2 </sup>", ""],
            ["*", "5-24*(8+175*", "2+3-4*6*(8+7*5<sup>2 </sup>*", ""],
            ["*", "5-24*(8+175*", "2+3-4*6*(8+7*5<sup>2 </sup>*", ""],
            ["backspace", "5-24*(8+7*5<sup>2 </sup>", "2+3-4*6*(8+7*5<sup>2 </sup>", ""],
            ["backspace", "5-24*(8+7*5", "2+3-4*6*(8+7*5", ""],
            ["backspace", "5-24*(8+7*5", "2+3-4*6*(8+7*5", ""],
            ["^", "5-24*(8+7*5^", "2+3-4*6*(8+7*5^", ""],
            ["(", "5-24*(8+7*5^(", "2+3-4*6*(8+7*5^(", ""],
            ["backspace", "5-24*(8+7*5^", "2+3-4*6*(8+7*5^", ""],
            ["backspace", "5-24*(8+7*5", "2+3-4*6*(8+7*5", ""],
            ["backspace", "5-24*(8+7*5", "2+3-4*6*(8+7*5", ""],
            ["^", "5-24*(8+7*5^", "2+3-4*6*(8+7*5^", ""],
            ["(", "5-24*(8+7*5^(", "2+3-4*6*(8+7*5^(", ""],
            ["2", "5-24*(8+7*5^(2", "2+3-4*6*(8+7*5^(2", ""],
            ["+", "5-24*(8+7*5^(2+", "2+3-4*6*(8+7*5^(2+", ""],
            ["1", "5-24*(8+7*5^(2+1", "2+3-4*6*(8+7*5^(2+1", ""],
            [")", "5-24*(8+7*5^(3)", "2+3-4*6*(8+7*5^(2+1)", ""],
            ["backspace", "5-24*(8+7*5^(2+1", "2+3-4*6*(8+7*5^(2+1", ""],
            ["backspace", "5-24*(8+7*5^(2+1", "2+3-4*6*(8+7*5^(2+1", ""],
            [")", "5-24*(8+7*5^(3)", "2+3-4*6*(8+7*5^(2+1)", ""],
            [")", "5-24*(883)", "2+3-4*6*(8+7*5^(2+1))", ""],
            ["backspace", "5-24*(8+7*5^(3)", "2+3-4*6*(8+7*5^(2+1)", ""],
            ["backspace", "5-24*(8+7*5^(3)", "2+3-4*6*(8+7*5^(2+1)", ""],
            ["backspace", "5-24*(8+7*5^(3)", "2+3-4*6*(8+7*5^(2+1)", ""],
            ["=", "-21,187", "2+3-4*6*(8+7*5^(2+1))=", ""],
            ["backspace", "", "", ""],
            ["backspace", "", "", ""],
            ["(", "(", "(", ""],
            ["backspace", "", "", ""],
            ["backspace", "", "", ""],
            ["Ans", "Ans", "Ans", ""],
            ["backspace", "", "", ""],
            ["backspace", "", "", ""],
            ["Ans", "Ans", "Ans", ""],
            ["^", "-21,187^", "Ans^", ""],
            ["backspace", "-21,187", "Ans", ""],
            ["backspace", "-21,187", "Ans", ""],
            ["*", "-21,187*", "Ans*", ""],
            ["-", "-21,187*-", "Ans*-", ""],
            ["backspace", "-21,187*", "Ans*", ""],
            ["backspace", "-21,187", "Ans", ""],
            ["backspace", "-21,187", "Ans", ""],
            ["*", "-21,187*", "Ans*", ""],
            ["-", "-21,187*-", "Ans*-", ""],
            ["1", "-21,187*-1", "Ans*-1", ""],
            ["=", "21,187", "Ans*-1=", ""],
            ["backspace", "", "", ""],
            ["backspace", "", "", ""],
            ["^", "21,187^", "21,187^", ""],
            ["(", "21,187^(", "21,187^(", ""],
            ["backspace", "21,187^", "21,187^", ""],
            ["backspace", "21,187", "21,187", ""],
            ["backspace", "21,187", "21,187", ""],
            ["^", "21,187^", "21,187^", ""],
            ["(", "21,187^(", "21,187^(", ""],
            [".", "21,187^(.", "21,187^(.", ""],
            ["3", "21,187^(.3", "21,187^(.3", ""],
            [")", "21,187^(0.3)", "21,187^(.3)", ""],
            ["-", "19.852757602153737-", "21,187^(.3)-", ""],
            ["PI", "19.852757602153737-&pi;", "21,187^(.3)-&pi;", ""],
            ["backspace", "19.852757602153737-", "21,187^(.3)-", ""],
            ["backspace", "19.852757602153737-", "21,187^(.3)-", ""],
            ["e", "19.852757602153737-e", "21,187^(.3)-e", ""],
            ["backspace", "19.852757602153737-", "21,187^(.3)-", ""],
            ["backspace", "19.852757602153737-", "21,187^(.3)-", ""],
            ["1", "19.852757602153737-1", "21,187^(.3)-1", ""],
            ["+", "18.852757602153737+", "21,187^(.3)-1+", ""],
            ["e", "18.852757602153737+e", "21,187^(.3)-1+e", ""],
            ["PI", "18.852757602153737+2.718281828459045*&pi;", "21,187^(.3)-1+e*&pi;", ""],
            ["backspace", "18.852757602153737+2.718281828459045*", "21,187^(.3)-1+e*", ""],
            ["backspace", "18.852757602153737+2.718281828459045*", "21,187^(.3)-1+e*", ""],
            ["/", "18.852757602153737+2.718281828459045*", "21,187^(.3)-1+e*", "Number required to run operation"],
            ["1", "18.852757602153737+2.718281828459045*1", "21,187^(.3)-1+e*1", ""],
            ["=", "21.57103943061278", "21,187^(.3)-1+e*1=", ""],
            ["(", "(", "(", ""],
            ["backspace", "", "", ""],
            ["backspace", "", "", ""],
            ["3", "3", "3", ""],
            ["!", "3!", "3!", ""],
            ["backspace", "3", "3", ""],
            ["backspace", "3", "3", ""],
            ["!", "3!", "3!", ""],
            ["!", "6!", "3!!", ""],
            ["backspace", "3!", "3!", ""],
            ["backspace", "3", "3", ""],
            ["backspace", "3", "3", ""],
            ["!", "3!", "3!", ""],
            ["!", "6!", "3!!", ""],
            ["-", "720-", "3!!-", ""],
            ["backspace", "6!", "3!!", ""],
            ["backspace", "6!", "3!!", ""],
            ["backspace", "6!", "3!!", ""],
            ["10^(", "720*10^(", "3!!*10^(", ""],
            ["10^(", "720*10^(10^(", "3!!*10^(10^(", ""],
            ["backspace", "720*10^(", "3!!*10^(", ""],
            ["backspace", "720*", "3!!*", ""],
            ["backspace", "6!", "3!!", ""],
            ["backspace", "6!", "3!!", ""],
            ["&radic;(", "720*&radic;(", "3!!*&radic;(", ""],
            ["9", "720*&radic;(9", "3!!*&radic;(9", ""],
            [")", "720*&radic;(9)", "3!!*&radic;(9)", ""],
            ["backspace", "720*&radic;(9", "3!!*&radic;(9", ""],
            ["backspace", "720*&radic;(9", "3!!*&radic;(9", ""],
            [")", "720*&radic;(9)", "3!!*&radic;(9)", ""],
            ["<sup>2 </sup>", "720*3<sup>2 </sup>", "3!!*&radic;(9)<sup>2 </sup>", ""],
            ["<sup>2 </sup>", "720*9<sup>2 </sup>", "3!!*&radic;(9)<sup>2 </sup><sup>2 </sup>", ""],
            ["backspace", "720*3<sup>2 </sup>", "3!!*&radic;(9)<sup>2 </sup>", ""],
            ["backspace", "720*3", "3!!*&radic;(9)", ""],
            ["backspace", "720*3", "3!!*&radic;(9)", ""],
            ["&radic;(", "2,160*&radic;(", "3!!*&radic;(9)*&radic;(", ""],
            ["10^(", "2,160*&radic;(10^(", "3!!*&radic;(9)*&radic;(10^(", ""],
            ["backspace", "2,160*&radic;(", "3!!*&radic;(9)*&radic;(", ""],
            ["backspace", "2,160*", "3!!*&radic;(9)*", ""],
            ["backspace", "720*3", "3!!*&radic;(9)", ""],
            ["backspace", "720*3", "3!!*&radic;(9)", ""],
            ["&radic;(", "2,160*&radic;(", "3!!*&radic;(9)*&radic;(", ""],
            ["10^(", "2,160*&radic;(10^(", "3!!*&radic;(9)*&radic;(10^(", ""],
            ["2", "2,160*&radic;(10^(2", "3!!*&radic;(9)*&radic;(10^(2", ""],
            ["+", "2,160*&radic;(10^(2+", "3!!*&radic;(9)*&radic;(10^(2+", ""],
            ["2", "2,160*&radic;(10^(2+2", "3!!*&radic;(9)*&radic;(10^(2+2", ""],
            [")", "2,160*&radic;(10^(4)", "3!!*&radic;(9)*&radic;(10^(2+2)", ""],
            ["backspace", "2,160*&radic;(10^(2+2", "3!!*&radic;(9)*&radic;(10^(2+2", ""],
            ["backspace", "2,160*&radic;(10^(2+2", "3!!*&radic;(9)*&radic;(10^(2+2", ""],
            [")", "2,160*&radic;(10^(4)", "3!!*&radic;(9)*&radic;(10^(2+2)", ""],
            ["+", "2,160*&radic;(10,000+", "3!!*&radic;(9)*&radic;(10^(2+2)+", ""],
            ["backspace", "2,160*&radic;(10,000", "3!!*&radic;(9)*&radic;(10^(2+2)", ""],
            ["backspace", "2,160*&radic;(10,000", "3!!*&radic;(9)*&radic;(10^(2+2)", ""],
            ["backspace", "2,160*&radic;(10,000", "3!!*&radic;(9)*&radic;(10^(2+2)", ""],
            ["0", "2,160*&radic;(10,000", "3!!*&radic;(9)*&radic;(10^(2+2)", "Operator required"],
            ["+", "2,160*&radic;(10,000+", "3!!*&radic;(9)*&radic;(10^(2+2)+", ""],
            ["0", "2,160*&radic;(10,000+0", "3!!*&radic;(9)*&radic;(10^(2+2)+0", ""],
            [")", "2,160*&radic;(10,000)", "3!!*&radic;(9)*&radic;(10^(2+2)+0)", ""],
            // ["backspace", "2,160*&radic;(10,000+0", "3!!*&radic;(9)*&radic;(10^(2+2)+0", ""],

            
            // test bS open parens after AC
            ["AC", "", "", ""],
            ["(", "(", "(", ""],
            ["backspace", "", "", ""],

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
        var openOperatorTest = [
            //test opening operator
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
            //test operator after equals
            ["+", "0.375+", "0.375+", ""],
            ["1", "0.375+1", "0.375+1", ""],
            ["=", "1.375", "0.375+1=", ""],
            //test backspace after operator after equals
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
            //parens after operator after equals
            ["/", "0.6/", "0.6/", ""],
            ["(", "0.6/(", "0.6/(", ""],
            ["5", "0.6/(5", "0.6/(5", ""],
            ["+", "0.6/(5+", "0.6/(5+", ""],
            ["5", "0.6/(5+5", "0.6/(5+5", ""],
            [")", "0.6/(10)", "0.6/(5+5)", ""],
            ["=", "0.06", "0.6/(5+5)=", ""],
            //backspace after operator after equals then operator
            ["*", "0.06*", "0.06*", ""],
            ["*", "0.06*", "0.06*", ""],
            ["backspace", "0.06", "0.06", ""],
            ["-", "0.06-", "0.06-", ""],
            ["AC", "", "", ""],
            //delete opening parens
            ["(", "(", "(", ""],
            ["backspace", "", "", ""],
            //prevent changing opening parens to non-parens operator
            ["(", "(", "(", ""],
            ["+", "(", "(", "Can't have two non-parenthetical operators in a row"],
            ["AC", "", "", ""],
            //test operator inside parens
            ["3", "3", "3", ""],
            ["(", "3*(", "3*(", ""],
            ["+", "3*(", "3*(", "Can't have two non-parenthetical operators in a row"],

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
            ["-", "3.141592653589793-", "&pi;-", ""],
            ["2", "3.141592653589793-2", "&pi;-2", ""],
            ["=", "1.1415926535897931", "&pi;-2=", ""],
            //test pi w/no operator after equals - treat like number    
            ["PI", "&pi;", "&pi;", ""],
            ["+", "3.141592653589793+", "&pi;+", ""],
            ["1", "3.141592653589793+1", "&pi;+1", ""],
            ["-", "4.141592653589793-", "&pi;+1-", ""],
            [".141592653589793", "4.141592653589793-.141592653589793", "&pi;+1-.141592653589793", ""],
            ["+", "4+", "&pi;+1-.141592653589793+", ""],
            ["1", "4+1", "&pi;+1-.141592653589793+1", ""],
            //pi after number w/no operator between
            ["PI", "4+1*&pi;", "&pi;+1-.141592653589793+1*&pi;", ""],
            ["=", "7.141592653589793", "&pi;+1-.141592653589793+1*&pi;=", ""],
            ["AC", "", "", ""],
            //pi after operator
            ["5", "5", "5", ""],
            ["/", "5/", "5/", ""],
            ["PI", "5/&pi;", "5/&pi;", ""],
            ["+", "1.5915494309189535+", "5/&pi;+", ""],
            ["2", "1.5915494309189535+2", "5/&pi;+2", ""],
            ["=", "3.5915494309189535", "5/&pi;+2=", ""],
            //test e
            ["5", "5", "5", ""],
            ["/", "5/", "5/", ""],
            ["e", "5/e", "5/e", ""],
            ["+", "1.8393972058572117+", "5/e+", ""],
            ["2", "1.8393972058572117+2", "5/e+2", ""],
            ["=", "3.8393972058572117", "5/e+2=", ""],
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
            [")", "ln(2.718281828459045)", "ln(e)", ""],
            ["=", "1", "ln(e)=", ""],
            //test e^x
            ["e^(", "e^(", "e^(", ""],
            ["2", "e^(2", "e^(2", ""],
            [")", "e^(2)", "e^(2)", ""],
            ["=", "7.3890560989306495", "e^(2)=", ""],
            ["ln(", "ln(", "ln(", ""],
            ["Ans", "ln(Ans", "ln(Ans", ""],
            [")", "ln(7.3890560989306495)", "ln(Ans)", ""],
            ["=", "2", "ln(Ans)=", ""],
            //test log10 of neg number
            ["log<sub>10</sub>(", "log<sub>10</sub>(", "log<sub>10</sub>(", ""],
            ["-", "log<sub>10</sub>(-", "log<sub>10</sub>(-", ""],
            ["1", "log<sub>10</sub>(-1", "log<sub>10</sub>(-1", ""],
            ["0", "log<sub>10</sub>(-10", "log<sub>10</sub>(-10", ""],
            ["0", "log<sub>10</sub>(-100", "log<sub>10</sub>(-100", ""],
            [")", "log<sub>10</sub>(-100)", "log<sub>10</sub>(-100)", ""],
            ["=", "log<sub>10</sub>(-100)", "log<sub>10</sub>(-100)", "Cannot take log of negative number"],
            ["AC", "", "", ""],
            //test ln of calculated neg number
            ["ln(", "ln(", "ln(", ""],
            ["1", "ln(1", "ln(1", ""],
            ["-", "ln(1-", "ln(1-", ""],
            ["2", "ln(1-2", "ln(1-2", ""],
            [")", "ln(-1)", "ln(1-2)", ""],
            ["+", "ln(-1)", "ln(1-2)", "Cannot take log of negative number"],
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
            ["3", "5!", "5!", "Operator required"],
            ["*", "120*", "5!*", ""],
            //test after end parenthesis
            ["(", "120*(", "5!*(", ""],
            ["3", "120*(3", "5!*(3", ""],
            ["+", "120*(3+", "5!*(3+", ""],
            ["1", "120*(3+1", "5!*(3+1", ""],
            [")", "120*(4)", "5!*(3+1)", ""],
            ["!", "120*4!", "5!*(3+1)!", ""],
            ["=", "2,880", "5!*(3+1)!=", ""],
            //test inside parenthesis
            ["(", "(", "(", ""],
            ["5", "(5", "(5", ""],
            ["!", "(5!", "(5!", ""],
            ["+", "(120+", "(5!+", ""],
            ["3", "(120+3", "(5!+3", ""],
            ["=", "123", "(5!+3)=", ""],
            //test outside parenthesis (backspace)
            ["5", "5", "5", ""],
            ["!", "5!", "5!", ""],
            ["+", "120+", "5!+", ""],
            ["backspace", "5!", "5!", ""],
            ["backspace", "5", "5", ""],
            ["!", "5!", "5!", ""],
            ["+", "120+", "5!+", ""],
            //test followed by parens
            ["backspace", "5!", "5!", ""],
            ["&radic;(", "120*&radic;(", "5!*&radic;(", ""],
            //test followed by number inside parens
            ["3", "120*&radic;(3", "5!*&radic;(3", ""],
            ["!", "120*&radic;(3!", "5!*&radic;(3!", ""],
            ["+", "120*&radic;(6+", "5!*&radic;(3!+", ""],
            ["1", "120*&radic;(6+1", "5!*&radic;(3!+1", ""],
            ["0", "120*&radic;(6+10", "5!*&radic;(3!+10", ""],
            [")", "120*&radic;(16)", "5!*&radic;(3!+10)", ""],
            ["=", "480", "5!*&radic;(3!+10)=", ""],
            //test factorial of non-integer
            // ["3", "3", "3", ""],
            // [".", "3.", "3.", ""],
            // ["9", "3.9", "3.9", ""],
            // ["!", "3.9!", "3.9!", ""],
            // ["=", "20.6673859619", "3.9!=", ""], //result from google calc
            // ["=", "", "", ""],
            // ["4.5", "4.5", "4.5", ""],
            // ["!", "4.5!", "4.5!", ""],
            // ["=", "52.34277778455352", "4.5!=", ""],
            // ["=", "", "", ""],
            // ["4.25", "4.25", "4.25", ""],
            // ["!", "4.25!", "4.25!", ""],
            // ["=", "35.2116118528", "4.25!=", ""], //result from google calc
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
            //test operator after =       
            ["*", "3*", "3*", ""],
            ["2", "3*2", "3*2", ""],
            ["+", "6+", "3*2+", ""],
            //test letters w/numbers      
            ["hi2", "6+", "3*2+", ""],
            ["2hi", "6+", "3*2+", ""],
            ["h2hi", "6+", "3*2+", ""],
            //test multi-digit numbers      
            ["32", "6+32", "3*2+32", ""],
            ["=", "38", "3*2+32=", ""],
            //test Ans as first thing after =
            ["Ans", "Ans", "Ans", ""],
            ["/", "38/", "Ans/", ""],
            ["2", "38/2", "Ans/2", ""],
            ["-", "19-", "Ans/2-", ""],
            ["Ans", "19-Ans", "Ans/2-Ans", ""],
            ["=", "-19", "Ans/2-Ans=", ""],

            ["AC", "", "", ""],
        ];
        var parensTest = [
            ["(", "(", "(", ""],
            ["3", "(3", "(3", ""],
            ["+", "(3+", "(3+", ""],
            ["2", "(3+2", "(3+2", ""],
            [")", "(5)", "(3+2)", ""],
            ["=", "5", "(3+2)=", ""],
            ["backspace", "", "", ""],
            ["backspace", "", "", ""],
            ["backspace", "", "", ""],
            
            ["AC", "", "", ""],
        ];
        var miscTest = [
            //can't do operator after negative w/no digits
            ["2", "2", "2", ""],
            ["+", "2+", "2+", ""],
            ["-", "2+-", "2+-", ""],
            ["/", "2+-", "2+-", "Number required to run operation"],
            ["AC", "", "", ""],
            ["ln(", "ln(", "ln(", ""],
            [")", "ln(", "ln(", "Can't have two non-parenthetical operators in a row"],
            ["AC", "", "", ""],
            // test parenthesis as exponent
            ["2", "2", "2", ""],
            ["^", "2^", "2^", ""],
                //test backspace first operator
            ["backspace", "2", "2", ""],
            ["backspace", "2", "2", ""],
            ["^", "2^", "2^", ""],
            ["(", "2^(", "2^(", ""],
            ["3", "2^(3", "2^(3", ""],
            ["+", "2^(3+", "2^(3+", ""],
                //test backspace first operator inside parens
            ["backspace", "2^(3", "2^(3", ""],
            ["backspace", "2^(3", "2^(3", ""],
            ["+", "2^(3+", "2^(3+", ""],
            ["2", "2^(3+2", "2^(3+2", ""],
            [")", "2^(5)", "2^(3+2)", ""],
            ["=", "32", "2^(3+2)=", ""],
            //test squared
            ["<sup>2 </sup>", "32<sup>2 </sup>", "32<sup>2 </sup>", ""],
            ["=", "1,024", "32<sup>2 </sup>=", ""],
            //test square root
            ["&radic;(", "&radic;(", "&radic;(", ""],
            ["Ans", "&radic;(Ans", "&radic;(Ans", ""],
            [")", "&radic;(1,024)", "&radic;(Ans)", ""],
            ["=", "32", "&radic;(Ans)=", ""],
            ["AC", "", "", ""],
            // test no second decimal in string
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
            // test formatting w/commas for > 999
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
            //test parens after equals after removing number
            ["5", "5", "5", ""],
            ["+", "5+", "5+", ""],
            ["2", "5+2", "5+2", ""],
            ["=", "7", "5+2=", ""],
            ["3", "3", "3", ""],
            ["backspace", "", "", ""],
            ["backspace", "", "", ""],
            ["(", "(", "(", ""],
            ["backspace", "", "", ""],
            //test constant after deleted number
            ["3", "3", "3", ""],
            ["backspace", "", "", ""],
            ["PI", "&pi;", "&pi;", ""],
            ["+", "3.141592653589793+", "&pi;+", ""],
            ["3", "3.141592653589793+3", "&pi;+3", ""],
            ["backspace", "3.141592653589793+", "&pi;+", ""],
            ["PI", "3.141592653589793+&pi;", "&pi;+&pi;", ""],
            ["3", "3.141592653589793+&pi;", "&pi;+&pi;", "Operator required"],
            ["+", "6.283185307179586+", "&pi;+&pi;+", ""],
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
        runTests("backspace", bSTest);
        runTests("div0", div0Test);
        runTests("neg1st", neg1stTest);
        runTests("openOperator", openOperatorTest);
        runTests("trig", trigTest);
        runTests("constants", constantsTest);
        runTests("log", logsTest);
        runTests("factorial", factorialTest);
        runTests("Ans", ansTest);
        runTests("Parens",parensTest);
        runTests("Misc",miscTest);
    }
    
    // setClicks();
    unitTests();
// });
