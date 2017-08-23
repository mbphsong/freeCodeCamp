var direction;
var numPositions;
var distance;
var offset;
var cycleAtEnd;
var slider;
var currLeft;
var newLeft;
var reset;

function runAnimation () {
    direction = document.querySelector("#direction").value;
    direction = isNaN(direction) ? direction : parseInt(direction);
    numPositions = parseFloat(document.querySelector("#numPositions").value);
    distance = parseFloat(document.querySelector("#distance").value);
    offset = parseFloat(document.querySelector("#offset").value);
    cycleAtEnd = document.querySelector("#cycleAtEnd").value == "true" ? true : false;
    slider = document.querySelector(".slider");
     if (direction == "left" || direction == "right" || direction == "resetLeft") {
        currLeft = parseFloat(slider.offsetLeft);
        reset = "left";
	}
	else {
        currLeft = parseFloat(slider.offsetTop);
        reset = "top";
    }
	if (direction == "resetLeft" || direction == "resetTop") {
		direction = "reset";
	}
    newLeft = slideFunctions.getEndTopOrLeft(direction,currLeft,distance,numPositions,offset,cycleAtEnd);
    slideFunctions.animate(eachFrame);
    //eachFrame();
}

function eachFrame() {
    if (currLeft != newLeft) {
        var newPos = slideFunctions.lerp(currLeft, newLeft, .15);
    
	    if (reset == "left") {
            slider.style.left = newPos + "px";
	    }
        else {
            console.log(newLeft);
            slider.style.top = newPos + "px";
        }
        currLeft = newPos;
        return true;
    }
    else {
        return false;
    }
}
