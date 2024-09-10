import { chromium } from 'playwright';

export async function getWeatherData(city: string, unit: string): Promise<string> {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto(`https://meteum.ai/weather/en/${city}`);
  await page.waitForSelector('.AppFactTemperature_value__2qhsG', { timeout: 10000 });

  const weatherData = await page.evaluate(() => {
    const tempElement = document.querySelector('.AppFactTemperature_value__2qhsG');
    const weatherDescElement = document.querySelector('.AppFact_warning__8kUUn');
    return {
      temperature: tempElement ? tempElement.textContent : 'N/A',
      description: weatherDescElement ? weatherDescElement.textContent : 'N/A',
    };
  });

  await browser.close();
  return `${city} Weather: ${weatherData.temperature}°${unit} - ${weatherData.description}`;
}
