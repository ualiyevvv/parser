require('dotenv').config()
const sequelize = require('./db')
const startParsing = require('./parser');

const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()


        // app.listen(PORT, () => {
        //     console.log(`Server is running on port ${PORT}`)
        // })

        startParsing();
    } catch (e) {
        console.log(e)
    }
}

start()

