const uuid = require('uuid');
const SibApiV3Sdk = require('sib-api-v3-sdk');
const bcrypt = require('bcrypt');

const User = require('../models/user');
const Forgotpassword = require('../models/forgotpassword');

require('dotenv').config();

const sendinblue = new SibApiV3Sdk.TransactionalEmailsApi();
SibApiV3Sdk.ApiClient.instance.authentications['api-key'].apiKey = process.env.SENDINBLUE_API_KEY;

const forgotpassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });
        if (user) {
            const id = uuid.v4();
            user.createForgotpassword({ id, active: true })
                .catch(err => {
                    throw new Error(err);
                });

            const sendinblueEmail = {
                sender: {
                    name: 'Clement',
                    email: 'rozariomartin05@gmail.com'
                },
                to: [{ email: email }],
                subject: 'Reset Your Password',
                htmlContent: `<a href="http://localhost:3000/password/resetpassword/${id}">Reset password</a>`
            };

            sendinblue.sendTransacEmail(sendinblueEmail)
                .then(() => {
                    return res.status(200).json({ message: 'Link to reset password sent to your mail', success: true });
                })
                .catch((error) => {
                    console.log(error)
                    throw new Error(error);
                });
        } else {
            throw new Error('User does not exist');
        }
    } catch (err) {
        console.error(err);
        return res.json({ message: err, success: false });
    }
};

const resetpassword = (req, res) => {
    const id = req.params.id;
    Forgotpassword.findOne({ where: { id } }).then(forgotpasswordrequest => {
        if (forgotpasswordrequest) {
            forgotpasswordrequest.update({ active: false });
            res.status(200).send(`
                <html>
                    <script>
                        function formsubmitted(e){
                            e.preventDefault();
                            console.log('called');
                        }
                    </script>
                    <form action="/password/updatepassword/${id}" method="get">
                        <label for="newpassword">Enter New password</label>
                        <input name="newpassword" type="password" required></input>
                        <button>reset password</button>
                    </form>
                </html>`
            );
        }
    });
};

const updatepassword = (req, res) => {
    try {
        const { newpassword } = req.query;
        const { resetpasswordid } = req.params;
        Forgotpassword.findOne({ where: { id: resetpasswordid } }).then(resetpasswordrequest => {
            User.findOne({ where: { id: resetpasswordrequest.userId } }).then(user => {
                console.log('userDetails', user);
                if (user) {
                    // encrypt the password
                    const saltRounds = 10;
                    bcrypt.genSalt(saltRounds, function (err, salt) {
                        if (err) {
                            console.log(err);
                            throw new Error(err);
                        }
                        bcrypt.hash(newpassword, salt, function (err, hash) {
                            // Store hash in your password DB.
                            if (err) {
                                console.log(err);
                                throw new Error(err);
                            }
                            user.update({ password: hash }).then(() => {
                                res.status(201).json({ message: 'Successfully updated the new password' });
                            });
                        });
                    });
                } else {
                    return res.status(404).json({ error: 'No user exists', success: false });
                }
            });
        });
    } catch (error) {
        return res.status(403).json({ error, success: false });
    }
};

module.exports = {
    forgotpassword,
    updatepassword,
    resetpassword
};
