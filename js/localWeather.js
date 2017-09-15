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
                getLocalWeather();
            } else {
                doAjaxStuff(points);
            }
        }, frequency);

        function convertTemp(measurement, currTemp) {
            var newTemp = measurement == "celsius" ? (currTemp - 32) / 1.8 : currTemp * 1.8 + 32;
            
            return Math.round(newTemp);
        }

        function getLocalWeather() {
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
            //clear any errors
            $(".location-error-message").html("").removeClass("alert").removeClass("alert-danger");
            //get location text
            $.ajax({
                url: "https://api.weather.gov/points/" + points,
                success: locSuccess,
                error: badLocation,
                cache: false
            });
            //get station so that can get current weather
            $.ajax({
                url: "https://api.weather.gov/points/" + points + "/stations",
                success: stationSuccess,
                error: clearData,
                cache: false
            });
            //get forecast
            $.ajax({
                url: "https://api.weather.gov/points/" + points + "/forecast",
                success: forecastSuccess,
                error: clearData,
                cache: false
            });
            
            function locSuccess(data) {
                console.log("loc success");
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
                console.log(currTemp);
                var conditions = props["textDescription"];
                var bg = props["icon"];
                var convertedTemp = units == "fahrenheit" ? convertTemp("fahrenheit",currTemp) : Math.round(currTemp);
                
                // if ($("#fahrenheit").hasClass("active")) {
                //     convertedTemp = convertTemp("fahrenheit",currTemp);
                //  }
                $(".current-weather .temp").html(convertedTemp);
                $("#current .conditions").html(conditions);
                setWeatherIcon(bg,conditions);
            }
            function forecastSuccess(data) {
                var periods = data["properties"]["periods"];
                if (!periods[0]["isDaytime"]) {
                    var xtra = periods[0];
                    periods.unshift(xtra);
                    $("#collapse-0 .forecast.first").hide();
                } else {
                    $("#collapse-0 .forecast.first").show();
                }

                for (var i=0; i<7; i++) {
                    var panelInfo = {
                        per0: periods[i * 2],
                        per1: periods[i * 2 + 1],
                    }
                    var dayText = i == 0 ? "Today" : panelInfo.per0["name"];
                    // var panel = $("#collapse-" + i);

                    $("#day-" + i + " h4 a").html(dayText);

                    $("#collapse-" + i + " .panel-body").each(function fillPanels(index) {
                        var thisPanelInfo = panelInfo["per" + index];
                        var thisPanel = $(this);
                        var highLow = thisPanelInfo["isDaytime"] ? "High: " : "Low: ";
                        var forecastTemp = (thisPanelInfo["temperatureUnit"] == "F" && units == "celsius") || (thisPanelInfo["temperatureUnit"] == "C" && units == "fahrenheit") ? convertTemp(units,thisPanelInfo["temperature"]) : thisPanelInfo["temperature"];
                        
                        thisPanel.find("h5").html(thisPanelInfo["name"]);
                        thisPanel.find("img").attr("src",thisPanelInfo["icon"]);
                        thisPanel.find(".hiLo").html(highLow);
                        thisPanel.find(".temp").html(forecastTemp);
                        thisPanel.find(".wind").html("Wind: " + thisPanelInfo["windDirection"] + " " + thisPanelInfo["windSpeed"]);
                        thisPanel.find(".short").html(thisPanelInfo["shortForecast"]);
                    });
                }
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
                    case "Mostly Clear":
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

        function clearData(data) {
            var locText = weatherLocation == "local" ? "your location" : "the specified location";
            $(".location").html("Weather data is unavailable at this time for " + locText + ".");

            $(".temp").html("--");
            $(".current-weather i").attr("class","wi wi-na");
            $(".conditions").html("");
            $(".wind").html("Wind: --");
            $(".short").html("");
            $(".forecast img").attr("src","");
            $("#station").html("-unavailable-");
        }

        function badLocation(data) {
            $(".location-error-message").html("We're sorry, we are unable to find weather data for the specified location").addClass("alert").addClass("alert-danger");
    
        }

        function flipActive(group,selected) {
            $(group).find("button").removeClass("active");
            $("#" + selected).addClass("active");

        }
        function toggleUnits(unitsGroup, selected) {
            if (!$("#" + selected).hasClass("active")) {
                //make sure we didn't click the current active button
                var dispMeas = selected == "celsius" ? "C" : "F";
                var newTemp;
                units = selected;
                flipActive(unitsGroup, selected);
                // newTemp = updateTemp(units, $(".temp").text());
                // $(".temp").html(newTemp);
                $(".temp").each(function uT() {
                    newTemp = convertTemp(selected,$(this).text());
                    $(this).html(newTemp);
                });
                $(".measurement").html(dispMeas);
            }
        }

        function getChosenWeather(locInputField) {
            var targetLoc = $(locInputField).val();

            $.ajax({
                url: "https://maps.google.com/maps/api/geocode/json?address=" + targetLoc.replace(/ /g, "+"),
                success: googSuccess,
                error: badLocation,
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

                    getLocalWeather();
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
        getLocalWeather();
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

