/*  &copy; Erin Halbmaier 2017 
*   This is built on `basicSlider` from basicSlider.js.  
*   Pass in 1) the `sliderContainer` (if using accompanying .scss file, element with class `image-slider-container`) - slider and all controls
*   should be inside this element; 2) `fraction` - speed at which slide will occur (`.13` is slower than `.5`); 3) `scrollOrOffset` - whether
*   slide should use `style.left` or `scrollLeft` to move the slider. If `scroll`, it is possible to finger-scroll on touchscreens by setting
*   `overflow-x: scroll` on the slider's parentNode.  Default is `offset`.
*
*   If using accompanying .scss file, inside `div.image-slider-container` should be an `.image-slider-viewport`.  Inside this is the div holding 
*   the slides.
*   
*   The div holding the slides should have class `image-slider`.  Each slide should have class of `slide`.
*
*   To create controls that allow the user to move the slider on their own, use class `image-slider-next` on control to move right one position;
*   class `image-slider-prev` on control to move left one position; class `jump-slide-control` on controls to move to a particular slide (moves 
*   based on index within jumpControls, ie if you have 5 slides, you should have 5 controls, and clicking on the 3rd control will move to the 3rd
*   slide).  If using accompanying .scss file, also include class `image-slider-control` on all controls.  To get the same layout, inside the the 
*   next/prev controls should be a child element `i` with class of `fa fa-angle-right` or `fa fa-angle-left`, respectively.  `&nbsp;` inside jump 
*   controls.
*  
*   To enable autoslide, after creating object call `object.createAutoSlide(autoSlideDelay)` where `autoSlideDelay` is the amount of time in ms before
*   moving to the next slide.
*
*   To create control that allows user to play/pause the autoslide, use class `image-slider-pause` on control.  The control should have a child
*   element `i` with class `fa-play-circle-o`.  The script uses classes `fa-pause-circle-o` and `fa-play-circle-o` from FontAwesome to determine 
*   whether it is currently paused or playing and to display the appropriate information to the user (`fa-pause-circle-o` displays a pause button, 
*   so autoslide is on; `fa-play-circle-o` displays a play button, so autoslide is off). (These elements also require class `fa` for the FontAwesome
*   icons to display).
*
*   Requires basicSlider.js (which requires slideFunctions.js & myFuncs.js)
*/

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
            jControl.onclick = (function(index) {
                //must use `return` inside the IIFE or this function won't actually run
                //besides, I'm returning the function as the `onclick` function
                return function () {
                    self.playPause("pause");
                    self.slideMe(index);
                }
            })(i);
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
    if (bSlider.moveMethod == "scroll") {
        bSlider.setScrollTouchEvents("left",function() {self.playPause("pause"); })
    }

    //imageSlider methods
    this.autoSlide = function (autoSlideDelay) {
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
                self.playPause("play");
            }, 20 * 1000);
        }
        else {
            button.classList.add("fa-pause-circle-o");
            button.classList.remove("fa-play-circle-o");
        }
    }

    this.createAutoSlide = function (autoSlideDelay) {
        self.autoSlideDelay = autoSlideDelay;
        self.playPause("play");
    }

    this.slideMe = function (directionOrPosition) {
        bSlider.slideMe(directionOrPosition,"left");
    }
}
