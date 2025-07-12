const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Account:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Account ID
 *         fullname:
 *           type: string
 *           description: Full name of the user
 *         username:
 *           type: string
 *           description: Username
 *         email:
 *           type: string
 *           format: email
 *           description: Email address
 *         gender:
 *           type: string
 *           description: Gender
 *         phoneNumber:
 *           type: string
 *           description: Phone number
 *         imageURL:
 *           type: string
 *           description: Profile image URL
 *         currentStatus:
 *           type: string
 *           description: Current status message
 *         status:
 *           type: boolean
 *           description: Account active status
 *         lastOnline:
 *           type: string
 *           format: date-time
 *           description: Last online timestamp
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateAccount:
 *       type: object
 *       required:
 *         - fullname
 *         - username
 *         - email
 *         - password
 *       properties:
 *         fullname:
 *           type: string
 *           description: Full name of the user
 *         username:
 *           type: string
 *           description: Username
 *         email:
 *           type: string
 *           format: email
 *           description: Email address
 *         password:
 *           type: string
 *           minLength: 6
 *           description: Password (minimum 6 characters)
 *         fcmToken:
 *           type: string
 *           description: Firebase Cloud Messaging token
 *         gender:
 *           type: string
 *           description: Gender
 *         phoneNumber:
 *           type: string
 *           description: Phone number
 *         imageURL:
 *           type: string
 *           description: Profile image URL
 *         currentStatus:
 *           type: string
 *           description: Current status message
 *     UpdateAccount:
 *       type: object
 *       properties:
 *         fullname:
 *           type: string
 *           description: Full name of the user
 *         username:
 *           type: string
 *           description: Username
 *         email:
 *           type: string
 *           format: email
 *           description: Email address
 *         gender:
 *           type: string
 *           description: Gender
 *         phoneNumber:
 *           type: string
 *           description: Phone number
 *         imageURL:
 *           type: string
 *           description: Profile image URL
 *         currentStatus:
 *           type: string
 *           description: Current status message
 *         status:
 *           type: boolean
 *           description: Account active status
 *         lastOnline:
 *           type: string
 *           format: date-time
 *           description: Last online timestamp
 *     UpdateFcmToken:
 *       type: object
 *       required:
 *         - userId
 *         - fcmToken
 *       properties:
 *         userId:
 *           type: string
 *           description: User ID
 *         fcmToken:
 *           type: string
 *           description: Firebase Cloud Messaging token
 *     ValidationError:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Validation failed"
 *         errors:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Email is required", "Password must be at least 6 characters"]
 */

/**
 * @swagger
 * /api/accounts:
 *   post:
 *     summary: Create a new account
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAccount'
 *     responses:
 *       201:
 *         description: Account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Account'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       500:
 *         description: Internal server error
 */
router.post('/', accountController.create);

/**
 * @swagger
 * /api/accounts:
 *   get:
 *     summary: Get all accounts
 *     tags: [Accounts]
 *     responses:
 *       200:
 *         description: List of all accounts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Account'
 *       500:
 *         description: Internal server error
 */
router.get('/', accountController.getAll);

/**
 * @swagger
 * /api/accounts/{id}:
 *   get:
 *     summary: Get account by ID
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Account ID
 *     responses:
 *       200:
 *         description: Account found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Account'
 *       404:
 *         description: Account not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', accountController.getById);

/**
 * @swagger
 * /api/accounts/{id}:
 *   put:
 *     summary: Update account by ID
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Account ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAccount'
 *     responses:
 *       200:
 *         description: Account updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Account'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       404:
 *         description: Account not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', accountController.update);

/**
 * @swagger
 * /api/accounts/{id}:
 *   delete:
 *     summary: Delete account by ID
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Account ID
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Deleted successfully"
 *       404:
 *         description: Account not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', accountController.remove);

/**
 * @swagger
 * /api/accounts/update-fcm-token:
 *   patch:
 *     summary: Update FCM token for a user
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateFcmToken'
 *     responses:
 *       200:
 *         description: FCM token updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "FCM token updated"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.patch('/update-fcm-token', accountController.updateFcmToken);

module.exports = router;
