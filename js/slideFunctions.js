// requestAnimationFrame = function(callback){console.log(currLeft); callback();}
// cancelAnimationFrame = function(requestID){clearTimeout(requestID)}

var slideFunctions = {
    lerp: function(startPos,endPos, fraction) {
        if (Math.abs(endPos - startPos) > 1) {
            return (endPos - startPos) * fraction + startPos;
        }
        else {
            return endPos;
        }
    },
    getEndTopOrLeft: function(slideToPosition, currentLeft,positionWidth,numberPositions, offset,cycleAtEnd) {
        currentLeft = currentLeft - offset;
        var currPosition = Math.abs(Math.round(currentLeft/positionWidth));
        var endPosition;
        var farthestSlide = (numberPositions - 1) * positionWidth * -1;
        switch(slideToPosition) {
            case "reset":
                console.log("position: " +  slideToPosition);
                endPosition = currPosition;
                break;
            case "left":
            case "up":
                console.log("position: " +  slideToPosition);
                if (currPosition == numberPositions - 1) {
                    endPosition = cycleAtEnd ? 0 :currPosition;
                }
                else {
                    endPosition = currPosition + 1;
                }
                break;
            case "right":
            case "down":
                console.log("position: " +  slideToPosition);
                if (currPosition == 0) {
                    endPosition = cycleAtEnd ? numberPositions - 1 : currPosition;
                }
                else {
                    endPosition = currPosition - 1;
                }
                break;
            default:
                console.log("position: " +  slideToPosition);
                if (!isNaN(slideToPosition)) {
                    if (slideToPosition < numberPositions && slideToPosition >= 0) {
                        endPosition = slideToPosition;
                    }
                    else {
                        endPosition = currPosition;
                        console.log("Warning: Position `" + slideToPosition + "` does not exist.  Positions must be between `0` and `" + (numberPositions-1) + "`.");
                    }
                }
                else {
                    endPosition = currPosition;
                    console.log("Warning: slideToPosition `" + slideToPosition + "` is not valid.  Please pass `up`, `down`, `left`, `right`, `reset`, or an integer. \n endPosition of currPosition `" + endPosition + "` returned.");
                }
                break;
        }
        return (endPosition * positionWidth  * -1) + offset;
    },
    animate: function(callback) {
        console.log(callback());
        if (callback()) {
            console.log('result');
            requestAnimationFrame(function() {
                slideFunctions.animate(callback);
            });
        }
    },
}
/* Everything past here is just testing stuff - not for actual use! */
var endLeft;
var nextPos;
var currLeft;
function test(slideToPosition, currentLeft,positionWidth,numberPositions, offset,cycleAtEnd) {
endLeft = slideFunctions.getEndTopOrLeft(slideToPosition, currentLeft,positionWidth,numberPositions, offset,cycleAtEnd);
currLeft = currentLeft;
//nextPos = slideFunctions.lerp(currLeft,endLeft,.1);
console.log(currLeft);
console.log(endLeft);

    //slideFunctions.animate(eachFrame);
// console.log(nextPos);
// currLeft = nextPos;
// nextPos = slideFunctions.lerp(currLeft,endLeft,.1);
// console.log(nextPos);
}

function eachFrame() {
    console.log(currLeft)
    if (currLeft != endLeft) {
        var newPos = slideFunctions.lerp(currLeft, endLeft, .1);
    
	    if (slidePos == "left" || slidePos == "right") {
            // slider.style.left = endLeft + "px";
	    }
        else {
            console.log(endLeft);
            // slider.style.top = endLeft + "px";
        }
        currLeft = newPos;
        return true;
    }
    else {
        cancelAnimationFrame;
        return false;
    }
}

var slidePos = 3;
var width = 100;
var numPos = 5;
var offset = 0;
var cycle = true;
test(slidePos,0,width,numPos,offset,cycle);
// test(slidePos,endLeft,width,numPos,offset,cycle);
// test(slidePos,endLeft,width,numPos,offset,cycle);
// test(slidePos,endLeft,width,numPos,offset,cycle);
// test(slidePos,endLeft,width,numPos,offset,cycle);