const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const app = express();
const PORT = 3000;
// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'HomePage')));
app.use(express.static(path.join(__dirname, 'store')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Connect to MongoDB
mongoose.connect('mongodb+srv://ilaypreiss10:WO9uG6pLo8I1PIo5@project.zpnipmo.mongodb.net/', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function() {
    console.log('Connected to MongoDB');
});
// Define Mongoose schemas and models
const customerSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    username: String,
    password: String,
    city: String,
    credit: { type: Number, default: 0 },
});
const Customer = mongoose.model('Customer', customerSchema);
const managerSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    username: String,
    password: String,
    city: String,
});
const Manager = mongoose.model('Manager', managerSchema);
const itemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    stock: { type: Number, required: true, min: [0, 'Stock must be greater than or equal to 0']  },
    companyName: { type: String },
    rgb: { type: Boolean },
    wireless: { type: Boolean }
});
const Item = mongoose.model('Item', itemSchema);
module.exports = Item;
itemSchema.index({ name: 1, category: 1 }, { unique: true });
const orderSchema = new mongoose.Schema({
    orderId: { type: Number, unique: true },
    customerId: Number,
    totalPrice: Number,
    numItems: Number,
    items: [{
        name: String,
        price: Number,
        category: String,
        quantity: Number
    }]
});
const Order = mongoose.model('Order', orderSchema);
const categorySchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
});
const Category = mongoose.model('Category', categorySchema);
// Route to create a new category
app.post('/categories', async (req, res) => {
    const { categoryName } = req.body;
    try {
        const category = new Category({ name: categoryName });
        await category.save();
        res.status(201).json(category);
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).send('Error creating category');
    }
});
// Route to fetch all categories
app.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).send('Error fetching categories');
    }
});
// Route to fetch items by category

// Route to fetch all customer IDs
app.get('/customer-ids', async (req, res) => {
    try {
        const customers = await Customer.find({}, { id: 1, _id: 0 }); // Fetch only the 'id' field
        res.json(customers);
    } catch (error) {
        console.error('Error fetching customer IDs:', error);
        res.status(500).send('Error fetching customer IDs');
    }
});



app.get('/items', async (req, res) => {
    const categoryName = req.query.category;
    try {
        const items = await Item.find({ category: categoryName });
        res.json(items);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).send('Error fetching items');
    }
});
// Route to create a new product
// Route to create a new product
// Route to create a new product
app.post('/products', async (req, res) => {
    const { name, price, category, stock, company, rgb, wireless } = req.body;
    try {
        const product = new Item({
            name,
            price,
            category,
            stock,
            companyName: company,
            rgb,
            wireless
        });
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).send('Error creating product');
    }
});
// Route to delete a product
app.delete('/products/:name', async (req, res) => {
    const { name } = req.params;
    try {
        const result = await Item.findOneAndDelete({ name });
        if (result) {
            res.sendStatus(204); // No Content
        } else {
            res.status(404).send('Product not found');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).send('Error deleting product');
    }
});
// Route to update a product
app.put('/products/:id', async (req, res) => {
    const { id } = req.params;
    const { name, stock, price, rgb, wireless } = req.body;
    try {
        const updatedProduct = await Item.findByIdAndUpdate(id, {
            name,
            stock,
            price,
            rgb,       // Ensure rgb is updated in MongoDB
            wireless,  // Ensure wireless is updated in MongoDB
        }, { new: true });
        if (!updatedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Function to create a new Customer
async function sendCustomer(id, username, password, city) {
    const newCustomer = new Customer({ id, username, password, city });
    await newCustomer.save();
    return newCustomer;
}
// Function to create a new Manager
async function sendManager(id, username, password, city) {
    const newManager = new Manager({ id, username, password, city });
    await newManager.save();
    return newManager;
}
// Function to find a Manager by ID
async function findManagerById(managerId) {
    try {
        const manager = await Manager.findOne({ id: managerId });
        return manager;
    } catch (err) {
        console.error('Error searching for manager:', err);
        throw err;
    }
}
// Function to find a Customer by ID
async function findCustomerById(customerId) {
    try {
        const customer = await Customer.findOne({ id: customerId });
        return customer;
    } catch (err) {
        console.error('Error searching for customer:', err);
        throw err;
    }
}
// Route to serve the Sign In page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'HomePage', 'Sign_In.html'));
});
// Route to serve the Sign Up page
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'HomePage', 'Sign_Up.html'));
});
// Route to serve the Log In page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'HomePage', 'Log_In.html'));
});
// Route to serve the Customer Store page
app.get('/Cus_Store.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'store', 'Cus_Store.html'));
});
// Route to serve the Manager Store page
app.get('/Man_Store.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'store', 'Man_Store.html'));
});
// Route to handle login form submission
app.post('/send2', async (req, res) => {
    const { id, selection } = req.body;
    try {
        if (selection === 'customer') {
            const customer = await findCustomerById(id);
            if (customer) {
                const userName = JSON.stringify(customer.username);
                res.send(`
                    <html>
                        <body onload="window.location.href='Cus_Store.html'">
                            <script>
                            localStorage.setItem('userName', ${userName});
                            localStorage.setItem('id', ${id});
                            </script>
                        </body>
                    </html>
                `);
            } else {
                throw new Error('Customer not found');
            }
        } else { // is manager
            const manager = await findManagerById(id);
            if (manager) {
                const userName = JSON.stringify(manager.username);
                res.send(`
                    <html>
                        <body onload="window.location.href='Man_Store.html'">
                            <script>
                            localStorage.setItem('userName', ${userName});
                            localStorage.setItem('id', ${id});
                            </script>
                        </body>
                    </html>
                `);
            } else {
                throw new Error('Manager not found');
            }
        }
    } catch (err) {
        console.error('Error processing login:', err);
        res.status(400).send(`
            <html>
                <body>
                    <script>
                        alert('Incorrect');
                        window.location.href = '/';
                    </script>
                </body>
            </html>
        `);
    }
});
// Route to handle sign up form submission
app.post('/send', async (req, res) => {
    const { id, username, password, selection, city } = req.body;
    try {
        if (selection === 'customer') {
            await sendCustomer(id, username, password, city);
        } else { // is manager
            await sendManager(id, username, password, city);
        }
        res.send(`
            <html>
                <body onload="window.location.href='Sign_In.html'">
                    
                </body>
            </html>
        `);
    } catch (err) {
        console.error('Error saving data:', err);
        res.status(500).send('Error saving data');
    }
});






