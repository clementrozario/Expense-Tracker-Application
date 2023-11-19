let currentPage = 1;
let pageSize = 5; // Default value for page size

function addNewExpense(e){
    e.preventDefault();

    const expenseDetails = {
        expenseamount: e.target.expenseamount.value,
        description: e.target.description.value,
        category: e.target.category.value,
    };

    const token = localStorage.getItem('token');
    axios.post('http://50.19.128.132:4000/expense/addexpense', expenseDetails, { headers: {"Authorization" : token} })
        .then((response) => {
            addNewExpensetoUI(response.data.expense);
        })
        .catch(err => showError(err));
}

function showPremiumuserMessage() {
    document.getElementById('rzp-button1').style.visibility = "hidden";
    document.getElementById('message').innerHTML = "You are a premium user ";
}

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

window.addEventListener('DOMContentLoaded', () => {
    // Check if currentPage and pageSize are present in localStorage
    const storedPage = localStorage.getItem('currentPage');
    const storedPageSize = localStorage.getItem('pageSize');
    
    // Use stored values if available, otherwise, use default values (1 for page and 5 for pageSize)
    currentPage = storedPage ? parseInt(storedPage) : 1;
    pageSize = storedPageSize ? parseInt(storedPageSize) : 5;

    // Load expenses with the retrieved currentPage and pageSize
    loadExpenses(currentPage);

    const token = localStorage.getItem('token');
    const decodeToken = parseJwt(token);
    const ispremiumuser = decodeToken.ispremiumuser;
    if (ispremiumuser) {
        showPremiumuserMessage();
        showLeaderboard();
    }
    
    axios.get('http://50.19.128.132:4000/expense/getexpenses', { headers: {"Authorization" : token} })
        .then(response => {
            response.data.expenses.forEach(expense => {
                addNewExpensetoUI(expense);
            });
        })
        .catch(err => {
            showError(err);
        });
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
        </li>`;
        
         // Check if there are any expenses displayed
    const expensesCount = parentElement.children.length;
    if (expensesCount > 0) {
        // If there are expenses, show the pageSizeContainer div
        document.getElementById('pageSizeContainer').style.display = 'block';

        // Show the pagination controls
        document.getElementById('pagination').style.display = 'block';
    }
}

function deleteExpense(e, expenseid) {
    const token = localStorage.getItem('token');
    axios.delete(`http://50.19.128.132:4000/expense/deleteexpense/${expenseid}`,  { headers: {"Authorization" : token} })
        .then(() => {
            removeExpensefromUI(expenseid);
        })
        .catch((err => {
            showError(err);
        }));
}

function showError(err){
    document.body.innerHTML += `<div style="color:red;"> ${err}</div>`;
}

function showLeaderboard(){
    const inputElement = document.createElement("input");
    inputElement.type = "button";
    inputElement.value = 'Show Leaderboard';
    inputElement.onclick = async() => {
        const token = localStorage.getItem('token');
        const userLeaderBoardArray = await axios.get('http://50.19.128.132:4000/premium/showLeaderBoard', { headers: {"Authorization" : token} });

        var leaderboardElem = document.getElementById('leaderboard');
        leaderboardElem.innerHTML = '<h1> Leader Board </h1>';
        userLeaderBoardArray.data.forEach((userDetails) => {
            leaderboardElem.innerHTML += `<li>Name - ${userDetails.name} Total Expense - ${userDetails.totalExpenses || 0} </li>`;
        });
    };
    document.getElementById("message").appendChild(inputElement);
}

function removeExpensefromUI(expenseid){
    const expenseElemId = `expense-${expenseid}`;
    document.getElementById(expenseElemId).remove();
}

function checkUserPremiumStatus() {
    const token = localStorage.getItem('token');
    if (token) {
        const decodeToken = parseJwt(token);
        return decodeToken.ispremiumuser; // Assuming ispremiumuser is a boolean indicating premium status
    }
    return false; // Return false if no token is found (user is not authenticated)
}

// Enable or disable the download button based on user's premium status
const downloadButton = document.getElementById('downloadexpense');
if (!checkUserPremiumStatus()) {
    downloadButton.setAttribute('disabled', true);
}

function download() {
    const token = localStorage.getItem('token');
    axios.get('http://50.19.128.132:4000/user/download', { headers: { "Authorization": token }, responseType: 'arraybuffer' })
        .then((response) => {
            // Create a Blob from the response data (ArrayBuffer)
            const blob = new Blob([response.data], { type: 'application/octet-stream' });

            // Create a download link and trigger the download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'myexpense.txt';
            a.click();
        })
        .catch((err) => {
            showError(err);
        });
}

function downloadUrls() {
    const token = localStorage.getItem('token')
    axios.get('http://50.19.128.132:4000/user/downloadurls', { headers: { "Authorization": token } })
        .then((response) => {
            const parentNode = document.getElementById('downloadUrl');
            parentNode.innerHTML = '';
            parentNode.innerHTML += '<h2> Download Urls </h2>'
            for (var i = 0; i < response.data.allUrls.length; i++) {
                showUrl(response.data.allUrls[i]);
            }
        })
        .catch(err => console.log(err))
}

function showUrl(url) {
    const parentNode = document.getElementById('downloadUrl');
    const childHTML = `<li id=${url.id}> url_id${url.id} ${url.createdAt} <a href="${url.url}"> Download </a>`;
    parentNode.innerHTML += childHTML;
}



document.getElementById('rzp-button1').onclick = async function (e) {
    const token = localStorage.getItem('token');
    const response  = await axios.get('http://50.19.128.132:4000/purchase/premiummembership', { headers: {"Authorization" : token} });
    var options =
    {
     "key": response.data.key_id,
     "order_id": response.data.order.id,
     "handler": async function (response) {
        const res = await axios.post('http://50.19.128.132:4000/purchase/updatetransactionstatus',{
             order_id: options.order_id,
             payment_id: response.razorpay_payment_id,
         }, { headers: {"Authorization" : token} });
        
         alert('You are a Premium User Now');
         document.getElementById('rzp-button1').style.visibility = "hidden";
         document.getElementById('message').innerHTML = "You are a premium user ";
         localStorage.setItem('token', res.data.token);
         showLeaderboard();
     },
  };
  const rzp1 = new Razorpay(options);
  rzp1.open();
  e.preventDefault();

  rzp1.on('payment.failed', function (response){
    console.log(response);
    alert('Something went wrong');
 });
}

function loadExpenses(page) {
    const token = localStorage.getItem('token');
    axios.get(`http://50.19.128.132:4000/expense/getexpenses?page=${page}&pageSize=${pageSize}`, { headers: { "Authorization": token } })
        .then(response => {
            // Update UI with expenses data
            renderExpenses(response.data.expenses);

            // Update current page number
            currentPage = page;

            // Update total pages and pagination controls
            const totalItems = response.data.totalItems;
            const totalPages = Math.ceil(totalItems / pageSize);
            document.getElementById('totalPages').textContent = totalPages;
            updatePaginationControls();
        })
        .catch(err => {
            showError(err);
        });
}

function applyPageSize() {
    // Get the selected value from the dropdown
    const selectElement = document.getElementById('pageSizeSelect');
    const selectedPageSize = selectElement.value;

    // Update the pageSize variable and store it in localStorage
    pageSize = selectedPageSize;
    localStorage.setItem('pageSize', pageSize);

    // Reload expenses with the updated pageSize
    loadExpenses(currentPage);
}

function renderExpenses(expenses) {
    const parentElement = document.getElementById('listOfExpenses');
    parentElement.innerHTML = '';
    expenses.forEach(expense => {
        addNewExpensetoUI(expense);
    });
}

function updatePaginationControls() {
    document.getElementById('currentPage').textContent = currentPage;

    const paginationDiv = document.getElementById('pagination');
    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage === parseInt(document.getElementById('totalPages').textContent);

    paginationDiv.querySelector('button:first-child').disabled = isFirstPage;
    paginationDiv.querySelector('button:nth-child(2)').disabled = isFirstPage;
    paginationDiv.querySelector('button:nth-child(4)').disabled = isLastPage;
}

// Initial load with default page size
loadExpenses(currentPage);
