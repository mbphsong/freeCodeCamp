$(document).ready(function() {
    getQuote();

    $("#newQuote").on("click", function(e) {
        e.preventDefault();
        getQuote();
    });

    
    function getQuote() {
        $.ajax({
            url: "https://quotesondesign.com/wp-json/posts?filter[orderby]=rand&filter[posts_per_page=1",
            success: function(data) {
                var quote = data[0];
                var tweetLink = "https://twitter.com/intent/tweet?hashtags=quotes&related=freecodecamp&text=";
                // //remove the tags before tweeting
                // var linkText = quote.content.replace(/<p>|<\/p>/g,"");
                // //encode quote for queryString so the whole thing makes it
                // linkText = encodeURIComponent(linkText);
                $(".quote-text").html(quote.content);
                $(".quotee").html(quote.title);
                //get text from the page so it uses quotes, etc, instead of &quot; chars - goes into the tweet better that way
                $("#tweet a").attr("href",tweetLink + '"' + $(".quote-text p").text() + ' -- ' + quote.title + '"');
    
                if (quote.link !== undefined && quote.link !== "") {
                    $(".quoteSource").show();
                    $(".quoteSource a").attr("href",quote.link);
                }
                else {
                    $(".quoteSource").hide();
                }
            },
            cache: false
        });
    }
});