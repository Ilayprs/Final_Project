// Fetch user details from localStorage
const id = localStorage.getItem('id');
const userName = localStorage.getItem('userName');
// Function to open a specific modal
function openModal(modalId) {
    closeModal(); // Close any open modal first
    document.getElementById(modalId).style.display = "block";
}
// Function to close all modals
function closeModal() {
    document.getElementById("addProductModal").style.display = "none";
    // Add other modal close logic as needed
    document.getElementById("newCategoryModal").style.display = "none";
    document.getElementById("editProductModal").style.display = "none";
    // Reset inner form fields if applicable (adjust IDs as per your modal structure)
    document.getElementById("editProductStock").value = '';
    document.getElementById("editProductPrice").value = '';
}
async function createCategory() {
    var newCategoryName = document.getElementById("newCategoryName").value.trim(); // Trim whitespace
    if (newCategoryName) {
        try {
            const response = await fetch('/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ categoryName: newCategoryName }),
            });
            if (!response.ok) {
                throw new Error('Failed to create category');
            }
            // If successful, fetch categories again to update the dropdown and add new category to the page
            const newCategory = await response.json();
            // Add new category to the page
            addCategoryToPage(newCategory);
            // Close the modal
            closeModal();
            window.location.reload();
        } catch (error) {
            console.error('Error creating category:', error);
            // Handle error creating category (e.g., display an error message)
        }
    } else {
        alert('Please fill out the category name.');
    }
}
// Function to dynamically add a new category to the page
function addCategoryToPage(category) {
    var categoriesDiv = document.querySelector("section#inventory");
    // Create the new category div
    var newCategoryDiv = document.createElement("div");
    newCategoryDiv.className = "category";
    newCategoryDiv.innerHTML = `
        <h3 class="category-title">${category.name}</h3>
        <div class="product-list"></div>
    `;
    // Add the new category to the HTML structure
    categoriesDiv.appendChild(newCategoryDiv);
    // Add new category to the select dropdown
    var select = document.getElementById("existingCategory");
    var option = document.createElement("option");
    option.text = category.name;
    option.value = category.name;
    //select.add(option);
    // Optionally, sort options alphabetically
    sortSelectOptions(select);
}
// Helper function to sort select options alphabetically
function sortSelectOptions(select) {
    var options = select.options;
    var sortedOptions = Array.from(options).sort((a, b) => a.text.localeCompare(b.text));
    select.options.length = 0; // Clear existing options
    sortedOptions.forEach(option => select.add(option));
}
// Function to add a product to a category
async function addProductToCategory() {
    var productName = document.getElementById("productName").value;
    var productStock = document.getElementById("productStock").value;
    var productPrice = document.getElementById("productPrice").value;
    var companyName = document.getElementById("companyName").value.trim(); // Fetch and trim company name
    var hasRGB = document.getElementById("hasRGB").checked;
    var isWireless = document.getElementById("isWireless").checked;
    var selectedCategory = document.getElementById("existingCategory").value;
    if (productName && productStock && productPrice && selectedCategory && companyName) {
        try {
            const response = await fetch('/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: productName,
                    stock: parseInt(productStock),
                    price: parseFloat(productPrice),
                    company: companyName, // Ensure company name is sent in the request
                    rgb: hasRGB,
                    wireless: isWireless,
                    category: selectedCategory
                }),
            });
            if (!response.ok) {
                throw new Error('Failed to create product');
            }
            const product = await response.json();
            // Find the category div
            var categoryDiv = Array.from(document.getElementsByClassName("category"))
                .find(div => div.querySelector("h3").innerText === selectedCategory);
            if (categoryDiv) {
                // Create the new product element
                var newProductDiv = document.createElement("div");
                newProductDiv.className = "product";
                newProductDiv.innerHTML = `
                    <h3>${product.name}</h3>
                    <p class="product-stock">Stock: ${product.stock}</p>
                    <p class="product-price">Price: $${product.price}</p>
                    <p>Company: ${product.companyName}</p> <!-- Display company name -->
                    <p>Has RGB: ${product.rgb ? 'Yes' : 'No'}</p>
                    <p>Is Wireless: ${product.wireless ? 'Yes' : 'No'}</p>
                    <button onclick="editProduct('${product._id}', '${product.stock}', '${product.price}')">Edit</button>
                    <button onclick="deleteProduct('${product.name}', this)">Delete</button>
                `;
                // Add the new product to the category
                categoryDiv.querySelector(".product-list").appendChild(newProductDiv);
                // Reset the add product form
                document.getElementById("productName").value = '';
                document.getElementById("productStock").value = '';
                document.getElementById("productPrice").value = '';
                document.getElementById("companyName").value = '';
                document.getElementById("hasRGB").checked = false;
                document.getElementById("isWireless").checked = false;
                // Close the modal
                closeModal();
            } else {
                console.error('Selected category not found:', selectedCategory);
            }
        } catch (error) {
            console.error('Error creating product:', error);
            // Handle error creating product (e.g., display an error message)
        }
    } else {
        alert('Please fill out all fields.');
    }
}
// Function to delete a product
async function deleteProduct(productName, button) {
    if (confirm(`Are you sure you want to delete the product: ${productName}?`)) {
        try {
            const response = await fetch(`/products/${productName}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete product');
            }
            // Remove the product from the page
            const productDiv = button.parentElement;
            productDiv.remove();
        } catch (error) {
            console.error('Error deleting product:', error);
            // Handle error deleting product (e.g., display an error message)
        }
    }
}

// Dummy function for editing a product (replace with actual functionality)
// Function to edit a product
function editProduct(productId, currentStock, currentPrice, hasRGB, isWireless) {
    // Populate the modal fields with current values
    document.getElementById('editProductId').value = productId;
    document.getElementById('editProductStock').value = currentStock;
    document.getElementById('editProductPrice').value = currentPrice;

    document.getElementById('editHasRGB').checked = hasRGB;
    document.getElementById('editIsWireless').checked = isWireless;

    // Open the edit product modal
    openModal('editProductModal');
}
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();

        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);

        window.scrollTo({
            top: targetElement.offsetTop - 100, // Adjust this value to match the height of the fixed header
            behavior: 'smooth'
        });
    });
});


window.editProfile = async function() {
    const editProfileModal = document.getElementById('editProfileModal');
    const response = await fetch(`/manager/${id}`);
    
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


// Function to update a product
async function updateProduct() {
    const productName = document.getElementById('editProductName').value;
    const productId = document.getElementById('editProductId').value;
    const updatedStock = document.getElementById('editProductStock').value;
    const updatedPrice = document.getElementById('editProductPrice').value;

    const updatedHasRGB = document.getElementById('editHasRGB').checked;
    const updatedIsWireless = document.getElementById('editIsWireless').checked;

    try {
        const response = await fetch(`/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: productName,
                stock: updatedStock,
                price: updatedPrice,
                rgb: updatedHasRGB,
                wireless: updatedIsWireless,
            }),
        });


        if (!response.ok) {
            throw new Error('Failed to update product');
        }


        const updatedProduct = await response.json();


        // Update the product details on the page
        updateProductOnPage(updatedProduct);


        // Close the modal
        closeModal();

        window.location.reload();

    } catch (error) {
        console.error('Error updating product:', error);
        // Handle error updating product
    }
}
// Function to update product details on the page after editing
function updateProductOnPage(product) {
    const productDiv = document.getElementById(`product-${product._id}`);
    if (productDiv) {
        productDiv.querySelector('.product-stock').textContent = `Stock: ${product.stock}`;
        productDiv.querySelector('.product-price').textContent = `Price: $${product.price}`;
        productDiv.querySelector('.product-rgb').textContent = `RGB: ${product.rgb}`;
        productDiv.querySelector('.product-wireless').textContent = `Wireless: ${product.wireless}`;
    } else {
        console.error('Product element not found on the page:', product._id);
    }
}
// Function to fetch categories and populate the dropdown and page on initial load
async function fetchCategories() {
    try {
        const response = await fetch('/categories');
        const categories = await response.json();
        var select = document.getElementById("existingCategory");
        categories.forEach(async (category) => {
            var option = document.createElement("option");
            option.text = category.name;
            option.value = category.name;
            select.add(option);
            // Add category to the page
            addCategoryToPage(category);
            // Fetch items for this category
            const responseItems = await fetch(`/items?category=${category.name}`);
            const items = await responseItems.json();
            // Display items for this category
            displayItems(category.name, items);
        });
        sortSelectOptions(select);
    } catch (error) {
        console.error('Error fetching categories and items:', error);
        // Handle error fetching categories (e.g., display an error message)
    }
}
// Function to display items under a category
function displayItems(categoryName, items) {
    var categoryDiv = Array.from(document.getElementsByClassName("category"))
        .find(div => div.querySelector("h3").innerText === categoryName);
    if (categoryDiv) {
        var productListDiv = categoryDiv.querySelector(".product-list");
        productListDiv.innerHTML = ''; // Clear existing items


        items.forEach(item => {
            var newProductDiv = document.createElement("div");
            newProductDiv.id = `product-${item._id}`;
            newProductDiv.className = "product";
            newProductDiv.innerHTML = `
                <h3>${item.name}</h3>
                <p class="product-stock">Stock: ${item.stock}</p>
                <p class="product-price">Price: $${item.price}</p>
                <p class="product-company">Company: ${item.companyName || 'N/A'}</p> <!-- Default 'N/A' if companyName is undefined -->
                <p class="product-rgb">Has RGB: ${item.rgb ? 'Yes' : 'No'}</p>
                <p class="product-wireless">Is Wireless: ${item.wireless ? 'Yes' : 'No'}</p>
                <button onclick="editProduct('${item._id}', '${item.stock}', '${item.price}')">Edit</button>
                <button onclick="deleteProduct('${item.name}', this)">Delete</button>
            `;
            productListDiv.appendChild(newProductDiv);
        });
    } else {
        console.error('Selected category not found:', categoryName);
    }
}

