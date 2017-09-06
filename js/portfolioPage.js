$(document).ready(function dR() {
    spLinks();
});

function spLinks() {
    var currActive = 0;
    var anchors = [];
    var lastTop = document.body.scrollTop;
    var waitSize = 10;
    var resizeTimer;

    $(window).on("resize", function wR() {
        //use timeout so it doesn't recalculate until finished resizing
        clearTimeout(resizeTimer);

        resizeTimer = setTimeout(function timer() {
            resetSizes();
        }, 10);
    });

    $(window).on("scroll", function wS() {
        checkPos();
    });

    function checkPos() {
        var currTop = document.body.scrollTop;

        function comparePositions(index) {
            if (anchors[index].topPos <= currTop && currTop <= anchors[index].endPos) {
                lastTop = currTop;
                updateCurrent(index);
                return;
            }
        }

        if (currTop >= lastTop + waitSize) {
            //scrolled far enough down
            for (var i=currActive; i<anchors.length; i++) {  
                comparePositions(i);
            }
        } else if (currTop <= lastTop - waitSize) {
            //scrolled far enough up
            for (var i=currActive; i>=0; i--) {
                comparePositions(i);
            }
        }
    }
    
    function updateCurrent(linkIndex) {
        if (linkIndex != currActive) {
            anchors[currActive].linkEl.classList.remove("active");
            currActive = linkIndex;
            anchors[currActive].linkEl.classList.add("active");
        }
    }
    
    function resetSizes() {
        var docHeight = $(document).outerHeight(true);
        var winHeight = $(window).outerHeight(true);
        
        var lastLink = anchors.length - 1;
        anchors[lastLink].endPos = docHeight;
        anchors[lastLink].topPos = Math.min($(anchors[lastLink].el).offset().top, docHeight - winHeight - waitSize);
       
        for (var i=anchors.length - 2; i>=0; i--) {
            anchors[i].endPos = anchors[i+1].topPos - 1;
            anchors[i].topPos = $(anchors[i].el).offset().top;
        }
    }

    $("nav li a[href^='#'").each(function loopLinks(index) {
        //loop through links and add to `anchors`
        var divID = $(this).attr("href");

        anchors[index] = {
            el: $("" + divID),
            linkEl: this,
            topPos: 0,
            endPos: 0,
        }
        this.onclick = function clicked() {
            updateCurrent(index);
        }
    });

    resetSizes();
}