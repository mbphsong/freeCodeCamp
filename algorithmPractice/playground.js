function dR() {
    var a = "foo";
    var outerApp = outer(passMe);

    function passMe(data) {
        console.log("pass",data,a);
    }

    outerApp.callMe(passMe);
}

function outer(origCallback) {
    function closedFunc() {
        console.log("closed");
    }

    origCallback("baz");

    function callMe(callback) {
        closedFunc();
        callback("bar");
    }

    return {callMe: callMe}
}

dR();



