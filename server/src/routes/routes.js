const {Router} = require('express')
const productRouter = require('./productRouter')
const tagRouter = require('./tagRouter')
const router = new Router()

router.use('/products',
    // authMiddleware,
    productRouter
)

router.use('/tags',
    // authMiddleware,
    tagRouter
)

module.exports = router
