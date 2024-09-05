import puppeteer from 'puppeteer';
// import { chromium } from 'playwright'; // Playwright alternative

export async function getWeatherData(city: string, unit: string): Promise<string> {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`https://www.accuweather.com/${city}`);

    // Scrape data (adjust selectors according to the site's structure)
    const weatherData = await page.evaluate(() => {
      const tempElement = document.querySelector('.temperature'); // Adjust selector
      const weatherDescElement = document.querySelector('.weather-desc'); // Adjust selector
      return {
        temperature: tempElement ? tempElement.textContent : 'N/A',
        description: weatherDescElement ? weatherDescElement.textContent : 'N/A',
      };
    });

    await browser.close();
    return `${city} Weather: ${weatherData.temperature}°${unit} - ${weatherData.description}`;
  } catch (error) {
    throw new Error('Website unavailable or inaccessible.');
  }
}

export async function getWeatherForSeveralDays(city: string, unit: string): Promise<string> {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`https://www.accuweather.com/${city}`);

    // Scrape forecast data (adjust selectors according to the site's structure)
    const forecastData = await page.evaluate(() => {
      // Example selectors, adjust as needed
      const days = document.querySelectorAll('.forecast-day');
      return Array.from(days).map((day) => ({
        date: day.querySelector('.date')?.textContent,
        temp: day.querySelector('.temp')?.textContent,
        desc: day.querySelector('.desc')?.textContent,
      }));
    });

    await browser.close();

    return forecastData.map(d => `${d.date}: ${d.temp}°${unit}, ${d.desc}`).join('\n');
  } catch (error) {
    throw new Error('Website unavailable or inaccessible.');
  }
}
