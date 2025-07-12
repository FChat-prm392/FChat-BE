const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * @swagger
 * components:
 *   schemas:
 *     GoogleLoginRequest:
 *       type: object
 *       required:
 *         - idToken
 *       properties:
 *         idToken:
 *           type: string
 *           description: Google ID token from client
 *         fcmToken:
 *           type: string
 *           description: Firebase Cloud Messaging token (optional)
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Whether authentication was successful
 *         message:
 *           type: string
 *           description: Response message
 *         user:
 *           $ref: '#/components/schemas/Account'
 *         token:
 *           type: string
 *           description: JWT token for authentication
 */

/**
 * @swagger
 * /api/auth/google-login:
 *   post:
 *     summary: Authenticate user with Google
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GoogleLoginRequest'
 *           example:
 *             idToken: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjY2..."
 *             fcmToken: "fGci1GpZe4-s:APA91bH..."
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid ID token or validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid ID token"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Authentication failed"
 */
router.post('/google-login', authController.googleLogin);

module.exports = router;
