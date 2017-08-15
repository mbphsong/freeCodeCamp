function imageSlider(sliderContainer, fraction, scrollOrOffset) {
    var bSlider = new basicSlider(fraction, scrollOrOffset,true);
    this.container = sliderContainer;
    bSlider.slider = this.container.querySelector(".image-slider");
    bSlider.numPositions.Left = bSlider.slider.querySelectorAll(".slide").length;
    bSlider.slideWidth.Left = parseFloat(bSlider.slider.offsetWidth) / bSlider.numPositions.Left;
    this.nextControl = this.container.querySelector(".image-slider-next");
    this.prevControl = this.container.querySelector(".image-slider-prev");
    this.playPauseControl = this.container.querySelector(".image-slider-pause");
    this.jumpControls = this.container.querySelectorAll(".jump-slide-control");
    this.slideIt;
    this.pauseTime;

    var self = this;

   

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
    bSlider.setScrollTouchEvents("left",function() {self.playPause("pause"); })
    
    //imageSlider methods
    this.autoSlide = function (autoSlideDelay) {
        self.autoSlideDelay = autoSlideDelay;
        this.slideIt = setInterval(function () {
            self.slideMe("left");
        }, self.autoSlideDelay);
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

    this.slideMe = function (directionOrPosition) {
        bSlider.slideMe(directionOrPosition,"left");
    }
}
