$(document).ready(function dR() {
    var weatherApp = weatherModule(10 * 60 * 1000);
    var locInput = $("#locInput input");
    // setUpApp();
    // getCurrentWeather();
    setClicks();

    function weatherModule(updateFrequency) {
        var points;
        var frequency = isNaN(updateFrequency) ? 10 * 60 * 1000 : updateFrequency;
        var weatherLocation = "local";
        var units = "fahrenheit";
        var updateWeather = setInterval(function uW() {
            if(weatherLocation == "local") {
                getCurrentWeather();
            } else {
                doAjaxStuff(points);
            }
        }, frequency);

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
                points = position.coords.latitude + "," + position.coords.longitude;
    
                doAjaxStuff(points);
            });    
        }

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
                var station = data["features"][0];
                var stationLocation = station["properties"]["name"];
                $("#station").html(stationLocation);
    
                $.ajax({
                    url: station["id"] + "/observations/current",
                    success: obsSuccess,
                    cache: false
                });
            }
    
            function obsSuccess(data) {
                var props = data["properties"];
                var currTemp = props["temperature"]["value"];
                var conditions = props["textDescription"];
                var bg = props["icon"];
                
                if ($("#fahrenheit").hasClass("active")) {
                    updateTemp("fahrenheit",currTemp);
                } else {
                    $(".temp").html(currTemp);
                }
                
                $(".conditions").html(conditions);
                setWeatherIcon(bg,conditions);
            }
            
            function setWeatherIcon(bg, conditions) {
                var weatherIcon = "wi-";
                $(".scenic").css("background-image","url(" + bg + ")");
                if((/day/).test(bg)) {
                    //daytime
                    weatherIcon += "day-";
                }
                else {
                    weatherIcon += "night-";
                }
                switch (conditions) {
                    case "Sunny":
                    case "Partly Sunny":
                    case "Clear":
                        weatherIcon += "sunny";
                        break;
                    case "Cloudy":
                    case "Mostly Cloudy":
                    case "Partly Cloudy":
                        weatherIcon += "cloudy";
                        break;
                    case "Light Rain":
                    case "Light Rain with Fog":
                        weatherIcon += "rain";
                        break;
                    default:
                        weatherIcon += conditions.replace(/ /g,"-").toLowerCase();
                        break;
                }
                $(".current-weather i").attr("class","wi " + weatherIcon);
            }
        }

        function flipActive(group,selected) {
            $(group).find("button").removeClass("active");
            $("#" + selected).addClass("active");

        }
        function toggleUnits(unitsGroup, units) {
            if (!$("#" + units).hasClass("active")) {
                //make sure we didn't click the current active button
                flipActive(unitsGroup, units);
                updateTemp(units, $(".temp").text());
            }
        }

        function getChosenWeather(locInputField) {
            var targetLoc = $(locInputField).val();

            $.ajax({
                url: "https://maps.google.com/maps/api/geocode/json?address=" + targetLoc.replace(/ /g, "+"),
                success: googSuccess,
                cache: false
            });

            function googSuccess(data) {
                var coords = data["results"][0]["geometry"]["location"];
                points = coords.lat + "," + coords.lng;

                doAjaxStuff(points);
            }
        }

        function setLocation(locGroup, locType, locInputField) {
            if (!$("#" + locType).hasClass("active")) {
                //make sure we didn't click the current active button
                flipActive(locGroup,locType);
                weatherLocation = locType;

                if (locType == "local") {
                    //don't want to see input for other location if using local
                    $(locInputField).parent().hide();

                    getCurrentWeather();
                } else {
                    $(locInputField).parent().show();
                    if ($(locInputField).val() != "") {
                        //have value from before, go ahead and load weather
                        getChosenWeather(locInputField);
                    }
                }
            }

        }

        //set up initial data
        getCurrentWeather();
        return {
            toggleUnits: toggleUnits,
            setLocation: setLocation,
            getChosenWeather: getChosenWeather,
        }
    }

    function setClicks() {
        $("#chooseMeas").on("click", function measClick(e) { 
            weatherApp.toggleUnits(this,e.target.id);
        });
        $("#locType").on("click", function(e) {
            weatherApp.setLocation(this,e.target.id,locInput);
        });
        $("#locInput button").on("click", function(e) {
            e.preventDefault();
            weatherApp.getChosenWeather(locInput);
        });
    }
    $(locInput).parent().hide();
    
});

