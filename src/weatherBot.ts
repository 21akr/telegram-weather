import TelegramBot from 'node-telegram-bot-api';
import NodeCache from 'node-cache';
import { getWeatherData } from './scraper';
import { getWeatherForSeveralDays} from "./forecast";

const token = '7336636912:AAHOifJwE1PcAf1-RkY0Z71laH_QNInNSiQ';
const bot = new TelegramBot(token, {
  polling: {
    interval: 1000,
    autoStart: true
  }
});
const cache = new NodeCache({stdTTL: 600});

let unit = 'C';
let currentCity = 'Tashkent';
let waitingForCity = false;

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Welcome! Use /weather to get the current weather.');
});

bot.onText(/\/weather/, async (msg) => {
  try {
    const chatId = msg.chat.id;

    const cacheKey = `${currentCity}_${unit}`;
    let weather: string | undefined = cache.get(cacheKey);
    if (!weather) {
      weather = await getWeatherData(currentCity, unit);
      cache.set(cacheKey, weather);
    }

    await bot.sendMessage(chatId, weather);
  } catch (error) {
    console.error(error);
    await bot.sendMessage(msg.chat.id, 'Error: Could not fetch weather data.');
  }
});

bot.onText(/\/switch_city/, (msg) => {
  waitingForCity = true;
  bot.sendMessage(msg.chat.id, 'Please enter the city name:');
});

bot.on('message', (msg) => {
  if (waitingForCity && msg.text && !msg.text.startsWith('/')) {
    currentCity = msg.text.trim();
    waitingForCity = false;
    bot.sendMessage(msg.chat.id, `City switched to ${currentCity}.`);
  } else if (msg.text && !msg.text.startsWith('/')) {
    bot.sendMessage(msg.chat.id, 'Unknown command. Use /weather, /switch_city, /switch_unit, or /forecast.');
  }
});

bot.onText(/\/switch_unit/, (msg) => {
  unit = unit === 'C' ? 'F' : 'C';
  bot.sendMessage(msg.chat.id, `Unit switched to ${unit === 'C' ? 'Celsius' : 'Fahrenheit'}.`);
});

bot.onText(/\/forecast/, async (msg) => {
  try {
    const chatId = msg.chat.id;

    const weatherForecast = await getWeatherForSeveralDays( currentCity);

    await bot.sendMessage(chatId, weatherForecast);
  } catch (error) {
    console.error(error);
    await bot.sendMessage(msg.chat.id, 'Error: Could not fetch weather forecast.');
  }
});


bot.on('location', async (msg) => {
  const location = msg.location;
  if (location) {
    // const city = await getCityFromCoordinates(location.latitude, location.longitude);
    // currentCity = city;
    console.log(location)
    currentCity = 'Tashkent';
    await bot.sendMessage(msg.chat.id, `City detected and switched to ${currentCity}`);
  }
});

bot.on('polling_error', (error) => {
  console.error('Polling error:', error.stack, error.message);
});

