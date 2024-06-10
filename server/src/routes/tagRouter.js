const {Router} = require('express')
const router = new Router()
const tagController = require('../controllers/tagController')
const {body} = require('express-validator')


// TODO Admin middleware
router.get('/',
    tagController.getAll
)

router.get('/search',
    tagController.getAllBySearch
)

module.exports = router
