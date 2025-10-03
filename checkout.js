const express = require('express');
const router = express.Router();
const pool = require('../db');

/**
 * @swagger
 * /cart/{cartId}/checkout:
 *   post:
 *     summary: Checkout a user's cart
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Checkout successful and order created
 *       400:
 *         description: Cart is empty or invalid
 *       500:
 *         description: Server error
 */

router.post('/:cartId/checkout', async (req, res) => {
  const { cartId } = req.params;

  try {
    // 1. Get cart items
    const [cartItems] = await pool.query(
      'SELECT * FROM cart WHERE id=?',
      [cartId]
    );

    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty or does not exist' });
    }

    const userId = cartItems[0].user_id;

    // 2. Calculate total
    let total = 0;
    for (const item of cartItems) {
      const [productRows] = await pool.query('SELECT price FROM products WHERE id=?', [item.product_id]);
      if (productRows.length === 0) {
        return res.status(400).json({ message: `Product with id ${item.product_id} does not exist` });
      }
      total += productRows[0].price * item.quantity;
    }

    // 3. Create order
    const [orderResult] = await pool.query(
      'INSERT INTO orders (user_id, total, status) VALUES (?, ?, ?)',
      [userId, total, 'Paid']
    );

    const orderId = orderResult.insertId;

    // 4. Insert order items
    for (const item of cartItems) {
      const [productRows] = await pool.query('SELECT price FROM products WHERE id=?', [item.product_id]);
      const price = productRows[0].price;

      await pool.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, price]
      );
    }

    // 5. Clear cart
    await pool.query('DELETE FROM cart WHERE id=?', [cartId]);

    res.json({
      message: 'Checkout successful',
      orderId,
      total
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error during checkout' });
  }
});

module.exports = router;
