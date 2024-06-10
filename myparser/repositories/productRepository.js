const {Product} = require("../models");

async function createProduct({id, images, title, price, oldPrice, description, rating, reviewsCount}) {
    try {
        // const product = await Product.findByPk(id);
        // if (product) {
        //     return  product
        // }
        const [newProduct, created] = await Product.findOrCreate({
            where: { id },
            defaults: {
                images,
                title,
                price,
                oldPrice,
                description,
                rating,
                reviewsCount
            }
        });

        return newProduct
    } catch (e) {
        console.error('Ошибка при создании продукта:',e)
        throw e;
    }
}

async function isCreatedProduct(id) {
    try {
        const product = await Product.findByPk(id);

        if (product) {
            return product;
        }
        return false;

    } catch (e) {
        console.error('Ошибка при поиске категории:', e)
        throw e;
    }
}

// по идее не нужен, т.к я отдельно буду обновлять теги и таблицу соответствия тегов и продуктов
async function updateProduct(id, tags) {
    try {
        const product = await Product.findOne({
            where: {
                id
            },
        });


        if (product) {
            product.tags = tags;

            await product.save();
            return product;
        } else {
            console.log('Продукт не найден');
            return null;
        }

    } catch (e) {
        console.error('Ошибка при обновлении продукта:',e)
        throw e;
    }

}

module.exports = {
    createProduct,
    isCreatedProduct,
    updateProduct
}