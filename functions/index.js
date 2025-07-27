const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.resetUserPassword = functions.https.onRequest(async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().updateUser(user.uid, {
      password: newPassword,
    });

    return res.status(200).json({ success: true, message: 'Cập nhật mật khẩu thành công' });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ success: false, message: err.message });
  }
});
