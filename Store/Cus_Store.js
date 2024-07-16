document.addEventListener('DOMContentLoaded', function() {
    const id = localStorage.getItem('id');
    const userName = localStorage.getItem('userName');
    document.getElementById('userName').innerText = 'Name: ' + userName;
    document.getElementById('userId').innerText = 'ID: ' + id;
    document.getElementById('userType').innerText = 'Type: customer';

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let addedMoney = 0; // Variable to store the added money amount

    // Function to fetch categories from the server
    async function fetchCategories() {
        try {
            const response = await fetch('/categories'); // Adjust URL as per your server setup
            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }
            const categories = await response.json();
            return categories;
        } catch (error) {
            console.error('Error fetching categories:', error);
            return [];
        }
    }

    // Function to fetch items from the server
    async function fetchItems() {
        try {
            const response = await fetch('/items'); // Adjust URL as per your server setup
            if (!response.ok) {
                throw new Error('Failed to fetch items');
            }
            const items = await response.json();
            return items;
        } catch (error) {
            console.error('Error fetching items:', error);
            return [];
        }
    }

    // Function to render categories and their respective products
    async function renderCategories() {
        try {
            const categories = await fetchCategories();
            const categoryList = document.querySelector('.category-list');
            categoryList.innerHTML = ''; // Clear existing category list

            // Iterate through categories
            for (const category of categories) {
                const categoryElement = document.createElement('div');
                categoryElement.className = 'category';
                categoryElement.innerHTML = `
                    <h3>${category.name}</h3>
                    <div class="product-list" id="category-${category._id}">
                        <!-- Products will be dynamically populated here -->
                    </div>
                `;
                categoryList.appendChild(categoryElement);
                await renderProducts(category._id); // Render products for each category
            }
        } catch (error) {
            console.error('Error rendering categories:', error);
        }
    }

    // Function to render products based on category ID
    async function renderProducts(categoryId) {
        try {
            const items = await fetchItems();
            const productList = document.getElementById(`category-${categoryId}`);
            productList.innerHTML = ''; // Clear previous product list

            // Filter items by category ID
            const categoryItems = items.filter(item => item.category === categoryId);

            categoryItems.forEach(item => {
                const productElement = document.createElement('div');
                productElement.className = 'product';
                productElement.innerHTML = `
                    <h3>${item.name}</h3>
                    <p>Stock: ${item.stock}</p>
                    <p>Price: $${item.price.toFixed(2)}</p>
                    <button onclick="addToCart('${item._id}')">Add to Shopping Cart</button>
                `;
                productList.appendChild(productElement);
            });
        } catch (error) {
            console.error(`Error rendering products for category ${categoryId}:`, error);
        }
    }

    // Function to add item to cart
    window.addToCart = function(itemId) {
        const item = items.find(i => i._id === itemId);
        if (item && item.stock > 0) {
            const cartItem = cart.find(item => item.id === itemId);
            if (cartItem) {
                cartItem.quantity += 1;
            } else {
                cart.push({ ...item, quantity: 1 });
            }
            item.stock -= 1; // Decrease the stock
            localStorage.setItem('cart', JSON.stringify(cart)); // Save cart to localStorage
            alert(`${item.name} has been added to your shopping cart.`);
            renderProducts(item.category); // Re-render products to update stock display
        } else {
            alert(`${item.name} is out of stock.`);
        }
    };

    // Function to update item stock in the UI after checkout
    function updateItemStock() {
        cart.forEach(cartItem => {
            const item = items.find(i => i._id === cartItem.id);
            if (item) {
                item.stock -= cartItem.quantity;
            }
        });
    }

    // Function to open the shopping cart modal
    window.openCartModal = function() {
        const cartModal = document.getElementById('cartModal');
        renderCart();
        cartModal.style.display = 'block';
    };

    // Function to close the shopping cart modal
    window.closeCartModal = function() {
        const cartModal = document.getElementById('cartModal');
        cartModal.style.display = 'none';
    };

    // Function to render the shopping cart
    function renderCart() {
        const cartList = document.querySelector('.cart-list');
        cartList.innerHTML = '';
        cart.forEach(item => {
            const cartItemElement = document.createElement('div');
            cartItemElement.innerHTML = `
                <h3>${item.name}</h3>
                <p>Quantity: 
                    <button onclick="decrementCartItem('${item.id}')">-</button>
                    ${item.quantity}
                    <button onclick="incrementCartItem('${item.id}')">+</button>
                </p>
                <p>Price: $${(item.price * item.quantity).toFixed(2)}</p>
            `;
            cartList.appendChild(cartItemElement);
        });
    }

    // Function to increment quantity of an item in the cart
    window.incrementCartItem = function(itemId) {
        const cartItem = cart.find(item => item.id === itemId);
        if (cartItem) {
            const item = items.find(i => i._id === itemId);
            if (item && item.stock > 0) {
                cartItem.quantity += 1;
                item.stock -= 1;
                localStorage.setItem('cart', JSON.stringify(cart));
                renderCart();
                renderProducts(item.category); // Update product list to reflect stock changes
            } else {
                alert(`${item.name} is out of stock.`);
            }
        }
    };

    // Function to decrement quantity of an item in the cart
    window.decrementCartItem = function(itemId) {
        const cartItem = cart.find(item => item.id === itemId);
        if (cartItem) {
            cartItem.quantity -= 1;
            if (cartItem.quantity === 0) {
                cart = cart.filter(item => item.id !== itemId);
            }
            const item = items.find(i => i._id === itemId);
            if (item) {
                item.stock += 1;
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCart();
            renderProducts(item.category); // Update product list to reflect stock changes
        }
    };

    // Function to calculate total amount in the cart
    function calculateTotalAmount() {
        let total = 0;
        cart.forEach(item => {
            total += item.price * item.quantity;
        });
        return total.toFixed(2);
    }

    // Function to render total amount in the checkout modal
    function renderTotalAmount() {
        const totalAmountElement = document.getElementById('totalAmount');
        totalAmountElement.textContent = `$${calculateTotalAmount()}`;
    }

    // Function to open the checkout modal
    window.openCheckoutModal = function() {
        renderTotalAmount();
        const checkoutModal = document.getElementById('checkoutModal');
        checkoutModal.style.display = 'block';
    };

    // Function to close the checkout modal
    window.closeCheckoutModal = function() {
        const checkoutModal = document.getElementById('checkoutModal');
        checkoutModal.style.display = 'none';
    };

    // Function to add money to the addedMoney variable
    window.addMoney = function() {
        const addMoneyInput = document.getElementById('addMoney');
        const amount = parseFloat(addMoneyInput.value);
        if (!isNaN(amount) && amount > 0) {
            addedMoney += amount;
            alert(`Added $${amount.toFixed(2)} to your account.`);
            addMoneyInput.value = ''; // Clear input field
        } else {
            alert('Please enter a valid amount to add.');
        }
    };

    // Function to confirm checkout
    window.confirmCheckout = function() {
        // Check if there is enough money added for the purchase
        const totalAmount = parseFloat(calculateTotalAmount());
        if (addedMoney >= totalAmount) {
            // Perform any necessary actions upon confirmation, e.g., process payment
            alert('Your order has been confirmed!');
            // Clear the cart after checkout
            cart = [];
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCart();
            renderCategories(); // Re-render categories and products to reflect changes
            closeCheckoutModal();
            updateItemStock(); // Update item stock in the UI after checkout
        } else {
            alert('Please add enough money to your account before proceeding.');
        }
    };

    // Initialize rendering of categories and products on page load
    renderCategories();
});
