const express = require('express');
const router = express.Router();
const pool = require('../db');

/**
 * @swagger
 * /cart/{userId}:
 *   get:
 *     summary: Get all cart items for a user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of cart items
 * /cart:
 *   post:
 *     summary: Add an item to a user's cart
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *               productId:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Item added to cart
 * /cart/{id}:
 *   put:
 *     summary: Update quantity of a cart item
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Cart item updated
 *   delete:
 *     summary: Remove item from cart by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Item removed from cart
 */

// Get all cart items for a user
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT c.id, c.user_id, c.product_id, c.quantity, p.name, p.price FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id=?',
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching cart');
  }
});

// Add item to cart
router.post('/', async (req, res) => {
  const { userId, productId, quantity } = req.body;
  try {
    // Check if product is already in cart
    const [existing] = await pool.query(
      'SELECT * FROM cart WHERE user_id=? AND product_id=?',
      [userId, productId]
    );

    if (existing.length > 0) {
      // Update quantity if already exists
      await pool.query(
        'UPDATE cart SET quantity = quantity + ? WHERE user_id=? AND product_id=?',
        [quantity, userId, productId]
      );
    } else {
      await pool.query(
        'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [userId, productId, quantity]
      );
    }

    res.status(201).json({ message: 'Item added to cart' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding to cart');
  }
});

// Update cart item quantity
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  try {
    await pool.query('UPDATE cart SET quantity=? WHERE id=?', [quantity, id]);
    res.json({ message: 'Cart item updated' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating cart item');
  }
});

// Remove item from cart
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM cart WHERE id=?', [id]);
    res.json({ message: 'Item removed from cart' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error removing cart item');
  }
});

module.exports = router;
