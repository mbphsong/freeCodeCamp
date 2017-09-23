$(document).ready(function dR() {
    var searchCont = $("#searchWiki");
    var numResultsGr = $("#numResults");
    var paging = $("#paging");
    var scenic = $(".scenic");
    var img = document.querySelector(".scenic img");
    var imgRatio = img.naturalWidth / img.naturalHeight;

    var wikiApp = wikiModule(searchCont,$("#results"),numResultsGr,$("#suggestions"));

    setUpAnimation();
    setClicks();
    fixScenic();
    
    $(window).on("resize",function rW(e) {
        fixScenic();
    })

    function wikiModule(searchContainer,resultContainer,numResultsGroup,suggestionsUl) {
        var searchOffset = 0;
        var baseURL = "https://en.wikipedia.org";
        var apiEndPoint = "/w/api.php";
        var linkEndPoint = "/wiki/";
        var currResult = 0;
        var numResults = 10;
        var searchTerm = "";
        var resultUl = resultContainer.find("ul");
        var searchField = searchContainer.find("input");
        var submitted = false;
        var selectedLi = -1;
        var selectLis = [];
        var headers = {
            // "Origin": "https://s.codepen.io",
            "Content-Type": "application/json; charset=UTF-8"
        }

        function changeSuggested(direction) {
            var newSelection = direction == "down" ? Math.min(selectLis.length - 1,selectedLi + 1) : Math.max(-1,selectedLi - 1);
            // console.log(newSelection);

            if (selectedLi > -1) {
                //had a li highlighted, remove class
                selectLis[selectedLi].classList.remove("hover");
            }
            if (newSelection > -1) {
                //arrow moves to a li, add class
                selectLis[newSelection].classList.add("hover");
            }

            selectedLi = newSelection;
        }

        function getRandomArticle() {
            //must open window before ajax call or will be blocked as popup
            var newWindow = window.open("","_blank");
            $.ajax({
                url: baseURL + apiEndPoint,
                data: {
                    action: "query",
                    list: "random",
                    format: "json"
                },
                dataType: 'jsonp',
                headers: headers,
                success: randomSuccess,
                error: randomError,
                // jsonp: false,
                cache: false
            });

            function randomError(data) {
                $(".random-alert").addClass("alert").addClass("alert-warning").html("Oops! Something went wrong.");
            }

            function randomSuccess(data) {
                var title = data.query.random[0].title;
                var newLink = baseURL + linkEndPoint + title.replace(/ /g,"_");
                // console.log(newLink);
                newWindow.location.href = newLink;

                // console.log("finished");
            }
        }

        function runSearch(startingNumber) {
            suggestionsUl.empty();
            suggestionsUl.hide();
            currResult = startingNumber;
            
            //make sure we have something to search!
            //backup in case missed something somewhere else...
            if (searchTerm == "") {
                return;
            }

            $.ajax({
                url: baseURL + apiEndPoint,
                data: {
                    action: "query",
                    list: "search",
                    format: "json",
                    srsearch: searchTerm,
                    srprop: "timestamp|snippet",
                    srlimit: numResults,
                    sroffset: startingNumber,
                    continue:""
                },
                headers: headers,
                dataType: 'jsonp',
                success: searchSuccess,
                error: searchError,
                cache: false
            });

            function searchError(data) {
                resultUl.empty();
                resultUl.html("<li>An error occurred.</li>");
            }

            function searchSuccess(data) {
                var lis = [];
                var results = data.query.search;

                resultUl.empty();
                updatePaging(data.continue,data.query.searchinfo.totalhits);
                updateWikiSuggestion(data.query.searchinfo);

                if (results.length == 0) {
                    lis[0] = "<li>No results found</li>";
                    $(".prev").hide();
                    $(".next").hide();
                }
                
                for (var i=0; i<results.length; i++) {
                    var result = results[i];
                    var title = result.title;
                    var timestamp = new Date(result.timestamp);

                    lis[i] = "<li><a href='" + baseURL + linkEndPoint + title.replace(/ /g,"_") + "' target='_blank'><h5>" + title + "</h5><p class='snippet'>" + result.snippet + "</p><p class='timestamp'>Last Updated: " + timestamp.toUTCString() + "</p></a></li>";
                }

                resultUl.append(lis.join(""));

                setTimeout(function delaySuggestions() {
                    //allow time for the rest of the keystrokes to come through the queue 
                    submitted = false;
                    // console.log("delayed",submitted);
                },1000);
            }

            function updatePaging(srcontinue,totalhits) {
                var lastRes;
                var firstRes = totalhits == 0 ? 0 : currResult + 1;
                if(srcontinue != undefined) {
                    //at least one more page of results
                    searchOffset = srcontinue.sroffset;
                    lastRes = searchOffset;
                    $(".next").show();
                }
                else {
                    //no more pages, so hide "next" button
                    $(".next").hide();
                    lastRes = totalhits;
                }
                
                //show/hide "Prev" button
                if (startingNumber == 0) {
                    $(".prev").hide();
                } else {
                    $(".prev").show();
                }
                
                $(".firstRes").html(firstRes);
                $(".lastRes").html(lastRes);
                $(".totalRes").html(totalhits);
            }

            function updateWikiSuggestion(sInfo) {
                var wikiSuggest = $(".wikiSuggestions");
                if (sInfo.suggestion == undefined) {
                    wikiSuggest.html("");
                }
                else {
                    // console.log("wikiS",sInfo);
                    wikiSuggest.html("Did you mean <span class='searchmatch'>" + sInfo.suggestion + "</span>?");
                    wikiSuggest.find(".searchmatch").on("click", function(e) {
                        fillSearch(e.target);
                    })
                }
            }
        }

        function getNumResults(selected) {
            if (!selected.classList.contains("active")) {
                numResults = $(selected).attr("data-numResults");
                numResultsGroup.find("button").removeClass("active");
                selected.classList.add("active");
                if (searchField.val() != "" && searchTerm != "") {
                    runSearch(currResult);
                }
            }
        }

        function getMoreResults(direction) {
            if (direction.contains("prev")) {
                searchOffset = Math.max(0,currResult - numResults);
            } 
            runSearch(searchOffset);
        }

        function getSuggestions() {
            var partialSearch = searchField.val();
            if (!partialSearch == "") {
                $.ajax({
                    url: baseURL + apiEndPoint,
                    dataType: "jsonp",
                    headers: headers,
                    data: {
                        format: "json",
                        action: "opensearch",
                        search: partialSearch,
                        limit: 15
                    },
                    success: suggestionSuccess,
                    cache: false
                });
            } else {
                //clear suggestions if empty
                suggestionsUl.empty();
                suggestionsUl.hide();
            }
            
            function suggestionSuccess(data) {
                var lis = [];
                var suggestions = data[1];
                var term = data[0];
                term = regexAllWords(term);

                suggestionsUl.empty();
                suggestionsUl.hide();
                if (!submitted) {
                    // console.log("suggestions",term,submitted);
                    for (var i=0; i<suggestions.length; i++) {
                        var suggestion = suggestions[i];
                        // `$&` keeps the match so we keep uppercase/lowercase instead of putting in `term` and using its case
                        suggestion = suggestion.replace(term,"<span class='searchmatch'>$&</span>");
                        lis[i] = "<li>" + suggestion + "</li>";
                    }

                    suggestionsUl.show();
                    suggestionsUl.append(lis.join(""));

                    //fill selectLis and set click handlers
                    selectLis = [];
                    suggestionsUl.find("li").each(function(index) {
                        selectLis[index] = this;
                        $(this).on("click", function(e) {
                            fillSearch(e.target);
                        });
                    });
                }
            }
        }

        function newSearch() {
            searchTerm = searchField.val();
            submitted = true;
            selectedLi = -1;
            // console.log("newSearch",submitted);
            //make sure we have something to search!
            if (searchTerm == "") {
                return;
            }
            runSearch(0);
        }

        function regexAllWords(term) {
            term = escapeRegex(term);
            term = term.replace(/ /g,"|");
            return new RegExp(term,"gi");
        }

        function escapeRegex(value) {
            return value.replace(/[\-\[\]{}()*+?.,\\\^$|#]/g,"\\$&");
        }

        function fillSearch(selected) {
            // console.log("Filling search: " + $(selected).text());
            searchTerm = $(selected).text();
            searchField.val(searchTerm);
            selectedLi = -1;
            runSearch(0);
        }

        searchField.on("keyup", function(e) {
            var keyCode = (e.which) ? e.which : e.keyCode;

            switch (keyCode) {
                case 8: 
                    //backspace
                case 46:
                    //delete
                    setTimeout(function() { 
                        getSuggestions();
                    },1000);
                    break;
                case 32:
                    //space
                    getSuggestions();
                    break;
                case 38:
                    //up arrow
                    changeSuggested("up");
                    break;
                case 40:
                    //down arrow
                    changeSuggested("down");
                    break;
                default:
                    if (9 <= keyCode && keyCode <= 45) {
                        return;
                    } else {
                        getSuggestions();
                    }
            }
        });

        searchField.on("keydown", function(e) {
            var keyCode = (e.which) ? e.which : e.keyCode;
            if (keyCode == 9 || keyCode == 13) {
                if (selectedLi > -1) {
                    fillSearch(selectLis[selectedLi]);
                    return false;
                }
            }
        })

        searchField.on("blur", function(e) {
            setTimeout(function() {
                suggestionsUl.empty();
                suggestionsUl.hide();
            }, 500);
        });
        
        return {
            newSearch: newSearch,
            getRandomArticle: getRandomArticle,
            getNumResults: getNumResults,
            getMoreResults: getMoreResults,
        }
    }

    function setClicks() {
        searchCont.find("button").on("click", function swC(e) {
            e.preventDefault();
            wikiApp.newSearch();
        });
        $("#random").on("click", function rC(e) {
            wikiApp.getRandomArticle();
        });
        numResultsGr.on("click", function nrC(e) {
            wikiApp.getNumResults(e.target);
        });
        paging.on("click", function pagC(e) {
            wikiApp.getMoreResults(e.target.classList);
        });
    }

    function setUpAnimation() {
        // numResultsGr.hide();
        // paging.hide();
        $(".search-i").on("click", function anim(e) {
            this.classList.add("jump");
            searchCont.addClass("spread");
            searchCont.on("animationend webkitAnimationEnd oAnimationEnd",function endAnim(e) {
                searchCont.find("input").focus();
                numResultsGr.addClass("fade-in");
                paging.addClass("fade-in");
                $(".prev").hide();
                $(".next").hide();
            });
        });
    }

    function fixScenic() {
        var winWidth = $(window).width();
        var winHeight = $(window).height();
        var left = "-50%";
        var top = "0";
        var newWidth = "";
        var newHeight = "";


        if (imgRatio * winHeight > winWidth * 2) {
            newWidth = imgRatio * winHeight;
            left = ((newWidth - winWidth) / 2 * -1) + "px";
            newHeight = winHeight;
        } else if(imgRatio * winHeight < winWidth) {
            newHeight = winWidth / imgRatio;
            console.log(newHeight);
            newWidth = winWidth * 2;
            top = ((newHeight - winHeight) / 2 * -1) + "px";
        } else {
            newWidth = winWidth * 2;
            newHeight = winHeight;
        }
        scenic.css({
            "width" : newWidth + "px",
            "height" : newHeight + "px",
            "left" : left,
            "top" : top,
        });

    }
});