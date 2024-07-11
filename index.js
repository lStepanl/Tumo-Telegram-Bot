const TelegramBot = require('node-telegram-bot-api');

const token = '6697812758:AAGcO7MsUL1CugfRqIUtsqMqeIVZ8mnIhHM';

const bot = new TelegramBot(token, { polling: true });

async function getCountryInfo(country) {
    try {
        const { default: fetch } = await import('node-fetch');

        const response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(country)}`);
        const data = await response.json();

        if (data.length > 0) {
            const countryData = data[0];
            const description = `${countryData.name.common} (${countryData.name.official})\nСтолица: ${countryData.capital}\nРегион: ${countryData.region}\nНаселение: ${countryData.population}\nЯзыки: ${Object.values(countryData.languages).join(', ')}`;
            const lat = countryData.latlng[0];
            const lon = countryData.latlng[1];
            return { lat, lon, description };
        } else {
            throw new Error('Страна не найдена');
        }
    } catch (error) {
        throw new Error('Страна не найдена');
    }
}

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Привет! Я бот для получения информации о странах.Просто напиши мне название страны, и я пришлю тебе её локацию и краткое описание.');
});

bot.on('text', async (msg) => {
    const chatId = msg.chat.id;
    const country = msg.text;

    try {
        if (!country.startsWith('/start')) {
            const waitMessage = await bot.sendMessage(chatId, 'Подождите...');

            const { lat, lon, description } = await getCountryInfo(country);

            await bot.deleteMessage(chatId, waitMessage.message_id);

            await bot.sendLocation(chatId, lat, lon);
            await bot.sendMessage(chatId, description);
        }
    } catch (error) {
        bot.sendMessage(chatId, error.message);
    }
});

console.log('Бот запущен');
