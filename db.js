const sequelize = require('sequelize');

const db = new sequelize({
    dialect: 'sqlite',
    storage: 'chatss.js'
});

const users = db.define('persons', {
    firstname: sequelize.STRING,
    lastname: sequelize.STRING,
    email: sequelize.STRING,
    username: {
        type: sequelize.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: sequelize.STRING,
        allowNull: false
    }
});

const chats = db.define('chats', {
    username: {
        type: sequelize.STRING,
        allowNull: false,
    },
    message: {
        type: sequelize.STRING,
        allowNull: false
    }
});

db.sync()
.then(() => {console.log('Database has been synced !')})
.catch(() => {console.log('Error creating database :(')})

module.exports = {
    db,
    users,
    chats
}