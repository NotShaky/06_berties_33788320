const request = require('request');
const express = require("express");
const router = express.Router();

// GET /weather -> interactive weather page with city search
router.get('/', function(req, res, next){
  const apiKey = process.env.OPENWEATHER_API_KEY || '9ae65d03aa942b10fb88e6f9d0a6750b';

  // read and sanitize city; default to london
  let city = (req.query.city || 'london').trim();
  if (req.sanitize) city = req.sanitize(city);
  if (!city) city = 'london';

  if (!apiKey) {
    return res.render('weather.ejs', {
      error: 'Weather service not configured. Set OPENWEATHER_API_KEY in .env.',
      weather: null,
      city
    });
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`;
  request(url, { json: true }, function (err, _response, body) {
    if (err) return next(err);
    if (!body || Number(body.cod) !== 200) {
      return res.render('weather.ejs', {
        error: body && body.message ? body.message : 'Unable to fetch weather right now.',
        weather: null,
        city
      });
    }

    // helpers
    const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
    const wind_direction = typeof body.wind.deg === 'number'
      ? dirs[Math.round((body.wind.deg % 360) / 22.5) % 16]
      : null;

    const weather = {
      name: body.name,
      country: body.sys.country,
      temp: body.main.temp,
      temp_min: body.main.temp_min,
      temp_max: body.main.temp_max,
      feels_like: body.main.feels_like,
      humidity: body.main.humidity,
      wind_speed: body.wind.speed,
      wind_gust: body.wind.gust,
      wind_direction,
      pressure: body.main.pressure,
      visibility: body.visibility,
      clouds: body.clouds ? body.clouds.all : undefined,
      sunrise: new Date(body.sys.sunrise * 1000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      sunset: new Date(body.sys.sunset * 1000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      description: Array.isArray(body.weather) && body.weather[0] ? body.weather[0].description : 'n/a',
      icon: Array.isArray(body.weather) && body.weather[0] ? body.weather[0].icon : null,
    };

    res.render('weather.ejs', { error: null, weather, city });
  });
});

module.exports = router;