app.get('/items/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const item = await Item.findById(id);
        if (item) {
            res.json(item);
        } else {
            res.status(404).send('Item not found');
        }
    } catch (error) {
        console.error('Error fetching item:', error);
        res.status(500).send('Error fetching item');
    }
});

app.post('/update-stock', async (req, res) => {
    const { items } = req.body;

    try {
        for (const item of items) {
            const { _id, quantity } = item;
            await Item.findByIdAndUpdate(_id, {
                $inc: { stock: -quantity }
            });
        }
        res.sendStatus(200); // OK
    } catch (error) {
        console.error('Error updating stock:', error);
        res.status(500).send('Error updating stock');
    }
});

app.post('/update-credit', async (req, res) => {
    const { customerId, amount } = req.body;

    try {
        await Customer.findOneAndUpdate(
            { id: customerId },
            { $inc: { credit: amount } }
        );
        res.sendStatus(200); // OK
    } catch (error) {
        console.error('Error updating credit:', error);
        res.status(500).send('Error updating credit');
    }
});
app.get('/customer/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const customer = await Customer.findOne({ id: parseInt(id) });
        if (customer) {
            res.json({ credit: customer.credit,
                username: customer.username,
                id: customer.id,
                city: customer.city
             });
        } else {
            res.status(404).send('Customer not found');
        }
    } catch (error) {
        console.error('Error fetching customer:', error);
        res.status(500).send('Error fetching customer');
    }
});

// Route to fetch customer details by ID
// Route to fetch customer details including orders
app.get('/customer-details/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const customer = await Customer.findOne({ id: parseInt(id) }).lean();
        if (!customer) {
            return res.status(404).send('Customer not found');
        }

        // Fetch orders for the customer
        const orders = await Order.find({ customerId: customer.id }).lean();

        // Send customer and orders data
        res.json({ ...customer, orders });
    } catch (error) {
        console.error('Error fetching customer details:', error);
        res.status(500).send('Error fetching customer details');
    }
});


// Route to fetch manager details by ID
app.get('/manager-details/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const manager = await Manager.findOne({ id: parseInt(id) });

        if (!manager) {
            return res.status(404).send('Manager not found');
        }

        // Send manager details
        res.json(manager);
    } catch (error) {
        console.error('Error fetching manager details:', error);
        res.status(500).send('Error fetching manager details');
    }
});

