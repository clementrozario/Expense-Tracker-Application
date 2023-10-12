const Sequelize = require('sequelize')



const sequelize = new Sequelize('expense-tracker', 'root', 'clement',{
    dialect: 'mysql',
    host: 'localhost'
})

module.exports = sequelize;