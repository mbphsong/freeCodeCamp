var direction;
var numPositions;
var distance;
var offset;
var cycleAtEnd;
var slider;
var currLeft;
var newLeft;

function runAnimation () {
    direction = document.querySelector("#direction").value;
    direction = isNaN(direction) ? direction : parseInt(direction);
    numPositions = parseFloat(document.querySelector("#numPositions").value);
    distance = parseFloat(document.querySelector("#distance").value);
    offset = parseFloat(document.querySelector("#offset").value);
    cycleAtEnd = document.querySelector("#cycleAtEnd").value == "true" ? true : false;
    slider = document.querySelector(".slider");
    if (direction == "left" || direction == "right") {
        currLeft = parseFloat(slider.offsetLeft);
	}
	else {
		currLeft = parseFloat(slider.offsetTop);
    }
    newLeft = slideFunctions.getEndTopOrLeft(direction,currLeft,distance,numPositions,offset,cycleAtEnd);
    slideFunctions.animate(eachFrame);
    //eachFrame();
}

function eachFrame() {
    if (currLeft != newLeft) {
        var newPos = slideFunctions.lerp(currLeft, newLeft, .15);
    
	    if (direction == "left" || direction == "right") {
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
