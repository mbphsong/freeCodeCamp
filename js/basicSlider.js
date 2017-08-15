/*  &copy; Erin Halbmaier 2017.
*   The `basicSlider` object is an interface between the generic "move elements" methods of `slideFunctions` in slideFunctions.js 
*   and sliders for specific purposes, ie image slider, menu slider.  `basicSlider` holds necessary properties and defines mutual
*   methods but does not set any of the properties - this is left up to the slider that builds on it.
*
*   Pass in 1) `fraction` - a decimal that determines the speed at which the element will slide; 2) optional `offset` or `scroll` 
*   (sets whether it changes the style.left/style.top or scrollTop/scrollLeft) - if `offset`, user will not be able
*   to scroll past the style.left/style.top position.  Defaults to `offset`; and 3) optional `true` of `false` for whether
*   or not slider should loop back to beginning position when it reaches the end, ie, if `true`, goes back to first slide when
*   moving past last slide, goes back to last slide when moving past first slide; if `false`, stays on last slide when moving
*   past last slide, stays on first slide when moving past first slide.  Defaults to `true`.
*
*   Set object.slider to the element that you wish to slide.
*   Set object.offset.Top/object.offset.Left to the distance you want different from the exact "position", ie, if the slide is 100px
*   wide but you want it to slide to -70, -170, -270 instead of -100, -200, -300, `offset` should be `30`.  Only necessary to set the one
*   you need if only sliding horizontally OR vertically.
*   Set object.slideWidth.Top/object.slideWidth.Left to the size of each slide. ie, if you want it to move 100px each time, `slideWidth` should 
*   be `100`.  Only necessary to set the one you need if only sliding horizontally OR vertically.
*   Set object.numPositions.Top/object.numPositions.Left to the number of slides/positions.  ie, if you have 5 images, `numPositions` should 
*   be `5`.  If you want an object to move between 3 different horizontal positions and 2 vertical positions, `numPositions.Left` should be `3`
*   and `numPositions.Top` should be `2`.

*   To set the basic scroll events (resets to a position on touchend so not stuck partway), use `object.setScrollTouchEvents`.  Pass in 1) `left` 
*   or `top` (is this for horizontal or vertical?), 2) optional function to run on touchstart (run before freeing scroll), 3) optional function to 
*   run on touchend (run before freezing scroll and resetting position)
*
*   To use native slide, use `object.slideMe(directionOrPosition, leftOrTop)`.  Options for `directionOrPosition`: `right`, `left`, `top`, `down`, 
*   `reset`, or the position number to which you wish to jump (starts at `0` for first position).
*
*   To use custom slide, you can get numbers from native methods:
*      `getCurrentPos(leftOrTop)` - returns current scrollLeft/scrollTop or offsetLeft/offsetTop, depending on whether `object.moveMethod` is set
*           to `scroll` or `offset`
*      `getEndPos(directionOrPosition, leftOrTop)` - returns target top/left, logic depends on `object.moveMethod`
*      `getNewPos(leftOrTop)` - returns location for position of next frame in the animation, ie, if moving from 0 to -100, returns `-10`, `-19`,
*           `-27.1`, etc when `fraction` is `.1`; logic depends on `object.moveMethod`
*      `setNewPos(leftOrTop, newPos)` - moves slider to next position (`newPos`), updates `object.current.Left/Top`; logic depends on `object.moveMethod`.  
*      `slideFunctions.animate(function() {self.eachFrame(leftOrTop); })` - example of calling the actual animation where `self.eachFrame` is the method 
*            that runs the logic for each frame in the animation.
*
*    Requires myFuncs.js and slideFunctions.js 
*/



