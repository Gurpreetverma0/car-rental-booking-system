// =========================
// Login
// =========================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", function (e) {

        e.preventDefault();

        let email = document.getElementById("email").value;
        let password = document.getElementById("password").value;

        let savedEmail = localStorage.getItem("email");
        let savedPassword = localStorage.getItem("password");

        if (email === savedEmail && password === savedPassword) {

            localStorage.setItem("isLoggedIn", "true");

            alert("Login Successful");

            window.location.href = "index.html";

        } else {

            alert("Invalid Email or Password");

        }

    });

}

// =========================
// Register
// =========================

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", function (e) {

        e.preventDefault();

        let name = document.getElementById("regName").value.trim();
        let email = document.getElementById("regEmail").value.trim();
        let password = document.getElementById("regPassword").value.trim();

        if (name.length < 3) {

            alert("Name must be at least 3 characters.");

            return;

        }

        localStorage.setItem("name", name);
        localStorage.setItem("email", email);
        localStorage.setItem("password", password);

        // Agar koi user pehle se login hai to usko logout kar do
        localStorage.removeItem("isLoggedIn");

        alert("Registration Successful");

        window.location.href = "login.html";

    });

}

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

        window.location.href = "login.html";

    });

}
