import { chromium } from 'playwright';

export async function getWeatherForSeveralDays(city: string): Promise<string> {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto(`https://meteum.ai/weather/en/${city}`);
    await page.waitForSelector('.AppShortForecastScroll_scroll__6NZIO', { timeout: 10000 });

    const forecastData = await page.evaluate(() => {
        const forecastElements = document.querySelectorAll('.AppShortForecastDay_container__r4hyT');
        const forecast = [];

        forecastElements.forEach((element) => {
            const day = element.querySelector('.AppShortForecastDay_title__2NpIg')?.textContent?.trim();
            const tempDay = element.querySelector('.AppShortForecastDay_temperature__DV3oM:nth-child(1)')?.textContent?.trim();
            const tempNight = element.querySelector('.AppShortForecastDay_temperature__DV3oM:nth-child(2)')?.textContent?.trim();

            console.log({ day, tempDay, tempNight });

            if (day && tempDay && tempNight) {
                forecast.push({ day, tempDay, tempNight });
            }
        });

        return forecast;
    });

    console.log("Scraped Data:", forecastData);

    await browser.close();

    const formattedForecast = forecastData.map((entry: any) =>
        `${entry.day}: Day: ${entry.tempDay}, Night: ${entry.tempNight}`
    ).join('\n');

    if (!formattedForecast) {
        return `No forecast data available for ${city}.`;
    }

    return `Weather forecast for ${city}:\n${formattedForecast}`;
}
