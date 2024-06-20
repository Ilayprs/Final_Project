function passInfo(){
    let type = document.getElementById('selection').value;
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;
    if(username==""){
        alert("Enter your name");
    }
    if(password==""){
        alert("Enter your password");
    }
    sessionStorage.setItem('username', username);
    sessionStorage.setItem('type', type);
    sessionStorage.setItem('password', password)
    window.location.href = ''; //FIX!!!!


}