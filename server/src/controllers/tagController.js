const {Tag, ProductTag, Product} = require("../models");
const {Op} = require("sequelize");
const sequelize = require('sequelize')
const {join} = require("path");
const {existsSync, readFileSync, writeFileSync} = require("fs");

const resultsFilePath = join(__dirname, 'tagStatistics.json');

async function getAll(req, res) {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    try {
        const tags = await Tag.findAndCountAll({
            limit,
            offset
        });
        res.json({
            totalItems: tags.count,
            tags: tags.rows,
            totalPages: Math.ceil(tags.count / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
async function getAllBySearch(req, res) {
    const { query, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    try {
        const tags = await Tag.findAndCountAll({
            where: {
                name: { [Op.like]: `%${query}%` }
            },
            limit,
            offset
        });
        res.json({
            totalItems: tags.count,
            tags: tags.rows,
            totalPages: Math.ceil(tags.count / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getTagsStatistics(req, res) {
    try {

        // Проверка наличия файла с результатами
        if (existsSync(resultsFilePath)) {
            // Если файл существует, читаем его содержимое
            const data = readFileSync(resultsFilePath, 'utf-8');
            const results = JSON.parse(data);
            return res.json(results);
        }
        // Запрос для получения статистики по тегам
        const statistics = await Tag.findAll({
            include: [{
                model: Product,
                through: { attributes: [] } // Исключение полей из таблицы связи
            }]
        });

        // Форматирование данных
        const result = statistics.map(tag => ({
            tagName: tag.name,
            productCount: tag.products.length
        }));

        // Сохраняем результаты в файл
        writeFileSync(resultsFilePath, JSON.stringify(result, null, 2));


        res.json(result);
    } catch (error) {
        console.error('Error fetching tag statistics:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


module.exports = {
    getAll,
    getAllBySearch,
    getTagsStatistics
}