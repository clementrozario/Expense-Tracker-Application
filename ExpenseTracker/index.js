document.addEventListener('DOMContentLoaded', () => {
    const expenseForm = document.getElementById('expense-form');
    const expenseList = document.getElementById('expense-list');
    const refreshButton = document.getElementById('refresh-button');

    // Function to add a new expense to the table
    function addExpenseToTable(expense) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${expense.amount}</td>
            <td>${expense.description}</td>
            <td>${expense.category}</td>
            <td><button class="delete-button" data-expense-id="${expense.id}">Delete</button></td>
        `;
        expenseList.querySelector('tbody').appendChild(row);
    }

    // Function to clear the expense table
    function clearExpenseTable() {
        expenseList.querySelector('tbody').innerHTML = '';
    }

    // Function to fetch and display expenses from the server
    async function refreshExpenses() {
        try {
            const response = await axios.get('http://localhost:3000/expenses'); // Replace with your API endpoint
            const expenses = response.data;
            clearExpenseTable();
            expenses.forEach(addExpenseToTable);
        } catch (error) {
            console.error('Error fetching expenses:', error);
        }
    }

    // Event listener for form submission
    expenseForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const amount = event.target.amount.value;
        const description = event.target.description.value;
        const category = event.target.category.value;

        if (!amount || !description || !category) {
            alert('Please fill in all fields.');
            return;
        }

        const newExpense = {
            amount: parseFloat(amount),
            description,
            category,
        };

        try {
            await axios.post('http://localhost:3000/expenses', newExpense); // Replace with your API endpoint
            addExpenseToTable(newExpense);
            event.target.reset();
        } catch (error) {
            console.error('Error adding expense:', error);
        }
    });

    // Event listener for refresh button
    refreshButton.addEventListener('click', refreshExpenses);

    // Event listener for delete buttons
    expenseList.querySelector('tbody').addEventListener('click', async (event) => {
        if (event.target.classList.contains('delete-button')) {
            const expenseId = event.target.dataset.expenseId;
            try {
                await axios.delete(`http://localhost:3000/expenses/${expenseId}`); // Replace with your API endpoint
                event.target.closest('tr').remove(); // Remove the row from the table
            } catch (error) {
                console.error('Error deleting expense:', error);
            }
        }
    });

    // Initial fetch of expenses when the page loads
    refreshExpenses();
});
