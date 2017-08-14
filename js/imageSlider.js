function imageSlider(sliderContainer, fraction, scrollOrOffset) {
    this.container = sliderContainer;
    this.slider = this.container.querySelector(".image-slider");
    this.numImages = this.slider.querySelectorAll(".slide").length;
    this.slideWidth = parseFloat(this.slider.offsetWidth) / this.numImages;
    this.nextControl = this.container.querySelector(".image-slider-next");
    this.prevControl = this.container.querySelector(".image-slider-prev");
    this.playPauseControl = this.container.querySelector(".image-slider-pause");
    this.currentLeft = parseFloat(this.slider.offsetLeft);
    this.jumpControls = this.container.querySelectorAll(".jump-slide-control");
    this.moveMethod = scrollOrOffset || "offset";
    this.slideIt;
    this.pauseTime;

    var self = this;

    myFuncs.resizeWindowFunc(function() {self.resetSizes(self); });

    if (this.moveMethod != "scroll" && this.moveMethod != "offset") {
        throw new SyntaxError("`scrollOrOffset` must be either `scroll` or `offset`.  Passed value of `" + scrollOrOffset + "` not valid.");
    }

    //set up control actions
    if (this.jumpControls.length > 0) {
        for (var i=0; i<this.jumpControls.length; i++) {
            var jControl = this.jumpControls[i];
            jControl.jumpIndex = i;
            jControl.onclick = function () {
                self.playPause("pause");
                self.slideMe(this.jumpIndex);
            }
        }
    }
    if (this.nextControl) {
        this.nextControl.onclick = function () {
            self.playPause("pause");
            self.slideMe("left");
        }
    }
    if (this.prevControl) {
        this.prevControl.onclick = function () {
            self.playPause("pause");
            self.slideMe("right");
        }
    }
    if (this.playPauseControl) {
        this.playPauseControl.onclick = function() {
            self.playPause("toggle");
        }
    }

    //set up touch events
    this.slider.addEventListener("touchstart",function(e) {
        self.playPause("pause");
        if (self.moveMethod == "scroll") {
            self.slider.parentNode.style.overflowX = "scroll";
        }
    });
    this.container.addEventListener("touchend",function(e) {
        if (self.moveMethod == "scroll") {
            self.slider.parentNode.style.overflowX = "hidden";
        }
        self.slideMe("reset");
    })

    //imageSlider methods
    this.autoSlide = function (autoSlideDelay) {
        self.autoSlideDelay = autoSlideDelay;
        this.slideIt = setInterval(function () {
            self.slideMe("left");
        }, self.autoSlideDelay);
    }

    this.eachFrame = function () {
        if (self.currentLeft != self.endLeft) {
            var newPos = slideFunctions.lerp(self.currentLeft, self.endLeft, fraction);
            if (self.moveMethod == "scroll") {
                newPos = Math.round(newPos);
                if (newPos == self.currentLeft) {
                    newPos = self.endLeft - self.currentLeft > 0 ? self.currentLeft + 1 : self.currentLeft - 1;
                }
                self.slider.parentNode.scrollLeft = newPos;
            }
            else {
                self.slider.style.left = newPos + "px";
            }
            self.currentLeft = newPos;
            return true;
        }
        else {
            return false;
        }
    }

    this.playPause = function(action) {
        var button = this.playPauseControl.querySelector("i");
        if (button.classList.contains("fa-pause-circle-o") || action == "pause") {
            clearInterval(this.slideIt);
        }
        else {
            this.autoSlide(this.autoSlideDelay);
        }
        if (action == "toggle") {
            button.classList.toggle("fa-pause-circle-o");
            button.classList.toggle("fa-play-circle-o");
        }
        else if(action == "pause") {
            button.classList.remove("fa-pause-circle-o");
            button.classList.add("fa-play-circle-o");
            clearTimeout(this.pauseTime);
            this.pauseTime = setTimeout(function() {
                this.autoslide(this.autoSlideDelay);
            }, 20 * 1000);
        }
        else {
            button.classList.add("fa-pause-circle-o");
            button.classList.remove("fa-play-circle-o");
        }
    }

    this.resetSizes = function(self) {
        self.slideWidth = parseFloat(self.slider.offsetWidth) / self.numImages;
        self.slideMe("reset");
    }

    this.slideMe = function (directionOrPosition) {
        if (this.moveMethod == "scroll") {
            this.currentLeft = this.slider.parentNode.scrollLeft;
            this.endLeft = Math.round(slideFunctions.getEndTopOrLeft(directionOrPosition, this.currentLeft * -1, this.slideWidth, this.numImages, 0, true) * -1);
        }
        else {
            this.currentLeft = parseFloat(this.slider.offsetLeft);
            this.endLeft = slideFunctions.getEndTopOrLeft(directionOrPosition, this.currentLeft, this.slideWidth, this.numImages, 0, true);
        }
        slideFunctions.animate(this.eachFrame);
    }
}
