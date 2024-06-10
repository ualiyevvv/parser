const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const {createCategory, isCreatedCategory, getLengthOfCategory, updateCategory} = require("./repositories/categoryRepository");
const {createProduct, isCreatedProduct} = require("./repositories/productRepository");
const {findOrCreateTag, createProductTag} = require("./repositories/tagRepository");

const LATENCY = 1000

const neaded = [1100, 1321]

const baseUrl = 'https://www.flip.kz/catalog';
const subsectionIterator = 1122; // Начальное значение итератора
const maxSubsections = 10000; // Максимальное количество итераций для проверки (чтобы не зацикливаться бесконечно)
const outputDir = './parsed_data';

const products = [];
let productsLength = 0;
const subsections = [];

let lastValidSubsection = null;
let lastValidProductId = null;

if (!fs.existsSync(outputDir)){
    fs.mkdirSync(outputDir);
}

async function fetchPage(url) {
    try {
        const response = await axios.get(url);
        return cheerio.load(response.data);
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return null;
        }
        if (error.response && error.response.status === 429) {
            console.error('Encountered anti-parsing system. Stopping...');
            process.exit(1);
        }
        console.error('Error fetching the page:', error.message);
        return null;
    }
}

// async function parseProduct($, currentCategory, subsection, categories) {
async function parseProduct($, subsection, categories) {
    const sectionProducts = [];

    $('.new-product').each(async (_, product) => {
        const id = $(product).find('input[data-favorite-checker]').data('id');
        const imgUrls = [];
        $(product).find('.img-to-scroll img').each((_, img) => {
            imgUrls.push($(img).attr('src'));
        });
        const title = $(product).find('.title').text();
        const price = $(product).find('.price span').first().text();
        const oldPrice = $(product).find('.price .old').text();
        const description = $(product).find('.description').text();
        const rating = $(product).find('.reviews .round').text();
        const reviewsCount = $(product).find('.reviews a').text();
        const tags = [];

        // Проверяем каждое значение
        categories.forEach(value => {
            if (!tags.includes(value.name)) {
                tags.push(value.name);
            }
        });


        const productData = {
            id,
            images: imgUrls,
            title,
            price,
            oldPrice,
            description,
            rating,
            reviewsCount,
        };

        let productFromBd = await isCreatedProduct(productData.id);
        // console.log('\n\n\n', productFromBd, '\n\n\n')
        if ( !productFromBd ) {
            productFromBd = await createProduct(productData)
        }

        // Создание тегов и связывание с продуктом через ProductTag
        if (tags.length > 0) {
            for (let tagName of tags) {
                const tag = await findOrCreateTag(tagName)
                await createProductTag(productFromBd, tag)
            }
        }

        productsLength+=1;
        // products.push(productData);
        // sectionProducts.push(productData);
    });

    // // Сохранение продуктов подкатегории в JSON файл
    // const filePath = path.join(outputDir, `subsection_${subsection}.json`);
    // fs.writeFileSync(filePath, JSON.stringify(sectionProducts, null, 2), 'utf-8');
}

async function parseSubsections(subsection) {
    const url = `${baseUrl}?subsection=${subsection}&order=rating.down`;

    const $ = await fetchPage(url);

    if (!$) {
        // continue;
        console.log(`Subsection ${subsection} not found or reached end of sections.`);
        return false;
    }

    // TODO если нет крох то создаю категорию, если категория существует то проверяю его length (длина массива, т.е сколько подкатегорий вложено) если current length больше то записываю в поле subcategories этот массив, если меньше то не трогаю


    let category;
    const subcategories = []
    $('div.krohi a').each((_, subcategory) => {
        subcategories.push({
            subsection: subsection,
            name: $(subcategory).text(),
            link: $(subcategory).attr('href'),
        });
    });


    // TODO написать норм комменты
    // категория, которая остается хвостом и не входит в крохи (вложенность), но важна
    let h1Text = $('div.content h1.cell').first().text().trim();
    if (!h1Text) {
        h1Text = $('a.filter-item.active').first().text().trim();
        if (!h1Text) {
            h1Text = $('ul.underline a.active').first().contents().filter((_, el) => el.type === 'text').text().trim();
            // const textWithoutSpan = h1Text.clone().children('span').remove().end().text().trim();
            // h1Text = textWithoutSpan
        }
    }
    const tailCategory = {
        subsection: subsection,
        name: h1Text,
        link: '/catalog?subsection='+subsection,
    }
    subcategories.push(tailCategory)

    // if (subcategories.length < 1) {
    //
    // }


    // -- если нет крох то создаю категорию если уже существует то
    // проверяю его length (длина массива, т.е сколько подкатегорий вложено)
    // если current length больше то записываю в поле subcategories этот массив, если меньше то не трогаю
    if (subcategories.length === 1) {
        category = tailCategory
        category.length = 0
        category.subcategories = []
        if ( !(await isCreatedCategory(category.name)) ) {
            await createCategory(category.subsection, category.name, category.link, category.subcategories, category.length)
        }



        // category.subcategories.push([...subcategories])
        // subsections.push(category);
    }
        // если subcategories не пустые, то беру самый первый элемент subcategories и проверяю его length (длина массива, т.е сколько подкатегорий вложено)
    // если current length больше то записываю в поле subcategories этот массив, если меньше то не трогаю
    else {
        const lengthFromBd = await getLengthOfCategory(subcategories[0].name);

        if ( subcategories.length > lengthFromBd ) {
            await updateCategory(subcategories[0].name, subcategories.slice(1), subcategories.length)
        }

        //
        // subsections.map(subsection => {
        //     if (subsection.name === subcategories[0].name) {
        //         subsection.subcategories.push(tailCategory)
        //     }
        // })
    }

    subsections.push({ subsection, subcategories });

    console.log(`Subsection ${subsection} - Category ${category} - Subcategories:`, subcategories);

    await parseProduct($, subsection, subcategories);
    return true;
}

async function startParsing() {
    // for (let i = 0; i < neaded.length; i++) {
    //     const hasMoreSubsections = await parseSubsections(neaded[i]);
    //     // if (hasMoreSubsections) {
    //     //     break
    //     //     // Добавляем задержку перед каждым запросом
    //     //     // await new Promise(resolve => setTimeout(resolve, LATENCY)); // Задержка 1 секунда
    //     // }
    // }

    for (let i = subsectionIterator; i <= maxSubsections; i++) {
        const hasMoreSubsections = await parseSubsections(i);
        if (hasMoreSubsections) {
            lastValidSubsection = i
            // Добавляем задержку перед каждым запросом
            await new Promise(resolve => setTimeout(resolve, LATENCY)); // Задержка 1 секунда
        }
    }

    // // Сохранение всех продуктов в один файл
    // const allProductsPath = path.join(outputDir, 'all_products.json');
    // fs.writeFileSync(allProductsPath, JSON.stringify(products, null, 2), 'utf-8');

    // Сохранение всех подкатегорий в один файл
    const subsectionsPath = path.join(outputDir, 'all_subsections.json');
    fs.writeFileSync(subsectionsPath, JSON.stringify(subsections, null, 2), 'utf-8');


    const lastSubsectionPath = path.join(outputDir, 'last_subsection.json');
    fs.writeFileSync(lastSubsectionPath, JSON.stringify(`lastValidSubsection: ${lastValidSubsection}, lastValidProductId: ${lastValidProductId}`, null, 2), 'utf-8');

    console.log('Finished parsing. Total products:', productsLength);
    // console.log('All products saved to:', allProductsPath);
    console.log('All subsections saved to:', subsectionsPath);
}

module.exports = startParsing;