const {Category} = require("../models");

async function createCategory(subsection, name, link, subcategories, length=0) {
    try {
        const newCategory = await Category.create({
            subsection,
            name,
            link,
            subcategories,
            length,
        });

        console.log('Category created:', newCategory);
        return newCategory
    } catch (error) {
        console.error('Error creating category:', error);
    }
}

async function isCreatedCategory(name) {
    try {
        const category = await Category.findOne({
            where: {
                name,
            },
        });

        if (category) {
            return category;
        }
        return false;

    } catch (error) {
        console.error('Ошибка при поиске категории:', error);
        throw error;
    }

}

async function getLengthOfCategory(name) {
    try {
        const category = await Category.findOne({
            where: {
                name,
            },
        });

        if (category) {
            return category.length;
        }
        return 0;

    } catch (error) {
        console.error('Ошибка при поиске категории:', error);
        throw error;
    }
}

async function updateCategory(name, newSubcategories, newLength) {
    try {
        const category = await Category.findOne({
            where: {
                name,
            },
        });


        if (category) {
            category.subcategories = newSubcategories;
            category.length = newLength;
            await category.save();
            return category;
        } else {
            console.log('Категория не найдена');
            return null;
        }

    } catch (error) {
        console.error('Ошибка при поиске категории:', error);
        throw error;
    }
}

module.exports = {
    createCategory,
    isCreatedCategory,
    getLengthOfCategory,
    updateCategory,
}