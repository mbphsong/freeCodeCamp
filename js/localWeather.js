$(document).ready(function dR() {
    setUpApp();
    getCurrentWeather();

    function setUpApp() {
        $("#chooseMeas").on("click", function measClick(e) { 
            var selected = e.target.id;

            if (!$("#" + selected).hasClass("active")) {
                //make sure we didn't click the current active class
                $(this).find("button").each(function togClass() {
                    this.classList.toggle("active");
                });
                
                updateTemp(selected, $(".temp").text());
            }
        });

    }

    function updateTemp(measurement, currTemp) {
        var dispMeas = measurement == "celsius" ? "C" : "F";
        var newTemp = measurement == "celsius" ? (currTemp - 32) / 1.8 : currTemp * 1.8 + 32;
        $(".temp").html(Math.round(newTemp));
        $(".measurement").html(dispMeas);
    }
    
    function getCurrentWeather() {
        if (!navigator.geolocation) {
            $(".location").html("Location services not available in your browser");
            return;
        }

        navigator.geolocation.getCurrentPosition(function gCP(position) {
            var points = position.coords.latitude + "," + position.coords.longitude;

            doAjaxStuff(points);
        });

        function doAjaxStuff(points) {
            $.ajax({
                url: "https://api.weather.gov/points/" + points,
                success: locSuccess,
                cache: false
            });
        
            $.ajax({
                url: "https://api.weather.gov/points/" + points + "/stations",
                success: stationSuccess,
                cache: false
            });
            
            function locSuccess(data) {
                var location = data["properties"]["relativeLocation"]["properties"];
    
                $(".location").html(location["city"] + ", " + location["state"]);
            }
            
            function stationSuccess(data) {
                var station = data["features"][0]["id"];
    
                $.ajax({
                    url: station + "/observations/current",
                    success: obsSuccess,
                    cache: false
                });
            }
    
            function obsSuccess(data) {
                var props = data["properties"];
                var currTemp = props["temperature"]["value"];
                var conditions = props["textDescription"];
                var bg = props["icon"];
                var weatherIcon = "wi-";
    
                if ($("#fahrenheit").hasClass("active")) {
                    updateTemp("fahrenheit",currTemp);
                } else {
                    $(".temp").html(currTemp);
                }
    
                $(".conditions").html(conditions);
                $(".scenic").css("background-image","url(" + bg + ")");
                if((/day/).test(bg)) {
                    //daytime
                    weatherIcon += "day-";
                }
                else {
                    weatherIcon += "night-";
                }
    
                weatherIcon += conditions.replace(/ /g,"-").toLowerCase();
                $(".current-weather i").attr("class","wi " + weatherIcon);
            }
        }

    }
});

