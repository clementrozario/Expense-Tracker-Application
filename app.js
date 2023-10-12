const express = require('express');
var cors = require('cors');
const sequelize = require('./util/database');
const User = require('./models/user');
const Expense = require('./models/expenses');
const userRoutes = require('./routes/user');
const expenseRoutes = require('./routes/expense');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/user', userRoutes);
app.use('/expense', expenseRoutes);

User.hasMany(Expense);
Expense.belongsTo(User);

sequelize.sync().then(() => {
    app.listen(3000, () => {
        console.log('Server is running on port 3000');
    });
}).catch(err => {
    console.log(err);
});
