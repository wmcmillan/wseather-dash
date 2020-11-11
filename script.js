var APIurl = "http://api.openweathermap.org/data/2.5/forecast?id=524901&APPID={YOUR API KEY}"

var APIkey = "b8490967e1286ac31919deba8dced9fc"

var city;
// For Autocomplete dropdown keyboard controls
var currentFocus = -1;
// Pull data from localStorage
var cityArr = JSON.parse(localStorage.getItem("cities"));
if (!cityArr) {
  // If no data stored
  cityArr = [];
} else {
  // Grab the first city in the stored array
  city = cityArr[0];
  // Display list of cities from cityArr
  loadCities()
  // Load page
  getWeather();
}

// Append each city as an li
function loadCities() {
  $(".list-group").empty();
  for (var i = 0; i < cityArr.length; i++) {
    var cityLi = $("<li class='list-group-item'>").text(cityArr[i]);
    $(".list-group").append(cityLi);
  }
}

function getWeather() {
  // Pass city or address to geocode API, receive lat-long
  var geocodeURL = "https://app.geocodeapi.io/api/v1/search?text=" + city + "&apikey=0a157990-f940-11ea-ac04-cb65445966da"
  $.ajax({
    url: geocodeURL,
    method: "GET"
  }).then(function (response) {
    // API passes back 4 coords that form a box. Get the center of that box
    city = response.features[0].properties.label;
    var lat = (response.bbox[3] + response.bbox[1]) / 2;
    var lon = (response.bbox[2] + response.bbox[0]) / 2;

    // Pass lat lon to openWeatherMap OneCall API, get back current and forecasted weather
    var weatherURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=hourly,minutely&units=imperial&appid=b8490967e1286ac31919deba8dced9fc"
    $.ajax({
      url: weatherURL,
      method: "GET"
    }).then(function (response) {
      loadCurrentWeather(response);
      loadForecasts(response.daily);
    });
  })
}


// Load current weather conditions
function loadCurrentWeather(weather) {
  // Today's date
  var currentDate = new Date(weather.current.dt * 1000).toLocaleDateString()
  // Generate elements and fill with values
  var currentWeatherDiv = $("<div class='card-body'>");
  var cityDate = $("<h2>").text(`${city} (${currentDate})`);
  var iconCode = weather.current.weather[0].icon
  var figure = $("<figure style='text-align: center; width: 100px;'>")
  var icon = $("<img>").attr("src", "http://openweathermap.org/img/wn/" + iconCode + "@2x.png")
  var caption = $("<figcaption>").text(weather.current.weather[0].main)
  figure.append(icon, caption);
  var temp = $("<p>").text(`Temperature: ${Math.round(weather.current.temp)} °F`);
  var humidity = $("<p>").text(`Humidity: ${weather.current.humidity}%`);
  var windSpeed = $("<p>").text(`Wind Speed: ${weather.current.wind_speed} MPH`);
  var uv = weather.current.uvi;
  // Apply highlighting to UVIndex
  if (uv < 2) {
    var style = "background-color: green;";
  } else if (uv >= 2 && uv < 5) {
    var style = "background-color: yellow;";
  } else if (uv >= 5 && uv < 7) {
    var style = "background-color: orange;";
  } else if (uv >= 7 && uv < 10) {
    var style = "background-color: red;";
  } else if (uv >= 10) {
    var style = "background-color: rgb(141, 43, 222); color: white;";
  }
  var uvIndex = $("<p>").html(`UV Index: <span style="${style}" id="uv">${uv}<span>`);
  // Put everything on the page
  currentWeatherDiv.append(cityDate, figure, temp, humidity, windSpeed, uvIndex);
  // Empty the page in case this isn't the first load
  $("#currentWeather").empty()
  $("#currentWeather").append(currentWeatherDiv);
}

