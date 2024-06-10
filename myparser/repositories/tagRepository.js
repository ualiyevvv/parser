const {Tag, ProductTag} = require("../models");

async function findOrCreateTag(name) {
    try {
        const [tag, created] = await Tag.findOrCreate({
            where: { name: name },
        });

        return tag
    } catch (e) {
        console.error('Ошибка при создании тега:',e)
        throw e;
    }
}

async function createProductTag(product, tag) {
    try {
        // Связывание продукта с тегом через ProductTag
        const [productTag, created] = await ProductTag.findOrCreate({where: {
                productId: product.id,
                tagId: tag.id,
            },
            // productId: product.id,
            // tagId: tag.id,
        });

        return productTag
    } catch (e) {
        console.error('Ошибка при создании тега или связи с продуктом:', e);
    }
}

module.exports = {
    findOrCreateTag,
    createProductTag
}