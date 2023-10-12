function addNewExpense(e){
    e.preventDefault();

    const expenseDetails = {
        expenseamount: e.target.expenseamount.value,
        description: e.target.description.value,
        category: e.target.category.value,

    }
    console.log(expenseDetails)
    const token  = localStorage.getItem('token')
    axios.post('http://localhost:3000/expense/addexpense',expenseDetails,  { headers: {"Authorization" : token} })
        .then((response) => {

        addNewExpensetoUI(response.data.expense);

    }).catch(err => showError(err))

}

function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}


window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');

    if (token) {
        axios
            .get('http://localhost:3000/expense/getexpenses', { headers: { "Authorization": token } })
            .then((response) => {
                response.data.expenses.forEach((expense) => {
                    addNewExpensetoUI(expense);
                });
            })
            .catch((err) => {
                showError(err);
            });
    } else {
        // Handle the case when the user is not authenticated (redirect to login page, show a message, etc.)
        console.log('User is not authenticated');
    }
});

function addNewExpensetoUI(expense){
    const parentElement = document.getElementById('listOfExpenses');
    const expenseElemId = `expense-${expense.id}`;
    parentElement.innerHTML += `
        <li id=${expenseElemId}>
            ${expense.expenseamount} - ${expense.category} - ${expense.description}
            <button onclick='deleteExpense(event, ${expense.id})'>
                Delete Expense
            </button>
        </li>`
}

function deleteExpense(e, expenseid) {
    const token = localStorage.getItem('token')
    axios.delete(`http://localhost:3000/expense/deleteexpense/${expenseid}`,  { headers: {"Authorization" : token} }).then(() => {

            removeExpensefromUI(expenseid);

    }).catch((err => {
        showError(err);
    }))
}

function showError(err){
    document.body.innerHTML += `<div style="color:red;"> ${err}</div>`
}

function removeExpensefromUI(expenseid){
    const expenseElemId = `expense-${expenseid}`;
    document.getElementById(expenseElemId).remove();
}

