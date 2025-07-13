const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * @swagger
 * /api/auth/google-login:
 *   post:
 *     summary: Authenticate user with Google
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Authentication successful
 *       400:
 *         description: Invalid ID token
 *       500:
 *         description: Internal server error
 */
router.post('/google-login', authController.googleLogin);

module.exports = router;
