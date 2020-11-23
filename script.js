var apiKey = "dde55275793968119ad3b1dd2529eda8";

var searchCityInputEl = $("#search-city");
var searchBtn = $("#search-button")
var searchHistoryContainer = $("#search-history-container")

var cardCity = $("#card-city");
var cardTempF = $("#card-tempF");
var cardHumidity = $("#card-humidity");
var cardWind = $("#card-wind");
var cardUV = $("#card-uv");
var currentWeatherContainer = $("#current-weather-container")

var forecastContainer = $("#forecast-container")

var searchHistory = [];

searchBtn.on("click", function(e){
    e.preventDefault();
    currentWeatherContainer.removeClass("d-none")
    var searchCityVal = searchCityInputEl.val();

    var inputLat;
    var inputLon;

    searchHistory.push(searchCityVal);
    renderSearchHistory();

    //update search 
    
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + searchCityVal + "&appid=dde55275793968119ad3b1dd2529eda8";
  
    //get weather
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        inputLat = response.coord.lat;
        inputLon = response.coord.lon;
        var tempF = (response.main.temp * 9/5) - 459.67
        var humidity = response.main.humidity;
        var windSpeed = response.wind.speed;
        
        $.ajax({ 
            url: `https://api.openweathermap.org/data/2.5/onecall?lat=${(inputLat)}&lon=${(inputLon)}&exclude=minutely,hourly,alerts&appid=dde55275793968119ad3b1dd2529eda8`,
            method: "GET"
        }).then(function (response) {
            uvIndex = response.current.uvi;

            cardCity.text(searchCityVal);
            cardTempF.text(tempF.toFixed(2));
            cardHumidity.text(humidity);
            cardWind.text(windSpeed);
            cardUV.text(uvIndex);
            cardUV.css("background-color",uvConditionHighlight(uvIndex));

            var forecastArray = response.daily;

            generateForecast(forecastArray);
        })
    
    });


})

// Returns color formatting for UV Index based on UV Index Scale
function uvConditionHighlight(uvIndex) {
    switch (true) {
        case uvIndex <= 2:
            return "green";
        case uvIndex <= 5:
            return "yellow";
        case uvIndex <= 7:
            return "orange";
        case uvIndex > 7:
            return "red";
    }
}

// Render the search history of past searched cities
function renderSearchHistory() {
    searchHistoryContainer.empty();

    jQuery.each(searchHistory,function(index, value){
        var newSearchDiv = $("<div>", {
            "text": value,
            "class": `search-history-div border border-secondary p-3 bg-light`,
        })
        searchHistoryContainer.append(newSearchDiv);
    })

}

// generate the 5 day forecast div and content
function generateForecast(arr) {

    // remove existing content in forecast div
    forecastContainer.empty();

    // create forecast header "5 Day Forecast"
    var forecastHeaderDiv = $("<div>", {
        "class": `col-md-12`
    })
    var forecastHeader = $("<h2>", {
        "text": `5 Day Forecast: `
    })

    forecastHeaderDiv.append(forecastHeader);
    forecastContainer.append(forecastHeaderDiv);


    // generate the 5 day forecast cards with details like temp and humidity
    for (let index = 0; index < 5; index++) {
        var forecastCard = $("<div>", {
            "class": `col-md-2 forecast-card`
        })
        var forecastDate = $("<p>")
        var forecastTempF = $("<p>");
        var forecastHumidity = $("<p>");
        var forecastIcon = $("<img>", {
            "src": `http://openweathermap.org/img/wn/${arr[index+1].weather[0].icon}@2x.png`
        })

        forecastDate.text(moment().add(index+1,'days').format("L"));
        forecastTempF.text(`Temp: ${((arr[index+1].temp.day* 9/5) - 459.67).toFixed(2)}F`);
        forecastHumidity.text(`Humidity: ${arr[index+1].humidity}%`);

        forecastCard.append(forecastDate,forecastIcon,forecastTempF,forecastHumidity);
        forecastContainer.append(forecastCard);       
        console.log(index) 
    }
}
