
function passInfo(){
    let id = document.getElementByName('id').value;
    let username = document.getElementByName('username').value;
    let password = document.getElementByName('password').value;
    if(username==""){
        alert("Enter your name");
    }
    if(password==""){
        alert("Enter your password");
    }
    if(id ==""){
        alert("Enter your id")
    }
}
