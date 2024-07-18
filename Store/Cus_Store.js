document.addEventListener('DOMContentLoaded', function() {
    const id = localStorage.getItem('id');
    const userName = localStorage.getItem('userName');
    document.getElementById('userName').innerText = 'Name: ' + userName;
    document.getElementById('userId').innerText = 'ID: ' + id;
    document.getElementById('userType').innerText = 'Type: customer';

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let products = [];
    let customerCredit = 0;

    async function fetchCategories() {
        const response = await fetch('/categories');
        if (response.ok) {
            return await response.json();
        } else {
            console.error('Error fetching categories:', response.statusText);
        }
    }

    async function fetchItemsByCategory(categoryName) {
        const response = await fetch(`/items?category=${encodeURIComponent(categoryName)}`);
        if (response.ok) {
            return await response.json();
        } else {
            console.error('Error fetching items:', response.statusText);
        }
    }

    async function fetchProducts() {
        const response = await fetch('/items');
        if (response.ok) {
            products = await response.json();
        } else {
            console.error('Error fetching products:', response.statusText);
        }
    }

    async function fetchCustomerCredit() {
        const response = await fetch(`/customer/${id}`);
        if (response.ok) {
            const customer = await response.json();
            customerCredit = customer.credit;
        } else {
            console.error('Error fetching customer credit:', response.statusText);
        }
    }

    async function renderCategoriesAndItems() {
        const categories = await fetchCategories();
        const categoryList = document.querySelector('.category-list');
        categoryList.innerHTML = '';

        for (const category of categories) {
            const items = await fetchItemsByCategory(category.name);

            const categoryElement = document.createElement('div');
            categoryElement.className = 'category';
            categoryElement.innerHTML = `<h2>${category.name}</h2><div class="product-list"></div>`;

            const productList = categoryElement.querySelector('.product-list');
            items.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'product';
                itemElement.innerHTML = `
                    <h4>${item.name}</h4>
                    <p>Price: $${item.price.toFixed(2)}</p>
                    <button onclick="addToCart('${item._id}')">Add to Cart</button>
                `;
                productList.appendChild(itemElement);
            });

            categoryList.appendChild(categoryElement);
        }
    }

    function updateProductStock() {
        cart.forEach(cartItem => {
            const product = products.find(p => p._id === cartItem._id);
            if (product) {
                product.stock -= cartItem.quantity;
            }
        });
    }

    window.addToCart = async function(productId) {
        try {
            const response = await fetch(`/items/${productId}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const product = await response.json();
            if (product && product.stock > 0) {
                const cartItem = cart.find(item => item._id === productId);
                if (cartItem) {
                    cartItem.quantity += 1;
                } else {
                    cart.push({ ...product, quantity: 1 });
                }
                product.stock -= 1;
                localStorage.setItem('cart', JSON.stringify(cart));
                alert(`${product.name} has been added to your cart.`);
                renderCategoriesAndItems();
            } else {
                alert(`${product.name} is out of stock.`);
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
        }
    }

    async function initialize() {
        await fetchProducts();
        await fetchCustomerCredit();
        document.getElementById('custCredit').innerText = 'Credits: ' + customerCredit;
        await renderCategoriesAndItems();
        updateProductStock();
    }

    initialize();

    window.openCartModal = function() {
        const cartModal = document.getElementById('cartModal');
        renderCart();
        cartModal.style.display = 'block';
    }

    window.closeCartModal = function() {
        const cartModal = document.getElementById('cartModal');
        cartModal.style.display = 'none';
    }

    function renderCart() {
        const cartList = document.querySelector('.cart-list');
        cartList.innerHTML = '';
    
        cart.forEach(item => {
            const cartItemElement = document.createElement('div');
            cartItemElement.innerHTML = `
                <h3>${item.name}</h3>
                <p>Quantity: 
                    <button onclick="decrementCartItem('${item._id}')">-</button>
                    <span>${item.quantity}</span>
                    <button class="increment-btn" onclick="incrementCartItem('${item._id}')">+</button>
                </p>
                <p>Price: $${(item.price * item.quantity).toFixed(2)}</p>
                <button onclick="removeFromCart('${item._id}')">Remove</button>
            `;
            cartList.appendChild(cartItemElement);
    
            // Disable increment button if stock is 0
            const incrementButton = cartItemElement.querySelector('.increment-btn');
            incrementButton.disabled = item.stock === 0;
        });
    }
    
    
    
    
    

    window.incrementCartItem = async function(productId) {
        try {
            const response = await fetch(`/items/${productId}`);
            const product = await response.json();
    
            if (!product) {
                throw new Error('Product not found');
            }
    
            if (product.stock > 0) {
                const cartItem = cart.find(item => item._id === productId);
    
                if (cartItem) {
                    cartItem.quantity += 1;
                    product.stock -= 1;
                    localStorage.setItem('cart', JSON.stringify(cart));
                    renderCart(); // Update cart UI
                    renderCategoriesAndItems(); // Refresh categories/items UI if needed
                } else {
                    alert(`${product.name} is not found in the cart.`);
                }
            } else {
                alert(`${product.name} is out of stock.`);
            }
        } catch (error) {
            console.error('Error incrementing cart item:', error);
            alert('Error incrementing cart item. Please try again.');
        }
    }
    
    
    

    window.decrementCartItem = function(productId) {
        const cartItem = cart.find(item => item._id === productId);
        if (cartItem) {
            cartItem.quantity -= 1;
            if (cartItem.quantity === 0) {
                cart = cart.filter(item => item._id !== productId);
            }
            const product = products.find(p => p._id === productId);
            if (product) {
                product.stock += 1;
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCart();
            renderCategoriesAndItems();
        }
    }

    window.removeFromCart = function(productId) {
        const product = products.find(p => p._id === productId);
        if (product) {
            product.stock += cart.find(item => item._id === productId).quantity;
        }
        cart = cart.filter(item => item._id !== productId);
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
        renderCategoriesAndItems();
    }

    function calculateTotalAmount() {
        let total = 0;
        cart.forEach(item => {
            total += item.price * item.quantity;
        });
        return total.toFixed(2);
    }

    function renderTotalAmount() {
        const totalAmountElement = document.getElementById('totalAmount');
        totalAmountElement.textContent = `$${calculateTotalAmount()}`;
    }

    window.openCheckoutModal = function() {
        renderTotalAmount();
        const checkoutModal = document.getElementById('checkoutModal');
        checkoutModal.style.display = 'block';
    }

    window.closeCheckoutModal = function() {
        const checkoutModal = document.getElementById('checkoutModal');
        checkoutModal.style.display = 'none';
    }

    window.addMoney = async function() {
        const addMoneyInput = document.getElementById('addMoney');
        const amount = parseFloat(addMoneyInput.value);
        if (!isNaN(amount) && amount > 0) {
            try {
                const response = await fetch('/update-credit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ customerId: id, amount })
                });
                if (response.ok) {
                    customerCredit += amount;
                    alert('Money added successfully.');
                    addMoneyInput.value = '';
                } else {
                    console.error('Error adding money:', response.statusText);
                }
            } catch (error) {
                console.error('Error adding money:', error);
            }
        } else {
            alert('Please enter a valid amount.');
        }
    }

    window.confirmCheckout = async function() {
        const totalAmount = parseFloat(calculateTotalAmount());
        if (customerCredit >= totalAmount) {
            try {
                const response = await fetch('/update-stock', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ items: cart })
                });
                if (!response.ok) {
                    throw new Error('Error updating stock');
                }
    
                await fetch('/update-credit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ customerId: id, amount: -totalAmount })
                });
    
                // Create the order
                const orderData = {
                    customerId: id,
                    totalPrice: totalAmount,
                    numItems: cart.length,
                    items: cart.map(item => ({
                        _id: item._id,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity
                    }))
                };
    
                const orderResponse = await fetch('/orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(orderData)
                });
    
                if (orderResponse.ok) {
                    alert('Checkout successful.');
                    cart = [];
                    localStorage.setItem('cart', JSON.stringify(cart));
                    closeCheckoutModal();
                    closeCartModal();
                    renderCategoriesAndItems();
                    window.location.reload();
                } else {
                    throw new Error('Error creating order');
                }
            } catch (error) {
                console.error('Error during checkout:', error);
                alert('Error during checkout. Please try again.');
            }
        } else {
            alert('Insufficient credit. Please add more money.');
        }
    }
    
});
