$(document).ready(function dR() {
    //if wanting to use this after the end of 2018, will have to update `twitchAjax` to use new API
    //and `success` functions to use new format of data response
    var twitchAPI = twitchModule();

    twitchAPI.addFeatured();
    twitchAPI.addChannel("freeCodeCamp");
    setClicks();
    // twitchAPI.getStreams("OgamingSC2");

    function twitchAjax() {
        // var url = "https://wind-bow.gomix.me/twitch-api/";
        var url = "https://api.twitch.tv/kraken/";
        var clientID = "63jqvy9ekwcjtr434cripgk02xv8ce";
        function query(params) {
            // var sendURL = url + params.endpoint + "/" + params.login + "?callback=";
            var sendURL = url + params.endpoint + "/" + params.login + "?limit=10&client_id=" + clientID + "&callback=";
            var xhttp = new XMLHttpRequest();

            xhttp.onreadystatechange = function() {
                if (this.readyState == 4) {
                    //answer is ready
                    if (this.status == 200) {
                        //successful result
                        var data = JSON.parse(xhttp.responseText);
                        if (typeof params.success === "function") {
                            params.success(data);
                        }
                    } else {
                        //error
                        if (typeof params.error === "function") {
                            params.error(data);
                        }
                    }
                }
            }

            xhttp.open("GET", sendURL, true);
            xhttp.send();
        }

        return {
            getFeatured: function(params) {
                params.login = "featured";
                params.endpoint = "streams";
                query(params);
            },
            getChannel: function(params) {
                params.endpoint = "channels";
                query(params);
            },
            getStream: function(params) {
                params.endpoint = "streams";
                query(params);
            }
        }
    }

    function twitchModule() {
        var twitchInterface = twitchAjax();
        var cloneSrc = $("#cloneMe");
        var chCont = $("#channelContainer");
        var searchInp = $("#searchTwitch input");

        function featuredSuccess(data) {
            console.log("success featured");
            var features = data.featured;

            for (var i=0; i<features.length; i++) {
                var login = features[i].stream.channel.display_name.toLowerCase();
                var gF = function () {newFeatured(login,features[i]);}
                checkExists(login,gF);
            }
            
            function newFeatured(login,feature) {
                var newTwitch = setClone(login);
                setUpDetails(newTwitch,feature.stream.channel);
                addChannelToPage(newTwitch);
                makeLive(newTwitch);
            }
        }

        function featuredError(data) {
            console.log("error featured");
        }

        function addFeatured() {
            twitchInterface.getFeatured({
                success: featuredSuccess,
                error: featuredError
            });
        }

        function addChannel(login) {
            //hide alert
            $("#searchAlert").hide();
            $("#techAlert").hide();
            login = htmlSafe(login);
            console.log("login",login);

            checkExists(login,function nC() { newChannel(login);});

        }

        function addChannelToPage(twitch) {
            
                chCont.prepend(twitch);
                setTimeout(function shTO() {
                    twitch.addClass("show");
                },100);
            
        }

        function htmlSafe(value) {
            var htmlEnt = {
                "m&": "&amp;",
                "m<": "&lt;",
                "m>": "&gt;",
                'm"': '&quot;',
                "m'": "&apos;",
              };
              
              return value.replace(/[&<>"']/g,function(matched) { return htmlEnt["m" + matched]; });
        }

        function newChannel(login) {
            var newTwitch = setClone(login);

            //get channel information
            twitchInterface.getChannel({
                login: login,
                success: channelsSuccess,
                error: channelsError
            });

            function channelsSuccess(data) {
                console.log("success channels");
                if (data.error) {
                    channelsError(data);
                    return;
                }
                searchInp.val("");
                setUpDetails(newTwitch, data);
                //add to page
                addChannelToPage(newTwitch);
                //get live/offline status
                twitchInterface.getStream({
                    login: login,
                    success: streamsSuccess,
                    error: streamsError
                });
            }
    
            function channelsError(data) {
                console.log("error channels");
                $(newTwitch).remove();

                if (data == undefined) {
                    $("#techAlert").show();
                } else {
                    $("#searchAlert").show();
                }
            }

            function streamsSuccess(data) {
                console.log("success streams");
                if (data.stream == null) {
                    makeOffline(newTwitch);
                } else {
                    makeLive(newTwitch);
                }
            }
    
            function streamsError(data) {
                console.log("error streams");
                makeOffline(newTwitch);
            }
        }

        function numberWithCommas(x) {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
        
        function removeAll() {
            if (confirm("Are you sure you want to remove all channels?")) {
                $(".channel").each(function rA() {
                    if (this != cloneSrc) {
                        removeChannel($(this));
                    }
                });
            }
        }
        function removeChannel(thisChannel) {
            thisChannel.removeClass("show");
            setTimeout(function rcTO() {
                thisChannel.remove();
            }, 1000);
        }

        function setClone(login) {
            var newCh = cloneSrc.clone().attr("id",login.toLowerCase()).appendTo(chCont);

            return newCh;
        }

        function showSelected(btnGroup,selected) {
            var dataShow = $(selected).attr("data-show");

            if (!selected.classList.contains("active")) {
                btnGroup.find("button").removeClass("active");
                selected.classList.add("active");
            }
             
            if (dataShow == "all") {
                $(".channel").addClass("show");
                cloneSrc.removeClass("show");
            } else {
                $(".channel").each(function sL() {
                    if ($(this).find(".status").hasClass(dataShow)) {
                        $(this).addClass("show");
                    } else {
                        $(this).removeClass("show");
                    }
                });
            }

        }

        function setUpDetails(newTwitch, data) {
            //set up details
            $(newTwitch).find(".name a").attr("href", data.url).html(data.display_name);
            $(newTwitch).find(".game").html(data.game);
            $(newTwitch).find(".year").html(new Date(data.created_at).getFullYear());
            $(newTwitch).find(".views").html(numberWithCommas(data.views));
            $(newTwitch).find(".followers").html(numberWithCommas(data.followers));
            if(data.profile_banner != null) {
                $(newTwitch).find(".bg .flipper").css("background-image", "url('" + data.profile_banner + "')");
            }
            else if (data.profile_banner_background_color  != null) {
                $(newTwitch).find(".bg").css("background-color", data.profile_banner_background_color);
            }

            $(newTwitch).find(".deleteChannel").on("click", function dcC(e) {
                e.preventDefault();
                console.log("ha");
                removeChannel(newTwitch);
            })
        }

        function checkExists(login,newCallback) {
            if($("#" + login.toLowerCase()).length) {
                console.log("have");
                //already have stream in list, move to top
                var twitch = $("#" + login.toLowerCase());
                twitch.removeClass("show");
                setTimeout(function addTO() {
                    addChannelToPage(twitch);
                }, 1000);
                //clear input
                searchInp.val("");
            }
            else {
                //get info for new channel
                console.log("have not");
                newCallback();
            }
        }

        function makeLive(newTwitch) {
            $(newTwitch).find(".status").removeClass("offline").addClass("live").html("Live");
        }

        function makeOffline(newTwitch) {
            $(newTwitch).find(".status").removeClass("live").addClass("offline").html("Offline");
        }

        return {
            addFeatured: addFeatured,
            addChannel: addChannel,
            showSelected: showSelected,
            removeAll: removeAll
        }
    }

    function setClicks() {
        $("#searchTwitch button").on("click",function stC(e) {
            console.log("submit");
            e.preventDefault();
            twitchAPI.addChannel($("#searchTwitch input").val());
        });
        $("#getFeatured").on("click",function gfC(e) {
            e.preventDefault();
            twitchAPI.addFeatured();
        });
        $("#showType").on("click",function stC(e) {
            e.preventDefault();
            twitchAPI.showSelected($(this),e.target);
        });
        $("#deleteAll").on("click", function daC(e) {
            e.preventDefault();
            twitchAPI.removeAll();
        });
    }
});