function editProduct(product) {
    alert("Editing product: " + product);
}

function deleteProduct(product) {
    alert("Deleting product: " + product);
}

document.getElementById('addProductBtn').addEventListener('click', function() {
    alert("Adding new product.");
});

function updateOrderStatus(orderId, status) {
    alert("Updating order #" + orderId + " to status: " + status);
}

document.getElementById('profile-form').addEventListener('submit', function(event) {
    event.preventDefault();
    alert("Profile updated for " + document.getElementById('name').value + "!");
});
