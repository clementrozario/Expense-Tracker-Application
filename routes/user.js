const express = require('express');

const userController = require('../controller/user');


const expenseController = require('../controller/expense')

const userauthentication = require('../middleware/auth')

const router = express.Router();


router.post('/signup', userController.signup);

router.post('/login', userController.login);

router.get('/download', userauthentication.authenticate, expenseController.downloadExpenses );

router.get('/downloadurls', userauthentication.authenticate, expenseController.downloadUrls  );

module.exports = router;