function basicSlider(fraction, scrollOrOffset, cycleAtEnd) {
    this.offset = {
        Top: 0,
        Left: 0,
    }
    this.moveMethod = scrollOrOffset || "offset";
    this.cycleAtEnd = cycleAtEnd == undefined ? true: cycleAtEnd;
    this.slider;
    this.current = {
        Left: undefined,
        Top: undefined,
    }
    this.end = {
        Left: undefined,
        Top: undefined,
    }
    this.slideWidth = {
        Left: undefined,
        Top: undefined,
    }
    this.numPositions = {
        Left: undefined,
        Top: undefined,
    }
    var firstSlide = true;
    var self = this;

    myFuncs.resizeWindowFunc(function() {self.resetSizes(self); });

    if (this.moveMethod != "scroll" && this.moveMethod != "offset") {
        throw new Error("`scrollOrOffset` must be either `scroll` or `offset`.  Passed value of `" + scrollOrOffset + "` not valid.");
    }

    this.eachFrame = function(leftOrTop) {
         if (self.current[leftOrTop] != self.end[leftOrTop]) {
            var newPos = self.getNewPos(leftOrTop);
            self.setNewPos(leftOrTop, newPos);
            return true;
        }
        else {
            return false;
        }
    }

    this.fixFormat = function(leftOrTop) {
        var newFormat = leftOrTop[0].toUpperCase() + leftOrTop.substring(1,leftOrTop.length).toLowerCase();
        if (newFormat != "Left" && newFormat != "Top") {
            throw new Error("`" + leftOrTop + "` invalid value for `leftOrTop`");
        }
        return newFormat;
    }

    this.getCurrentPos = function(leftOrTop) {
        leftOrTop = this.fixFormat(leftOrTop);
        if (this.moveMethod == "scroll") {
            return this.slider.parentNode["scroll" + leftOrTop];
        }
        else {
            return parseFloat(this.slider["offset" + leftOrTop]);
        }
    }

    this.getEndPos = function(directionOrPosition, leftOrTop) {
        leftOrTop = this.fixFormat(leftOrTop);
        if (firstSlide) {
            this.verifyProps(leftOrTop);
            firstSlide = false;
        }
        if (this.current[leftOrTop] == undefined) {
            throw new Error("basicSlider.getEndPos() requires `this.current." + leftOrTop + "` to be set first. \n Run basicSlider.getCurrentPos() if necessary to get value to set");
        }
        if (this.moveMethod == "scroll") {
            return Math.round(slideFunctions.getEndTopOrLeft(directionOrPosition, this.current[leftOrTop] * -1, this.slideWidth[leftOrTop], this.numPositions[leftOrTop], this.offset[leftOrTop], this.cycleAtEnd) * -1);
        }
        else {
            return slideFunctions.getEndTopOrLeft(directionOrPosition, this.current[leftOrTop], this.slideWidth[leftOrTop], this.numPositions[leftOrTop], this.offset[leftOrTop], this.cycleAtEnd);
        }
        
    }

    this.getNewPos = function(leftOrTop) {
        leftOrTop = this.fixFormat(leftOrTop);
        var newPos = slideFunctions.lerp(self.current[leftOrTop], self.end[leftOrTop], fraction);
        if (self.moveMethod == "scroll") {
            newPos = Math.round(newPos);
            if (newPos == self.current[leftOrTop]) {
                newPos = self.end[leftOrTop] - self.current[leftOrTop] > 0 ? self.current[leftOrTop] + 1 : self.current[leftOrTop] - 1;
            }
        }
        return newPos;
    }

    this.resetSizes = function(self) {
        if (self.slideWidth.Left != undefined) {
            self.slideWidth.Left = parseFloat(self.slider.offsetWidth) / self.numPositions.Left;
            self.slideMe("reset","left");
        }
        if (self.slideWidth.Top != undefined) {
            self.slideWidth.Top = parseFloat(self.slider.offsetHeight) / self.numPositions.Top;
            self.slideMe("reset","top");
        }
    }

    this.setScrollTouchEvents = function(leftOrTop, touchStartCallback, touchEndCallback) {
        leftOrTop = this.fixFormat(leftOrTop);
        this.verifyProps(leftOrTop);
        if (this.moveMethod == "offset") {
            console.log("moveMethod is set to `offset`.  It is unadvised to `setScrollTouchEvents` as it is not possible to scroll past the current `0` position");
        }
        //set up touch events
        var overflowDir = leftOrTop == "Left" ? "overflowX" : "overflowY";
        this.slider.addEventListener("touchstart",function(e) {
            if (typeof touchStartCallback === "function") {
                touchStartCallback;
            }
            if (self.moveMethod == "scroll") {
                self.slider.parentNode.style[overflowDir] = "scroll";
            }
        });
        this.slider.addEventListener("touchend",function(e) {
            if (typeof touchEndCallback === "function") {
                touchEndCallback;
            }
            if (self.moveMethod == "scroll") {
                self.slider.parentNode.style[overflowDir] = "hidden";
            }
            self.slideMe("reset",leftOrTop);
        })
    }

    this.setNewPos = function(leftOrTop, newPos) {
        leftOrTop = this.fixFormat(leftOrTop);
        if (self.moveMethod == "scroll") {
            self.slider.parentNode["scroll" + leftOrTop] = newPos;
        }
        else {
            self.slider.style[leftOrTop] = newPos + "px";
        }
        self.current[leftOrTop] = newPos;
    }

    this.slideMe = function(directionOrPosition, leftOrTop) {
        leftOrTop = this.fixFormat(leftOrTop);
        this.current[leftOrTop] = this.getCurrentPos(leftOrTop);
        this.end[leftOrTop] = this.getEndPos(directionOrPosition, leftOrTop);
        slideFunctions.animate(function() {return self.eachFrame(leftOrTop); });
    }

    this.verifyProps = function(leftOrTop) {
        if (this.slider == undefined) {
            throw new Error("basicSlider must have an element defined for `this.slider`");
        }
        if (this.numPositions[leftOrTop] == undefined || this.numPositions[leftOrTop] < 2) {
            throw new Error("basicSlider must have `this.numPositions." + leftOrTop + "` of at least 2");
        }
        if (this.slideWidth[leftOrTop] == undefined) {
            throw new Error("basicSlider must have a definition for `this.slideWidth." + leftOrTop + "`");
        }
        
    }
    
}

/* Everything below here is for testing */
// var slidingEl = {
//     offsetLeft: 0,
//     offsetTop: 0,
//     parentNode: {
//         scrollLeft: 0,
//         scrollTop: 0,
//     },
//     style: {
//         left: "0px",
//         top: "0px",
//     },
// }

// var slider = new basicSlider(.13,"offset");
// slider.slider = slidingEl;
// slider.current = {
//     Left: undefined,
//     Top: undefined,
// }
// slider.end = {
//     Left: undefined,
//     Top: undefined,
// }
// slider.slideWidth = {
//     Left: 100,
//     Top: 150,
// }

// slider.numPositions = {
//     Left: 5,
//     Top: 3,
// }
// slider.offset = {
//     Left: 0,
//     Top: 0,
// }
// console.log(slider.offset["Top"]);
// // console.log(slider.getEndPos("right","left"));
// slider.slideMe("up","top");
// console.log(slider.current.Top);
// slider.slideMe("up","top");
// console.log(slider.current.Top);
// slider.slideMe(4,"top");
// console.log(slider.end.Top);