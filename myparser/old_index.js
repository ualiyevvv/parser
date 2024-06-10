const axios = require('axios');
const cheerio = require('cheerio');

// URL страницы, которую мы будем парсить
const url = 'https://www.flip.kz/catalog?subsection=44';

axios.get(url)
    .then(response => {
        // Загружаем HTML-страницу в cheerio
        const $ = cheerio.load(response.data);

        // // Извлекаем все заголовки <h1>
        // const headers = [];
        // $('').each((index, element) => {
        //     headers.push($(element).text());
        // });
        // console.log(headers);


        // Извлекаем все <div> элементы с определенным классом
        const divClassName = 'new-product'; // Замените на нужное имя класса
        const divs = [];
        $(`div.${divClassName}`).each((index, element) => {
            divs.push($(element).text());
        });

        console.log(divs);

    })
    .catch(error => {
        console.error('Error fetching the page:', error);
    });
