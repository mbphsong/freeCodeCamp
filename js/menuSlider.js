/* use .mobile-nav for div that has the mobile nav ul and list

   Defaults to right side alignment.  To put on the left side, add class "left-side" to the .mobile-nav div
   Class "little-lines" on a div with three <p>&nbsp;</p> inside it will create the little button

   For sliding menu:
   	 class "slider" on the ul that is to slide - must be child-node, not grandchild-node of .mobile-nav
     class "menu-button" on the div with the text/button/whatever to open and close the sliding menu
	 
   Call with setMobileNav();

*/
function setMobileNav() {
	var mobileNavs = {
		navLinks: document.getElementsByClassName("mobile-nav"),
		init: function() {
			this.docBody = document.getElementsByTagName("body")[0];
			for (i=0; i<this.navLinks.length; i++) {
				var thisLink = this.navLinks[i];
				thisLink.show = false;
				thisLink.slide = thisLink.className.indexOf("slide-out") > -1 ? true : false;
				//thisLink.sideFactor = thisLink.className.indexOf("left-side") > -1 ? 1 : -1;
				this.setEvents(thisLink);
				
				if (thisLink.slide) {
					//this.loopChildren(thisLink,this.findSlider);
					myFuncs.loopChildren(thisLink,this.findSlider,thisLink);
					this.setUpSlider(thisLink);
				}
			}
        },
        findSlider: function(thisChild,thisLink) {
			if (thisChild.className != undefined) {
					
				if (thisChild.className.indexOf("slider") > -1) {
					//fLog("have el");
					thisLink.slidingEl = thisChild;
				}
				if (thisChild.className.indexOf("menu-button") > -1) {
					thisLink.menuButton = thisChild;	
				}
			}
        },
        setEvents: function(thisLink) {
			var self = this;
			if (thisLink.slide) {
				thisLink.onclick = function() {
					//self.slideOut(this,self);
					this.slider.slideMe();
				}
			}
			else {
				thisLink.onclick = function() {
					self.showHideMenu(this);
				};
			}
        },
        showHideMenu: function(thisLink) {
			//this.addClass(thisLink,"hover",!thisLink.show);
			myFuncs.changeClass(thisLink,"hover",!thisLink.show);
			thisLink.show = !thisLink.show;
		},
	}
	
	mobileNavs.init();
	
}