/*
*   This is a collection of common methods so I don't have to include them in every single object where I need them.  Ought to be included with every project where I use my custom JS, possibly on others, too. ;-)

*/

var myFuncs = {
	addClass: function(thisNode, className) {
		this.changeClass(thisNode, className, true);
	},
	changeClass: function(thisNode, className, addClass) {
		if(addClass) {
			thisNode.className += " " + className;	
		}
		else {
			thisNode.className = thisNode.className.replace(new RegExp(className, "g"),"");	
		}
	},
	cycleChildren: function(el,callBackFunction,argsToPass) {
		//this method is for looping through all child elements and those child elements' children
		for (var i=0; i<el.childNodes.length; i++) {
			//cycle through all children of the cloned element
			var e = el.childNodes[i];
			
			callBackFunction(e,argsToPass);
			//loop again if this has children
			if (e.childNodes.length > 0) {
				this.cycleChildren(e,callBackFunction,argsToPass);
			}
		}
	},
	loopChildren: function(el,callFunction,argsToPass) {
		//this method is for looping only through an element's direct children - does not get grand-child nodes
		for (var i=0; i<el.childNodes.length; i++) {
			//cycle through all children of the passed element
			callFunction(el.childNodes[i],argsToPass);
		}
    },
    makeCompatible: function() {
        window.requestAnimationFrame = window.requestAnimationFrame
            || window.mozRequestAnimationFrame
            || window.webkitRequestAnimationFrame
            || window.msRequestAnimationFrame
            || function(f){return setTimeout(f, 1000/60)} // simulate calling code 60 
 
        window.cancelAnimationFrame = window.cancelAnimationFrame

            || window.mozCancelAnimationFrame
            || function(requestID){clearTimeout(requestID)}

        if (!Array.prototype.forEach) {

            Array.prototype.forEach = function(callback/*, thisArg*/) {

                var T, k;

                if (this == null) {
                throw new TypeError('this is null or not defined');
                }

                // 1. Let O be the result of calling toObject() passing the
                // |this| value as the argument.
                var O = Object(this);

                // 2. Let lenValue be the result of calling the Get() internal
                // method of O with the argument "length".
                // 3. Let len be toUint32(lenValue).
                var len = O.length >>> 0;

                // 4. If isCallable(callback) is false, throw a TypeError exception. 
                // See: http://es5.github.com/#x9.11
                if (typeof callback !== 'function') {
                throw new TypeError(callback + ' is not a function');
                }

                // 5. If thisArg was supplied, let T be thisArg; else let
                // T be undefined.
                if (arguments.length > 1) {
                T = arguments[1];
                }

                // 6. Let k be 0.
                k = 0;

                // 7. Repeat while k < len.
                while (k < len) {

                var kValue;

                // a. Let Pk be ToString(k).
                //    This is implicit for LHS operands of the in operator.
                // b. Let kPresent be the result of calling the HasProperty
                //    internal method of O with argument Pk.
                //    This step can be combined with c.
                // c. If kPresent is true, then
                if (k in O) {

                    // i. Let kValue be the result of calling the Get internal
                    // method of O with argument Pk.
                    kValue = O[k];

                    // ii. Call the Call internal method of callback with T as
                    // the this value and argument list containing kValue, k, and O.
                    callback.call(T, kValue, k, O);
                }
                // d. Increase k by 1.
                k++;
                }
                // 8. return undefined.
            };
        }
    },
	removeClass: function(thisNode, className) {
		this.changeClass(thisNode, className, false);
	},
	resizeWindowFunc: function(func) {
		//this method is for adding functions to the window.resize event without overwriting any that already exist
		var oldResize = window.onresize;
		var resizeTimer;
		window.onresize = function() { 
			clearTimeout(resizeTimer);
			resizeTimer = setTimeout(function() {
				// fLog("in myFunc resize");
					func();	
	
				if (typeof oldResize === 'function') {
					oldResize();	
				}
			}, 100);
		}
	},
}