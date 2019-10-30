$(() => {
    $("#updateButton").on("click", () => {
        clear();
        getFavorites(false);
    });

    $("#moreButton").on("click", () => {
        getFavorites(true);
    });

    getFavorites(false);
});

const getFavorites = (moreFlg) => {
    $.getJSON("json/credential.json", null, (credential) => {
        const message = {
            method: "GET",
            action: "https://api.twitter.com/1.1/favorites/list.json",
            parameters: getParams(credential, moreFlg)
        };

        OAuth.setTimestampAndNonce(message);
        OAuth.SignatureMethod.sign(message, credential.accessor);
        const url = OAuth.addToURL(message.action, message.parameters);

        $.ajax({
            method: message.method,
            url: url,
            dataType: "jsonp",
            jsonp: false,
            cache: true
        });
    });
};

const showPictures = (data) => {
    if ($("#max_id").val() !== "") {
        delete data[0];
    }

    for (let key in data) {
        const tweet = data[key];

        if (!tweet.hasOwnProperty("extended_entities")) {
            continue;
        }

        const tweetDiv = $("<div>");
        tweetDiv.append(getTweetDetail(tweet));

        const mediaArray = tweet.extended_entities.media;
        mediaArray.forEach((value) => {
            tweetDiv.append($("<img>").attr("src", value.media_url_https));
        });

        $("#showArea").append($("<hr>")).append(tweetDiv);
    }

    $("#max_id").val(data[data.length - 1].id_str);
    $("#bottomArea").show();
};

const clear = () => {
    $("#showArea").empty();
    $("#bottomArea").hide();
    $("#max_id").val("");
};

const getParams = (credential, moreFlg) => {
    const params = {
        tweet_mode: "extended",
        include_entities: false,
        oauth_version: "1.0",
        oauth_signature_method: "HMAC-SHA1",
        oauth_consumer_key: credential.consumerKey,
        oauth_token: credential.accessToken,
        callback: "showPictures"
    };

    if (moreFlg) {
        params.count = 100;
        params.max_id = $("#max_id").val();
    } else {
        params.count = 200;
    }

    return params;
};

const getTweetDetail = (tweet) => {
    const div = $("<div>").addClass("detail");
    const screenName = tweet.user.screen_name;
    div.append($("<span>").html(tweet.user.name + " (@" + screenName + ")"));

    const url = "https://twitter.com/" + screenName + "/status/" + tweet.id_str;
    const date = new Date(tweet.created_at);
    div.append($("<a>").attr("href", url).attr("target", "_blank").text(getDateStr(date)));

    div.append($("<div>").html(tweet.full_text));
    return div;
};

const getDateStr = (d) => {
    const ymd = d.getFullYear() + "/" + zeroPad(d.getMonth() + 1) + "/" + zeroPad(d.getDate());
    const hms = zeroPad(d.getHours()) + ":" + zeroPad(d.getMinutes()) + ":" + zeroPad(d.getSeconds());
    return ymd + " " + hms;
};

const zeroPad = (num) => {
    return ("0" + num).slice(-2);
};