// Route to fetch order details
app.get('/orders/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const order = await Order.findOne({ orderId: parseInt(id) }).lean();
        if (!order) {
            return res.status(404).send('Order not found');
        }
        res.json(order);
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).send('Error fetching order details');
    }
});

app.post('/update-profile', async (req, res) => {
    const { id, username, password, city } = req.body;

    try {
        await Manager.findOneAndUpdate(
            { id: id },
            { username, password, city }
        );
        res.sendStatus(200); // OK
    } catch (error) {
        console.error('Error updating profile:', error);
    }
});


app.post('/update-profile', async (req, res) => {
    const { id, username, password, city } = req.body;

    try {
        await Customer.findOneAndUpdate(
            { id: id },
            { username, password, city }
        );
        res.sendStatus(200); // OK
    } catch (error) {
        console.error('Error updating profile:', error);
    }
});
// Route to create a new order
app.post('/orders', async (req, res) => {
    const { customerId, totalPrice, numItems, items } = req.body;

    // Validate items
    for (const item of items) {
        if (!item.name || !item.category) {
            return res.status(400).send('Each item must have a valid name and category');
        }
    }

    try {
        // Find the highest existing orderId
        const lastOrder = await Order.findOne().sort({ orderId: -1 }).exec();
        let nextOrderId = 1; // Default starting orderId if no orders exist
        if (lastOrder && lastOrder.orderId) {
            nextOrderId = lastOrder.orderId + 1;
        }

        // Create the new order with the next orderId
        const newOrder = new Order({
            orderId: nextOrderId,
            customerId,
            totalPrice,
            numItems,
            items
        });

        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).send('Error creating order');
    }
});


app.get('/orders', async (req, res) => {
    try {
        const customerId = req.query.customerId;

        if (!customerId) {
            return res.status(400).json({ error: 'Customer ID is required' });
        }

        // Find orders by customer ID
        const orders = await Order.find({ customerId });

        // Return the orders as JSON
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// Route to get sales data by category
app.get('/sales-by-category', async (req, res) => {
    try {
        const result = await Order.aggregate([
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.category",
                    totalSales: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
                    totalItemsSold: { $sum: "$items.quantity" }
                }
            },
            { $sort: { totalSales: -1 } }
        ]).exec();

        res.json(result);
    } catch (err) {
        console.error('Error running aggregation query:', err);
        res.status(500).send('Error running aggregation query');
    }
});

// Route to filter items based on various criteria
app.get('/filter-items', async (req, res) => {
    try {
        const {
            companyName,
            category,
            rgb,
            wireless,
            minPrice,
            maxPrice
        } = req.query;

        // Construct the filter query
        const filterQuery = {};

        if (companyName) {
            filterQuery.companyName = companyName;
        }

        if (category) {
            filterQuery.category = category;
        }

        if (rgb !== undefined) {
            filterQuery.rgb = rgb === 'true'; // Convert to boolean
        }

        if (wireless !== undefined) {
            filterQuery.wireless = wireless === 'true'; // Convert to boolean
        }

        if (minPrice) {
            filterQuery.price = { ...filterQuery.price, $gte: parseFloat(minPrice) };
        }

        if (maxPrice) {
            filterQuery.price = { ...filterQuery.price, $lte: parseFloat(maxPrice) };
        }

        // Fetch the filtered items
        const items = await Item.find(filterQuery);

        res.json(items);
    } catch (error) {
        console.error('Error fetching filtered items:', error);
        res.status(500).send('Error fetching filtered items');
    }
});

app.get('/api/items', async (req, res) => {
    const { minPrice, maxPrice, category, company, rgb, wireless } = req.query;
    const filter = {};

    if (minPrice !== undefined) filter.price = { ...filter.price, $gte: parseFloat(minPrice) };
    if (maxPrice !== undefined) filter.price = { ...filter.price, $lte: parseFloat(maxPrice) };
    if (category) filter.category = category;
    if (company) filter.companyName = company;
    if (rgb !== undefined) filter.rgb = rgb === 'true';
    if (wireless !== undefined) filter.wireless = wireless === 'true';

    try {
        const items = await Item.find(filter);
        res.json(items);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).send('Error fetching items');
    }
});



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});