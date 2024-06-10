const { DataTypes, Model  } = require('sequelize');
const sequelize = require('./db');

const Category = sequelize.define('category', {
    subsection: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    link: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    subcategories: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    length: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
});


// Модель продукта
const Product = sequelize.define('product', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
    },
    images: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    price: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    oldPrice: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    rating: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    reviewsCount: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    timestamps: true, // Добавление полей createdAt и updatedAt
    createdAt: 'created_at', // Название поля для времени создания
    updatedAt: 'updated_at', // Название поля для времени обновления
});


const Tag = sequelize.define('tag', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Уникальное имя тега
    },
});

const ProductTag = sequelize.define('product_tag', {
    productId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Product',
            key: 'id',
        },
        onDelete: 'CASCADE',
        allowNull: false,
    },
    tagId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Tag',
            key: 'id',
        },
        onDelete: 'CASCADE',
        allowNull: false,
    },
});

// Определение связей между моделями
Product.belongsToMany(Tag, { through: ProductTag });
Tag.belongsToMany(Product, { through: ProductTag });

module.exports = {
    Product,
    Category,
    Tag,
    ProductTag
};