// Load 5 day forecast
function loadForecasts(forecasts) {
  // Generate header and box to hold forecast cards
  var forecastHeader = $("<h2>").text("Forecast:");
  var forecastBox = $("<div class='flex-box'>");
  // Generate a card for each day. Index 0 is today's weather
  for (var i = 1; i < 6; i++) {
    var forecast = forecasts[i]
    // Numeric date
    var date = new Date(forecast.dt * 1000).toLocaleDateString();
    // Day of the week
    var day = new Date(forecast.dt * 1000).toLocaleString('en-us', { weekday: 'long' });
    var temp = Math.round(forecast.temp.day);
    var humidity = forecast.humidity;
    // Generate elements
    var forecastCard = $("<div class='card blue'>");
    var fCardBody = $("<div class='card-body pb-0'>");
    var fCardTitle = $("<h5 class='card-title'>");
    var iconCode = forecast.weather[0].icon
    var figure = $("<figure style='text-align: center;'>")
    var icon = $("<img>").attr("src", "http://openweathermap.org/img/wn/" + iconCode + ".png")
    var caption = $("<figcaption>").text(forecast.weather[0].main)
    figure.append(icon, caption);
    var fCardTemp = $("<p>")
    var fCardHumidity = $("<p>")
    fCardTitle.html(`${day}<br>${date}`)
    fCardTemp.text(`Temp: ${temp} °F`)
    fCardHumidity.text(`Humidity: ${humidity}%`)

    fCardBody.append(fCardTitle, figure, fCardTemp, fCardHumidity);
    forecastCard.append(fCardBody);
    forecastBox.append(forecastCard);
  }
  // Empty in case this isn't first load
  $(".forecast").empty();
  // Put it all on the page
  $(".forecast").append(forecastHeader, forecastBox);
}

// Event listeners ====================================================================


// Autocomplete using geocodeapi
$("#city-input").on("input", function () {
  var input = $("#city-input").val();
  console.log(input)
  if (input.length > 2) {
    queryURL = "https://app.geocodeapi.io/api/v1/autocomplete?apikey=0a157990-f940-11ea-ac04-cb65445966da&text=" + input + "&size=5&"
    $.ajax({
      url: queryURL,
      method: "GET"
    }).then(function (response) {
      var autoCities = response.features;
      var autoArr = [];
      for (var i = 0; i < autoCities.length; i++) {
        autoArr.push(autoCities[i].properties.label)
      }
      var autoList = $("#autocomplete-list");
      autoList.empty();
      for (var i = 0; i < autoArr.length; i++) {
        var autoCompleteItem = $("<div>");
        autoCompleteItem.text(autoArr[i]);
        autoList.append(autoCompleteItem);
      }
    })
  }
})


// Keyboard controls for autocomplete list
$("#city-input").on("keydown", function (event) {
  var input = $("#city-input");
  var autoItems = $("#autocomplete-list div");
  switch (event.code) {
    case "ArrowDown":
      currentFocus++;
      addActive(autoItems);
      break;
    case "ArrowUp":
      currentFocus--;
      addActive(autoItems);
      break;
    case "Enter":
    // Fall-through
    case "NumpadEnter":
      if (currentFocus !== -1) {
        console.log(autoItems[currentFocus])
        input.val(autoItems[currentFocus].textContent);
      }
      $("#cityBtn").trigger("click");
      currentFocus = -1;
      event.target.blur();
      break;
    default:
      break;
  }
})

// Highlight selected div of autocomplete dropdown
function addActive(element) {
  if (!element) return false;
  // First remove all 'autocomplete-active' classes
  for (var i = 0; i < element.length; i++) {
    element[i].classList.remove("autocomplete-active");
  }
  // Allow selection to wrap around from bottom to top and top to bottom
  if (currentFocus >= element.length) currentFocus = 0;
  if (currentFocus < 0) currentFocus = (element.length - 1);
  // Add class selected div
  element[currentFocus].classList.add("autocomplete-active");
}

// Remove autocomplete divs on any click
$(document).on("click", function () {
  $(".autocomplete-items").empty()
});

// Gather user input and pass to getweather() and loadCities()
$("#cityBtn").on("click", function (event) {
  event.preventDefault();
  city = $("#city-input").val().trim();
  if (!city) return;
  $("#city-input").val("");
  cityArr.unshift(city);
  // Convert to Set to remove duplicates
  cityArr = Array.from(new Set(cityArr));
  // Limit cityArr to 5 entires
  if (cityArr.length > 5) cityArr.pop();
  localStorage.setItem("cities", JSON.stringify(cityArr));
  getWeather();
  loadCities();
})

// Listen for a click on the autocomplete dropdown
$("#autocomplete-list").on("click", function (event) {
  // Fill input box with selection
  $("#city-input").val(event.target.textContent);
  // Trigger a #cityBtn click
  $("#cityBtn").trigger("click");
});

// Listen for a click on saved cities list, 
$(".list-group").on("click", function (event) {
  city = event.target.textContent;
  getWeather();

})