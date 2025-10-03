const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());  // Parse JSON first

// Routes
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');

// Swagger
require('./swagger')(app);

// Mount routes
app.use('/users', userRoutes);
app.use('/products', productRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