// Function to open the personal area modal and populate customer IDs
// Function to open the personal area modal and populate manager and customer data
async function openPersonalArea() {
    document.getElementById('personalAreaModal').style.display = 'block';
    await fetchManagerDetails();
    await fetchCustomerIds(); // Assuming you have a function to populate customer IDs
}

async function fetchCustomerIds() {
    try {
        const response = await fetch('/customer-ids');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const customers = await response.json();
        const customerSelect = document.getElementById('customerSelect');
        
        // Clear previous options
        customerSelect.innerHTML = '';

        // Populate select options with customer IDs
        customers.forEach(customer => {
            const option = document.createElement('option');
            option.value = customer.id;
            option.textContent = customer.id;
            customerSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching customer IDs:', error);
    }
}

// Function to fetch and display manager details
async function fetchManagerDetails() {
    const managerId = localStorage.getItem('id'); // Assuming manager ID is stored in localStorage

    if (!managerId) return;

    try {
        const response = await fetch(`/manager-details/${managerId}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        // Display manager details
        document.getElementById('managerId').textContent = `ID: ${data.id}`;
        document.getElementById('managerName').textContent = `Name: ${data.username}`;
        document.getElementById('managerCity').textContent = `City: ${data.city}`;
    } catch (error) {
        console.error('Error fetching manager details:', error);
    }
}

// Function to fetch and display customer details
// Function to fetch and display customer details
// Function to fetch and display customer details
// Function to fetch and display customer details
async function fetchCustomerDetails() {
    const customerId = document.getElementById('customerSelect').value;

    if (!customerId) return;

    try {
        const response = await fetch(`/customer-details/${customerId}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        // Display customer details
        document.getElementById('customerId').textContent = `ID: ${data.id}`;
        document.getElementById('customerName').textContent = `Name: ${data.username}`;
        document.getElementById('customerCity').textContent = `City: ${data.city}`;
        document.getElementById('customerCredit').textContent = `Credit: $${data.credit}`;

        // Display customer orders
        const ordersList = document.getElementById('customerOrders');
        ordersList.innerHTML = ''; // Clear previous orders

        data.orders.forEach(order => {
            const orderItem = document.createElement('li');
            orderItem.innerHTML = `
                <button onclick="toggleOrderDetails(${order.orderId})" class="orderss">order ${order.orderId}</button>
                <div id="orderDetails_${order.orderId}" style="display: none;" class="details_orders"></div>
            `;
            ordersList.appendChild(orderItem);
        });

    } catch (error) {
        console.error('Error fetching customer details:', error);
    }
}

// Function to toggle visibility of order details
async function toggleOrderDetails(orderId) {
    const detailsContainer = document.getElementById(`orderDetails_${orderId}`);
    
    if (detailsContainer.style.display === 'none') {
        try {
            const response = await fetch(`/orders/${orderId}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const order = await response.json();

            // Display order details
            detailsContainer.innerHTML = `
                <strong>Total Price:</strong> $${order.totalPrice} <br>
                <strong>Items:</strong>
                <ul>
                    ${order.items.map(item => `
                        <li>${item.name}: ${item.quantity} x $${item.price}</li>
                    `).join('')}
                </ul>
            `;

            detailsContainer.style.display = 'block';

        } catch (error) {
            console.error('Error fetching order details:', error);
        }
    } else {
        // Hide the details if already shown
        detailsContainer.style.display = 'none';
    }
}




// Function to close the personal area modal
function closePersonalArea() {
    document.getElementById('personalAreaModal').style.display = 'none';
}

document.getElementById('queryBtn').addEventListener('click', async () => {
    try {
        const response = await fetch('/sales-by-category');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();

        // Display results
        const resultsDiv = document.getElementById('resultsqr');
        resultsDiv.innerHTML = '<h3 class="results-heading">Sales by Category:</h3>' + data.map(category => `
            <div class="category-card">
                <h4>Category: ${category._id}</h4>
                <p>Total Sales: <span class="highlight">$${category.totalSales.toFixed(2)}</span></p>
                <p>Total Items Sold: <span class="highlight">${category.totalItemsSold}</span></p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error fetching sales data:', error);
        document.getElementById('resultsqr').innerHTML = '<p class="error-message">Error fetching sales data</p>';
    }
});


// Function to fetch sales data and render the graph
async function renderSalesGraph() {
    try {
        const response = await fetch('/sales-by-category');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();

        // Prepare data for the graph
        const graphData = data.map(category => ({
            category: category._id,
            totalSales: category.totalSales
        }));

        // Set up the dimensions and margins for the graph
        const margin = { top: 20, right: 30, bottom: 40, left: 90 },
            width = 800 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        // Append the svg object to the div
        const svg = d3.select("#categorySalesGraph")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Add X axis
        const x = d3.scaleLinear()
            .domain([0, d3.max(graphData, d => d.totalSales)])
            .range([0, width]);
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).ticks(5))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

        // Add Y axis
        const y = d3.scaleBand()
            .range([0, height])
            .domain(graphData.map(d => d.category))
            .padding(.1);
        svg.append("g")
            .call(d3.axisLeft(y));

        // Bars
        svg.selectAll("myRect")
            .data(graphData)
            .enter()
            .append("rect")
            .attr("x", x(0))
            .attr("y", d => y(d.category))
            .attr("width", d => x(d.totalSales))
            .attr("height", y.bandwidth())
            .attr("fill", "#69b3a2");

    } catch (error) {
        console.error('Error fetching sales data:', error);
        document.getElementById('categorySalesGraph').innerHTML = '<p class="error-message">Error fetching sales data</p>';
    }
}


// Function to fetch sales data and render the graph
async function renderTotalGraph() {
    try {
        const response = await fetch('/sales-by-category');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();

        // Prepare data for the graph
        const graphData = data.map(category => ({
            category: category._id,
            totalSales: category.totalItemsSold
        }));

        // Set up the dimensions and margins for the graph
        const margin = { top: 20, right: 30, bottom: 40, left: 90 },
            width = 800 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        // Append the svg object to the div
        const svg = d3.select("#categoryTotalGraph")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Add X axis
        const x = d3.scaleLinear()
            .domain([0, d3.max(graphData, d => d.totalSales)])
            .range([0, width]);
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).ticks(5))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

        // Add Y axis
        const y = d3.scaleBand()
            .range([0, height])
            .domain(graphData.map(d => d.category))
            .padding(.1);
        svg.append("g")
            .call(d3.axisLeft(y));

        // Bars
        svg.selectAll("myRect")
            .data(graphData)
            .enter()
            .append("rect")
            .attr("x", x(0))
            .attr("y", d => y(d.category))
            .attr("width", d => x(d.totalSales))
            .attr("height", y.bandwidth())
            .attr("fill", "#69b3a2");

    } catch (error) {
        console.error('Error fetching sales data:', error);
        document.getElementById('categorySalesGraph').innerHTML = '<p class="error-message">Error fetching sales data</p>';
    }
}

// Call renderItemsGraph on window load
window.onload = () => {
    fetchCategories();
    renderSalesGraph(); 
    renderTotalGraph();
};