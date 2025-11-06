var firebaseConfig = {
    apiKey: "AIzaSyCdBNcfPgGFbNsD-4OL4iHo9mBhO3opy98",
    authDomain: "client-website-fdd4a.firebaseapp.com",
    databaseURL: "https://client-website-fdd4a-default-rtdb.firebaseio.com/",
    projectId: "client-website-fdd4a",
    storageBucket: "client-website-fdd4a.appspot.com",
    messagingSenderId: "974723244847",
    appId: "1:974723244847:web:bee5ae7bfaf331921d77da"
  };

  var app = firebase.initializeApp(firebaseConfig);
  var db = firebase.database();
  
  function submitData() {

    var name = document.getElementById("namebox").value.trim();
    var email = document.getElementById("emailbox").value.trim();
    var message = document.getElementById("message").value.trim();

    var userObj = {
      User_Name: name,
      User_Email: email,
      User_Message: message,
    };

    db.ref("user").push(userObj)
  }
  const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
  item.addEventListener('click', () => {
    item.classList.toggle('active');
  });
});


  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.querySelector(".nav-links");
  menuToggle.addEventListener("click", () => {
    menuToggle.classList.toggle("active");
    navLinks.classList.toggle("active");
  });