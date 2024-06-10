const {Tag} = require("../models");
const {Op} = require("sequelize");

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


module.exports = {
    getAll,
    getAllBySearch
}