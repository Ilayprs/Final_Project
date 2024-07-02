        // Function to open a specific modal
        function openModal(modalId) {
            closeModal(); // Close any open modal first
            document.getElementById(modalId).style.display = "block";
        }

        // Function to close all modals
        function closeModal() {
            document.getElementById("addProductModal").style.display = "none";
            document.getElementById("newCategoryModal").style.display = "none";
        }

        async function createCategory() {
            var newCategoryName = document.getElementById("newCategoryName").value;
            
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
                    const newCategory = { name: newCategoryName };
                    addCategoryToPage(newCategory);
        
                    // Close the modal
                    closeModal();
        
                } catch (error) {
                    console.error('Error creating category:', error);
                    // Handle error creating category
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

        // Function to add product to a category
        function addProductToCategory() {
            var productName = document.getElementById("productName").value;
            var productStock = document.getElementById("productStock").value;
            var productPrice = document.getElementById("productPrice").value;
            var selectedCategory = document.getElementById("existingCategory").value;

            if (productName && productStock && productPrice && selectedCategory) {
                // Find the category div
                var categoryDiv = Array.from(document.getElementsByClassName("category")).find(div => div.querySelector("h3").innerText.includes(selectedCategory));

                // Create the new product element
                var newProductDiv = document.createElement("div");
                newProductDiv.className = "product";
                newProductDiv.innerHTML = `
                    <h3>${productName}</h3>
                    <p>Stock: ${productStock}</p>
                    <p>Price: $${productPrice}</p>
                    <button onclick="editProduct('${productName}')">Edit</button>
                    <button onclick="deleteProduct('${productName}')">Delete</button>
                `;

                // Add the new product to the category
                categoryDiv.querySelector(".product-list").appendChild(newProductDiv);

                // Reset the add product form
                document.getElementById("productName").value = '';
                document.getElementById("productStock").value = '';
                document.getElementById("productPrice").value = '';

                // Close the modal
                closeModal();
            } else {
                alert('Please fill out all fields.');
            }
        }

        function editProduct(productName) {
            alert('Edit product: ' + productName);
        }

        function deleteProduct(productName) {
            alert('Delete product: ' + productName);
        }

        function editProfile() {
            alert('Edit profile');
        }

// Function to fetch categories and populate the dropdown
async function fetchCategories() {
    try {
        const response = await fetch('/categories');
        const categories = await response.json();

        // Populate the select dropdown with fetched categories
        var select = document.getElementById("existingCategory");
        categories.forEach(category => {
            var option = document.createElement("option");
            option.text = category.name;
            option.value = category.name;
            select.add(option);
        });

        // Optionally, sort options alphabetically
        sortSelectOptions(select);

    } catch (error) {
        console.error('Error fetching categories:', error);
        // Handle error fetching categories
    }
}

// Call fetchCategories() when the page loads
window.onload = fetchCategories;
