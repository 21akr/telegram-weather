import TelegramBot from 'node-telegram-bot-api';
import NodeCache from 'node-cache';
import { getWeatherData, getWeatherForSeveralDays } from './scraper';

const token = '7336636912:AAHOifJwE1PcAf1-RkY0Z71laH_QNInNSiQ';
const bot = new TelegramBot(token, {polling: true});
const cache = new NodeCache({stdTTL: 600}); // Cache data for 10 minutes

// Default unit and city
let unit = 'C'; // Celsius by default
let currentCity = 'London';

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Welcome! Use /weather to get the current weather.');
});

bot.onText(/\/weather/, async (msg) => {
  try {
    const chatId = msg.chat.id;

    const cacheKey = `${currentCity}_${unit}`;
    let weather: string | undefined = cache.get(cacheKey);

    if(!weather) {
      weather = await getWeatherData(currentCity, unit);
      cache.set(cacheKey, weather);
    }

    await bot.sendMessage(chatId, weather);
  } catch (error) {
    console.error(error);
    await bot.sendMessage(msg.chat.id, 'Error: Could not fetch weather data.');
  }
});

bot.onText(/\/switch_city (.+)/, (msg, match) => {
  if(match) {
    currentCity = match[1];
    bot.sendMessage(msg.chat.id, `City switched to ${currentCity}.`);
  } else {
    bot.sendMessage(msg.chat.id, 'Invalid command. Use /switch_city <city_name>');
  }
});

bot.onText(/\/switch_unit/, (msg) => {
  unit = unit === 'C' ? 'F' : 'C';
  bot.sendMessage(msg.chat.id, `Unit switched to ${unit === 'C' ? 'Celsius' : 'Fahrenheit'}.`);
});

bot.onText(/\/forecast/, async (msg) => {
  try {
    const weatherForecast = await getWeatherForSeveralDays(currentCity, unit);
    await bot.sendMessage(msg.chat.id, weatherForecast);
  } catch (error) {
    console.error(error);
    await bot.sendMessage(msg.chat.id, 'Error: Could not fetch weather forecast.');
  }
});

bot.on('location', async (msg) => {
  const location = msg.location;
  if(location) {
    // const city = await getCityFromCoordinates(location.latitude, location.longitude);
    // currentCity = city;
    console.log(location)
    currentCity = 'Tashkent';
    await bot.sendMessage(msg.chat.id, `City detected and switched to ${currentCity}`);
  }
});

bot.on('message', (msg) => {
  if(msg.text && !msg.text.startsWith('/')) {
    bot.sendMessage(msg.chat.id, 'Unknown command. Use /weather, /switch_city, /switch_unit, or /forecast.');
  }
});

