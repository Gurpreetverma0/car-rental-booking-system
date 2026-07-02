// =========================
// Login
// =========================

// const loginForm = document.getElementById("loginForm");

// if (loginForm) {

//     loginForm.addEventListener("submit", function (e) {

//         e.preventDefault();

//         let email = document.getElementById("email").value;
//         let password = document.getElementById("password").value;

//         let savedEmail = localStorage.getItem("email");
//         let savedPassword = localStorage.getItem("password");

//         if (email === savedEmail && password === savedPassword) {

//             localStorage.setItem("isLoggedIn", "true");

//             alert("Login Successful");

//             window.location.href = "/";

//         } else {

//             alert("Invalid Email or Password");

//         }

//     });

// }



// // =========================
// // Register
// // =========================

// const registerForm = document.getElementById("registerForm");

// if (registerForm) {

//     registerForm.addEventListener("submit", function (e) {

       

//         e.preventDefault();

//         let name = document.getElementById("regName").value;
//         let email = document.getElementById("regEmail").value;
//         let password = document.getElementById("regPassword").value;

//         // Check empty fields
//         if (name === "" || email === "" || password === "") {
//             alert("Please fill all fields.");
//             return;
//         }


//         // Save data in LocalStorage
//         localStorage.setItem("name", name);
//         localStorage.setItem("email", email);
//         localStorage.setItem("password", password);

//         alert("Registration Successful!");

//         // Redirect to Login Page
//         window.location.href = "/login";

//     });

// }



// =========================
// Booking Form
// =========================

const bookingForm = document.getElementById("bookingForm");

if (bookingForm) {

    bookingForm.addEventListener("submit", function (e) {

        e.preventDefault();

        alert("Booking Submitted Successfully!\nWe will contact you soon.");

    });

}



// =========================
// Car Search
// =========================

const searchInput = document.getElementById("searchInput");

if (searchInput) {

    searchInput.addEventListener("keyup", function () {

        let filter = searchInput.value.toLowerCase();

        let cards = document.querySelectorAll(".card");

        cards.forEach(function (card) {

            let carName = card.querySelector("h3").innerText.toLowerCase();

            if (carName.includes(filter)) {

                card.style.display = "block";

            } else {

                card.style.display = "none";

            }

        });

    });

}



// =========================
// Logout
// =========================

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener("click", function (e) {

        e.preventDefault();

        localStorage.removeItem("isLoggedIn");

        window.location.href = "/login";

    });

}
// =========================
// Booking Date & Phone Validation
// =========================

document.addEventListener("DOMContentLoaded", function () {

    const today = new Date();

    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    const todayStr = `${yyyy}-${mm}-${dd}`;

    const pickupDate = document.getElementById("pickupDate");
    const returnDate = document.getElementById("returnDate");
    const phoneInput = document.getElementById("phone");

    if (pickupDate) {
        pickupDate.min = todayStr;
    }

    if (returnDate) {
        returnDate.min = todayStr;
    }

    if (phoneInput) {

        phoneInput.addEventListener("input", function () {

            this.value = this.value.replace(/[^0-9]/g, "").slice(0, 10);

        });

    }

});