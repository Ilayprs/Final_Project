// Fetch user details from localStorage
const id = localStorage.getItem('id');
const userName = localStorage.getItem('userName');
document.getElementById('userName').innerText = 'Name: ' + userName;
document.getElementById('userId').innerText = 'ID: ' + id;
document.getElementById('userType').innerText = 'Type: manager';
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
    select.add(option);
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


// Call fetchCategories() when the page loads to populate categories
window.onload = fetchCategories;