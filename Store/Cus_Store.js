document.addEventListener('DOMContentLoaded', function() {
    const id = localStorage.getItem('id');

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let products = [];
    let customerCredit = 0;
    let companies = [];

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
                    <p>Company: ${item.companyName}</p>
                    <p>RGB: ${item.rgb ? 'Yes' : 'No'}</p>
                    <p>Wireless: ${item.wireless ? 'Yes' : 'No'}</p>
                    <button onclick="addToCart('${item._id}')" class="filter-button">Add to Cart</button>
                `;
                productList.appendChild(itemElement);
                if (!companies.includes(item.companyName)) {
                    companies.push(item.companyName);
                }
            });
    
            categoryList.appendChild(categoryElement);

        }

        populateCompanySelect();
    }

    function populateCompanySelect() {
        const companySelect = document.getElementById('filterCompany');
        companySelect.innerHTML = '';

        companies.forEach(company => {
            const option = document.createElement('option');
            option.value = company;
            option.textContent = company;
            companySelect.appendChild(option);
        });
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

    window.openPersonalArea = async function() {
        try {
            // Fetch customer profile
            const response = await fetch(`/customer/${id}`);
            if (response.ok) {
                const customer = await response.json();
                document.getElementById('personalUserName').innerText = 'Name: ' + customer.username;
                document.getElementById('personalUserId').innerText = 'ID: ' + customer.id;
                document.getElementById('personalUserType').innerText = 'Type: customer';
    
                // Fetch customer orders
                const ordersResponse = await fetch(`/orders?customerId=${id}`);
                if (ordersResponse.ok) {
                    const orders = await ordersResponse.json();
                    const ordersList = document.getElementById('customerOrdersList');
                    ordersList.innerHTML = '';
    
                    let count = 1;
                    
                    orders.forEach(order => {
                        const orderElement = document.createElement('div');
                        orderElement.className = 'order';
                        orderElement.innerHTML = `
                            <button onclick="toggleOrderDetails(${count})" class="orderss">order ${count}</button>
                            <div onclick="toggleOrderDetails(${count})" class="order-details" id="order-details-${count}" style="display: none;">
                                <p>Total Price: $${order.totalPrice.toFixed(2)}</p>
                                <p>Number of Items: ${order.numItems}</p>
                                <ul>
                                    ${order.items.map(item => `<li>${item.name}: ${item.quantity} x $${item.price.toFixed(2)}</li>`).join('')}
                                </ul>
                            </div>
                        `;
                        ++count;
                        ordersList.appendChild(orderElement);
                    });
                } else {
                    console.error('Error fetching orders:', ordersResponse.statusText);
                }
                
                const personalAreaModal = document.getElementById('personalAreaModal');
                personalAreaModal.style.display = 'block';
            } else {
                console.error('Error fetching customer data:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching customer data:', error);
        }
    }
    
    window.toggleOrderDetails = function(orderNumber) {
        const orderDetailsElement = document.getElementById(`order-details-${orderNumber}`);
        if (orderDetailsElement) {
            if (orderDetailsElement.style.display === 'none') {
                orderDetailsElement.style.display = 'block';
            } else {
                orderDetailsElement.style.display = 'none';
            }
        }
    }
    
    
    
    
    
    window.closePersonalArea = function() {
        const personalAreaModal = document.getElementById('personalAreaModal');
        personalAreaModal.style.display = 'none';
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
            <div class="cart-item">
                <h3 class="cart-item-name">${item.name}</h3>
                <p class="cart-item-quantity">
                    Quantity: 
                    <button class="quantity-btn decrement-btn" onclick="decrementCartItem('${item._id}')">-</button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn increment-btn" onclick="incrementCartItem('${item._id}')">+</button>
                </p>
                <p class="cart-item-price">Price: $${(item.price * item.quantity).toFixed(2)}</p>
                <button onclick="removeFromCart('${item._id}')" class="remove-btn">Remove</button>
            </div>
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
                    window.location.reload();
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
                // Update stock for items
                const responseStock = await fetch('/update-stock', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ items: cart })
                });
                if (!responseStock.ok) {
                    throw new Error('Failed to update stock');
                }
    
                // Update customer credit
                const responseCredit = await fetch('/update-credit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ customerId: id, amount: -totalAmount })
                });
                if (!responseCredit.ok) {
                    throw new Error('Failed to update customer credit');
                }
    
                // Create order object and save to database
                const orderData = {
                    customerId: id,
                    totalPrice: totalAmount,
                    numItems: cart.length,
                    items: cart
                };
    
                const responseOrder = await fetch('/orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(orderData)
                });
                if (!responseOrder.ok) {
                    throw new Error('Failed to create order');
                }
    
                // Clear cart and update UI
                customerCredit -= totalAmount;
                cart = [];
                localStorage.setItem('cart', JSON.stringify(cart));
                closeCheckoutModal();
                closeCartModal();
                renderCategoriesAndItems();
                alert('Checkout successful.');
                window.location.reload(); // Reload the page or redirect as needed
            } catch (error) {
                console.error('Error during checkout:', error);
                alert('Error during checkout. Please try again.');
            }
        } else {
            alert('Insufficient credit. Please add more money.');
        }
    }
    
    window.editProfile = async function() {
        const editProfileModal = document.getElementById('editProfileModal');
        const response = await fetch(`/customer/${id}`);
        
        if (response.ok) {
            const customer = await response.json();
            document.getElementById('newUsername').value = customer.username || '';
            document.getElementById('newPassword').value = ''; // Clear password field
            document.getElementById('newCity').value = customer.city || '';
        } else {
            console.error('Error fetching customer data:', response.statusText);
        }
    
        editProfileModal.style.display = 'block';
    }
    
    
    window.closeEditProfileModal = function() {
        const editProfileModal = document.getElementById('editProfileModal');
        editProfileModal.style.display = 'none';
    }
    
    document.getElementById('editProfileForm').addEventListener('submit', async function(event) {
        event.preventDefault(); // Prevent form from submitting the default way
        window.location.reload();

        const newUsername = document.getElementById('newUsername').value;
        const newPassword = document.getElementById('newPassword').value;
        const newCity = document.getElementById('newCity').value;
    
        try {
            const response = await fetch('/update-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: id,
                    username: newUsername,
                    password: newPassword,
                    city: newCity
                })
            });
    
            if (response.ok) {
                alert('Profile updated successfully.');
                // Update UI with new values if needed
                document.getElementById('personalUserName').innerText = 'Name: ' + newUsername;
                document.getElementById('personalUserId').innerText = 'ID: ' + id;
                document.getElementById('personalUserType').innerText = 'Type: customer';
                document.getElementById('personalUserCity').innerText = 'City: ' + newCity; // Assuming you have this field
    
                closeEditProfileModal(); // Close the edit profile modal
                window.location.reload(); // Refresh the page or update the profile data as needed
            } else {
                console.error('Error updating profile:', response.statusText);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    });
    
    
    
    async function fetchItemProperties() {
        // Simulating fetching item properties; replace with your actual API call
        return [
            { name: 'Color', type: 'select', options: ['Red', 'Blue', 'Green'] },
            { name: 'Size', type: 'select', options: ['Small', 'Medium', 'Large'] },
            { name: 'Brand', type: 'select', options: ['Brand A', 'Brand B', 'Brand C'] },
            { name: 'RGB', type: 'checkbox' },
            { name: 'Wireless', type: 'checkbox' }
        ];
    }

    async function renderFilters() {
        const properties = await fetchItemProperties();
        const filtersForm = document.getElementById('filtersForm');
        filtersForm.innerHTML = '';

        properties.forEach(property => {
            const container = document.createElement('div');
            container.className = 'filter-container';

            if (property.type === 'select') {
                const select = document.createElement('select');
                select.id = property.name;
                select.name = property.name;

                property.options.forEach(option => {
                    const optionElement = document.createElement('option');
                    optionElement.value = option;
                    optionElement.textContent = option;
                    select.appendChild(optionElement);
                });

                container.appendChild(document.createTextNode(property.name + ': '));
                container.appendChild(select);

            } else if (property.type === 'checkbox') {
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = property.name;
                checkbox.name = property.name;

                container.appendChild(checkbox);
                container.appendChild(document.createTextNode(' ' + property.name));
            }

            filtersForm.appendChild(container);
        });
    }

    window.applyFilters = function() {
        const filters = {};
        document.querySelectorAll('#filtersForm select, #filtersForm input[type="checkbox"]').forEach(element => {
            filters[element.name] = element.type === 'checkbox' ? element.checked : element.value;
        });

        // Use the filters to fetch and render filtered items
        fetchAndRenderFilteredItems(filters);
    }

    async function fetchAndRenderFilteredItems(filters) {
        // Implement filtering logic based on selected filters
        // This is an example; you will need to adjust it to match your API and filtering logic
        try {
            const response = await fetch('/items', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(filters)
            });
            if (response.ok) {
                const items = await response.json();
                renderProducts(items);
            } else {
                console.error('Error fetching filtered items:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching filtered items:', error);
        }
    }

    function renderProducts(products) {
        const productList = document.querySelector('.product-list');
        productList.innerHTML = '';

        products.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'product';
            itemElement.innerHTML = `
                <h4>${item.name}</h4>
                <p>Price: $${item.price.toFixed(2)}</p>
                <p>Company: ${item.companyName}</p>
                <p>RGB: ${item.rgb ? 'Yes' : 'No'}</p>
                <p>Wireless: ${item.wireless ? 'Yes' : 'No'}</p>
                <button onclick="addToCart('${item._id}')">Add to Cart</button>
            `;
            productList.appendChild(itemElement);
        });
    }

    async function populateCategorySelect() {
        const categories = await fetchCategories();
        const categorySelect = document.getElementById('categorySelect');
        categorySelect.innerHTML = '<option value="">Select a category</option>';
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    }

    function applyFilters() {
        const company = document.getElementById('companyInput').value;
        const minPrice = parseFloat(document.getElementById('minPrice').value) || 0;
        const maxPrice = parseFloat(document.getElementById('maxPrice').value) || Infinity;
        const category = document.getElementById('categorySelect').value;
        const rgb = document.getElementById('rgbCheckbox').checked;
        const wireless = document.getElementById('wirelessCheckbox').checked;

        // Logic to filter products based on the provided criteria
        filterProducts(company, minPrice, maxPrice, category, rgb, wireless);
    }

    function filterProducts(company, minPrice, maxPrice, category, rgb, wireless) {
        // Implement your filtering logic here
        console.log('Filtering products with:', { company, minPrice, maxPrice, category, rgb, wireless });
        // For example, you could make a fetch request to get the filtered products
    }

    populateCategorySelect();
    // Initialize filters on page load
    renderFilters();
    
});