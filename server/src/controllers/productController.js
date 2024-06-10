const {Product, Tag} = require("../models");
const {Sequelize} = require("sequelize");
const { Op } = require("sequelize");

async function getAll (req, res) {
    try {
        const page = parseInt(req.query.page) || 1;  // Default to page 1 if not provided
        const limit = parseInt(req.query.limit) || 10;  // Default to 10 items per page if not provided
        const offset = (page - 1) * limit;

        const { count, rows: products } = await Product.findAndCountAll({
            limit,
            offset
        });

        res.status(200).json({
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            products
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getAllByTag(req, res) {

    const { tagName } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    try {
        const tag = await Tag.findOne({ where: { name: tagName } });

        if (!tag) {
            return res.status(404).json({ message: 'Tag not found' });
        }

        const products = await tag.getProducts({
            limit,
            offset
        });

        res.json({
            totalItems: products.length,
            products,
            totalPages: Math.ceil(products.length / limit),
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
        const products = await Product.findAndCountAll({
            where: {
                [Op.or]: [
                    { title: { [Op.like]: `%${query}%` } },
                    { description: { [Op.like]: `%${query}%` } }
                ]
            },
            limit,
            offset
        });
        res.json({
            totalItems: products.count,
            products: products.rows,
            totalPages: Math.ceil(products.count / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getOne() {

}


module.exports = {
    getAll,
    getAllByTag,
    getAllBySearch,
    // getOne,
}