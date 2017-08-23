/* use .mobile-nav for div that has the mobile nav ul and list

   Defaults to right side alignment.  To put on the left side, add class "left-side" to the .mobile-nav div
   Class "little-lines" on a div with three <p>&nbsp;</p> inside it will create the little button

   For sliding menu:
   	 class "slider" on the ul that is to slide - must be inside .mobile-nav
     class "menu-button" on the div with the text/button/whatever to open and close the sliding menu
	 
   Call with setMobileNav();

*/
function setMobileNav() {
	var mobileNavs = {
		navLinks: document.getElementsByClassName("mobile-nav"),
		init: function() {
			for (i=0; i<this.navLinks.length; i++) {
				var thisLink = this.navLinks[i];
				thisLink.show = false;
				thisLink.slide = thisLink.className.indexOf("slide-out") > -1 ? true : false;
				
				if (thisLink.slide) {

					var sideOfPage = thisLink.classList.contains("left-side") ? "left" : "right";
					thisLink.slider = menuSlider(thisLink,sideOfPage,.13);
				}

				this.setEvents(thisLink);
			}
        },
        setEvents: function(thisLink) {
			var self = this;
			if (thisLink.slide) {
				thisLink.slider.menuButton.slider.onclick = function() {
					this.slideMe("left");
				}
			}
			else {
				thisLink.onclick = function() {
					self.showHideMenu(this);
				};
			}
        },
        showHideMenu: function(thisLink) {
			myFuncs.changeClass(thisLink,"hover",!thisLink.show);
			thisLink.show = !thisLink.show;
		},
	}
	
	mobileNavs.init();
	
}

function menuSlider(menuContainer, sideOfPage, speedFraction) {
	var container = menuContainer;
	//set up menu object
	var menu = new basicSlider(speedFraction, "offset",true);
	menu.slider = container.querySelector(".slider");
	menu.numPositions.Left = 2;
	//set up menuButton object
	menu.menuButton = new basicSlider(speedFraction,"offset",true);
	menu.menuButton.slider = container.querySelector(".menu-button");
	menu.menuButton.numPositions.Left = 2;

	var slideDir;
	var startPos;
	var stopPos;
	var moving = false;
	// var self = this;

	menu.eachFrame = function() {
		//determine whether or not the menu should still be moving
		if (this.current.Left != this.end.Left) {
			//menu is not lined up with end yet; move another frame
			var newPos = this.getNewPos("left");

			if ((startPos <= this.current.Left && this.current.Left <= stopPos) || 
			(stopPos <= this.current.Left && this.current.Left <= startPos)) {
				//menu is within the range that menuButton should be moving
				//set `moving` to true so we know when we are out of range
				moving = true;
				//move menuButton (menu left position plus slideOffset)
				this.menuButton.setNewPos("left",newPos + this.menuButton.slideOffset);
			}
			else if (moving) {
				//menuButton has been moving, but menu is now past stopPos
				//change `moving` to false so we know that we are done moving menuButton
				moving = false;
				//set menuButton to where it should stop (menu left position plus slideOffset)
				this.menuButton.setNewPos("left",stopPos + this.menuButton.slideOffset);
			}
			//move menu to position for this frame
			this.setNewPos("left",newPos);
			//return `true` to the animation method - run again!
			return true;
		}
		else {
			//menu current is same as menu end
			if (slideDir == sideOfPage) {
				//if closed, reset border-styling
				this.menuButton.slider.classList.remove("moving");
			}
			if (moving) {
				//edge case of menu not moving between startPos & stopPos,
				//ie right side on original slideMe(0)
				moving = false;
				//set menuButton to where it should stop (menu left position plus slideOffset)
				this.menuButton.setNewPos("left",stopPos + this.menuButton.slideOffset);
			}
			//return `false` to the animation method - we're done moving
			return false;
		}
	}

	menu.menuButton.resetSizes = function(menu) {
		//do nothing
		// console.log("in mB resetSize");
	}
	
	menu.resetSizes = function(menu) {
		// console.log("in menu resetSizes");
		menu.setWidths();
		menu.setOffsets();
		//slide it offscreen - that way we don't have to worry about whether open or closed
		if (sideOfPage == "right") {
			menu.slideMe(0);
		}
		else {
			menu.slideMe(1);
		}
	}

	menu.setWidths = function() {
		menu.slideWidth.Left = menu.slider.offsetWidth;
		menu.menuButton.slideWidth.Left = menu.slideWidth.Left;
	}

	menu.setOffsets = function() {
		//set offset for getEndPos - if on the right side of the page, we offset the width of the menuButton; 
		//left side, we offset the width of the menu.  This is to keep menuButton visible when menu is offscreen
		this.menuButton.offset.Left = sideOfPage == "right" ? this.menuButton.slider.offsetWidth * -1 : this.slideWidth.Left;
		//set the amount we add to the `newPos` for the menu to get the newPos for menuButton while sliding
		//right side, it should be lined up on the left, so same left position; left side, it should be lined up on the
		//right, so the menu width less the menuButton width
		this.menuButton.slideOffset = sideOfPage == "right" ? 3 : this.slideWidth.Left - (this.menuButton.slider.offsetWidth + 3);
	}

	menu.menuButton.slider.slideMe = function(directionOrPosition) {
		menu.slideMe(directionOrPosition);
	}

	menu.slideMe = function(directionOrPosition)  {
		this.current.Left = this.getCurrentPos("left");
		this.end.Left = this.getEndPos(directionOrPosition,"left");
		this.menuButton.current.Left = this.menuButton.getCurrentPos("left");
		this.menuButton.end.Left = this.menuButton.getEndPos(directionOrPosition,"left");

		if (isNaN(directionOrPosition)) {
			slideDir = this.end.Left < this.current.Left ? "left" : "right";
		}
		else {
			slideDir = directionOrPosition == 0 ? "right" : "left";
		}

		//set at what "current" menu position the menuButton should be sliding
		if (slideDir == sideOfPage) {
			//if sliding offscreen, start moving immediately
			startPos = this.current.Left;
			//stop moving when menuButton has reached its end position (menuButton end left position
			//less the distance it keeps from the menu left position while sliding)
			stopPos = this.menuButton.end.Left - this.menuButton.slideOffset;
		}
		else {
			//if sliding onscreen, wait to move until menu has lined up with menuButton
			//so menuButton current position less the distance it keeps from the menu
			//left position while sliding
			startPos = this.menuButton.current.Left - this.menuButton.slideOffset;
			//stop when menu stops - don't want to slide past
			stopPos = this.end.Left;
		}
		//add class `moving` for purposes of border-styling
		this.menuButton.slider.classList.add("moving");
		slideFunctions.animate(function() {return menu.eachFrame(); });
	}

	//set our widths and offset numbers (in function so that we can reset them on a screen-size change)
	menu.resetSizes(menu);

	return menu;
}