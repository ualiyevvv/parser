const {Router} = require('express')
const router = new Router()
const productController = require('../controllers/productController')
const {body} = require('express-validator')


// TODO Admin middleware
router.get('/',
    productController.getAll
)

router.get('/tag/:tagName',
    productController.getAllByTag
)

router.get('/search',
    productController.getAllBySearch
)

module.exports = router
