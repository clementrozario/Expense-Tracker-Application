const Expense = require('../models/expenses');
const User = require('../models/user');
const sequelize = require('../util/database');


const addexpense = async (req, res) => {
    const { expenseamount, description, category } = req.body;

    if (expenseamount === undefined || expenseamount.length === 0) {
        return res.status(400).json({ success: false, message: 'Parameters missing' });
    }
    const t = await sequelize.transaction();
    try {
        const expense = await Expense.create({ 
            expenseamount, 
            description, 
            category, 
            userId: req.user.id 
        },{transaction:t});

        const totalExpense = Number(req.user.totalExpenses) + Number(expenseamount);
        
        await User.update(
            { totalExpenses: totalExpense },
            { where: { id: req.user.id },transaction:t }
        );

        await t.commit();
        return res.status(200).json({ expense, success: true });
    } catch (err) {
        await t.rollback();
        return res.status(500).json({ success: false, error: err.message });
        
    }
};


const getexpenses = (req, res) => {
    Expense.findAll({where:{userId:req.user.id}}).then(expenses => {
        return res.status(200).json({ expenses, success: true });
    }).catch(err => {
        console.log(err);
        return res.status(500).json({ error: err, success: false });
    });
};

const deleteexpense = async (req, res) => {
    const expenseid = req.params.expenseid;

    if (!expenseid) {
        return res.status(400).json({ success: false, message: 'Invalid expense ID' });
    }

    const t = await sequelize.transaction(); // Start a transaction

    try {
        // Find the expense to get the deleted amount
        const expense = await Expense.findOne({ where: { id: expenseid, userId: req.user.id }, transaction: t });
        
        if (!expense) {
            await t.rollback(); // Rollback the transaction if the expense is not found
            return res.status(404).json({ success: false, message: 'Expense does not belong to the user' });
        }

        // Delete the expense
        await Expense.destroy({ where: { id: expenseid, userId: req.user.id }, transaction: t });

        // Update the user's totalExpenses within the same transaction
        const user = await User.findByPk(req.user.id, { transaction: t });
        const totalExpense = user.totalExpenses - expense.expenseamount;

        await User.update(
            { totalExpenses: totalExpense },
            { where: { id: req.user.id }, transaction: t }
        );

        await t.commit(); // Commit the transaction if everything is successful

        return res.status(200).json({ success: true, message: "Expense deleted successfully" });
    } catch (err) {
        await t.rollback(); // Rollback the transaction in case of an error
        console.error(err);
        return res.status(500).json({ success: false, message: "Failed to delete expense" });
    }
};



module.exports = {
    deleteexpense,
    getexpenses,
    addexpense,
    sequelize
};