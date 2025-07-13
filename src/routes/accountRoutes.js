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
 *         fullname:
 *           type: string
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         gender:
 *           type: string
 *         phoneNumber:
 *           type: string
 *         imageURL:
 *           type: string
 *         currentStatus:
 *           type: string
 *         status:
 *           type: boolean
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 */

/**
 * @swagger
 * /api/accounts:
 *   post:
 *     summary: Create account
 *     tags: [Accounts]
 *     responses:
 *       201:
 *         description: Account created
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
 *         description: List of accounts
 */
router.get('/', accountController.getAll);

/**
 * @swagger
 * /api/accounts/update-fcm-token:
 *   patch:
 *     summary: Update FCM token
 *     tags: [Accounts]
 *     responses:
 *       200:
 *         description: FCM token updated
 */
router.patch('/update-fcm-token', accountController.updateFcmToken);

/**
 * @swagger
 * /api/accounts/login:
 *   post:
 *     summary: Login
 *     tags: [Accounts]
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login', accountController.login);

/**
 * @swagger
 * /api/accounts/status/{userId}:
 *   get:
 *     summary: Get user status
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User status
 */
router.get('/status/:userId', accountController.getUserStatus);

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
 *     responses:
 *       200:
 *         description: Account found
 */
router.get('/:id', accountController.getById);

/**
 * @swagger
 * /api/accounts/{id}:
 *   put:
 *     summary: Update account
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Account updated
 */
router.put('/:id', accountController.update);

/**
 * @swagger
 * /api/accounts/{id}:
 *   delete:
 *     summary: Delete account
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Account deleted
 */
router.delete('/:id', accountController.remove);

module.exports = router;
