const Sequelize = require('sequelize');

const sequelize= require('../util/database');

const Url = sequelize.define('downloadurl', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    url: Sequelize.STRING,
})

module.exports = Url;