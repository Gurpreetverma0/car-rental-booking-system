require("dotenv").config();

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const bcrypt = require("bcrypt");
const methodOverride = require("method-override");

const User = require("./models/User");
const Car = require("./models/Car");
const Booking = require("./models/Booking");

const app = express();
const PORT = process.env.PORT || 4000;

// ---------- View engine ----------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ---------- Middleware ----------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "carRentalSecretKey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24
    }
  })
);

app.use(express.static(path.join(__dirname, "public")));

// Make the logged-in user available to every EJS page.
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

// ---------- Auth middleware ----------
function isLoggedIn(req, res, next) {
  if (!req.session.user) return res.redirect("/login");
  next();
}

function isAdmin(req, res, next) {
  if (!req.session.user) return res.redirect("/login");
  if (req.session.user.role !== "admin") return res.status(403).send("Access Denied");
  next();
}

// ---------- Home ----------
app.get("/", (req, res) => {
  res.render("index");
});

// Keep old /index links working.
app.get("/index", (req, res) => res.redirect("/"));

// ---------- Register ----------
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).send("All fields are required.");
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).send("Email already registered. Please login.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword
    });

    console.log("✅ User registered:", normalizedEmail);
    res.redirect("/login");
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).send("Registration Failed");
  }
});

// ---------- Login ----------
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = (email || "").trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) return res.status(401).send("User Not Found");
    const isMatch = await bcrypt.compare(password || "", user.password);

    if (!isMatch) return res.status(401).send("Invalid Password");

    // Store only the required fields in the session.
    req.session.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role
    };

    console.log("✅ Login successful:", user.email);
    res.redirect("/");
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).send("Login Failed");
  }
});

// ---------- Logout ----------
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
});

// ---------- Cars ----------
app.get("/cars", isLoggedIn, async (req, res) => {
  try {
    const cars = await Car.find().sort({ name: 1 });
    res.render("cars", { cars });
  } catch (err) {
    console.error("Cars error:", err);
    res.status(500).send("Unable to Fetch Cars");
  }
});

app.get("/cars/new", isAdmin, (req, res) => {
  res.render("newcar");
});

app.post("/cars", isAdmin, async (req, res) => {
  try {
    const { name, brand, price, image } = req.body;

    await Car.create({
      name: name.trim(),
      brand: brand.trim(),
      price: Number(price),
      image: image.trim()
    });

    res.redirect("/cars");
  } catch (err) {
    console.error("Add car error:", err);
    res.status(500).send("Unable to Add Car");
  }
});

app.get("/cars/:id/edit", isAdmin, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).send("Car Not Found");

    res.render("editCar", { car });
  } catch (err) {
    console.error("Edit car page error:", err);
    res.status(400).send("Invalid Car ID");
  }
});

app.put("/cars/:id", isAdmin, async (req, res) => {
  try {
    const { name, brand, price, image } = req.body;

    await Car.findByIdAndUpdate(req.params.id, {
      name: name.trim(),
      brand: brand.trim(),
      price: Number(price),
      image: image.trim()
    });

    res.redirect("/cars");
  } catch (err) {
    console.error("Update car error:", err);
    res.status(500).send("Unable to Update Car");
  }
});

app.delete("/cars/:id", isAdmin, async (req, res) => {
  try {
    await Car.findByIdAndDelete(req.params.id);
    res.redirect("/cars");
  } catch (err) {
    console.error("Delete car error:", err);
    res.status(500).send("Unable to Delete Car");
  }
});

// ---------- Booking ----------
app.get("/booking", isLoggedIn, async (req, res) => {
  try {
    const cars = await Car.find().sort({ name: 1 });

    let selectedCar = null;
    if (req.query.carId) {
      selectedCar = await Car.findById(req.query.carId);
    }

    res.render("booking", { cars, selectedCar });
  } catch (err) {
    console.error("Booking page error:", err);
    res.status(500).send("Unable to load booking page");
  }
});

app.post("/booking", isLoggedIn, async (req, res) => {
  try {
    const {
      customerName,
      email,
      phone,
      pickupDate,
      returnDate,
      carName
    } = req.body;

    if (!customerName || !email || !phone || !pickupDate || !returnDate || !carName) {
      return res.status(400).send("Please fill all booking fields.");
    }

    if (new Date(returnDate) < new Date(pickupDate)) {
      return res.status(400).send("Return date cannot be before pickup date.");
    }

    await Booking.create({
      userId: req.session.user.id,
      customerName: customerName.trim(),
      email: req.session.user.email,
      phone: phone.trim(),
      pickupDate,
      returnDate,
      carName
    });

    console.log("✅ Booking saved for:", req.session.user.email);
    res.redirect("/my-bookings");
  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).send("Booking Failed");
  }
});

// ---------- User bookings ----------
app.get("/my-bookings", isLoggedIn, async (req, res) => {
  try {
    const bookings = await Booking.find({
      userId: req.session.user.id
    }).sort({ createdAt: -1 });

    res.render("myBookings", { bookings });
  } catch (err) {
    console.error("My bookings error:", err);
    res.status(500).send("Unable to Fetch Your Bookings");
  }
});

// ---------- Admin / booking management ----------
app.get("/bookings", isAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.render("bookings", { bookings });
  } catch (err) {
    console.error("Bookings error:", err);
    res.status(500).send("Unable to Fetch Bookings");
  }
});

app.get("/bookings/:id/edit", isAdmin, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).send("Booking Not Found");

    res.render("editBooking", { booking });
  } catch (err) {
    console.error("Edit booking page error:", err);
    res.status(400).send("Invalid Booking ID");
  }
});

app.put("/bookings/:id", isAdmin, async (req, res) => {
  try {
    await Booking.findByIdAndUpdate(req.params.id, req.body);
    res.redirect("/bookings");
  } catch (err) {
    console.error("Update booking error:", err);
    res.status(500).send("Unable to Update Booking");
  }
});

app.delete("/bookings/:id", isAdmin, async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.redirect("/bookings");
  } catch (err) {
    console.error("Delete booking error:", err);
    res.status(500).send("Unable to Delete Booking");
  }
});

// ---------- Dashboard ----------
app.get("/dashboard", isAdmin, async (req, res) => {
  try {
    const [totalUsers, totalCars, totalBookings, recentBookings] =
      await Promise.all([
        User.countDocuments(),
        Car.countDocuments(),
        Booking.countDocuments(),
        Booking.find().sort({ createdAt: -1 }).limit(5)
      ]);

    res.render("dashboard", {
      totalUsers,
      totalCars,
      totalBookings,
      recentBookings
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).send("Dashboard Error");
  }
});

// ---------- Contact ----------
app.get("/contact", isLoggedIn, (req, res) => {
  res.render("contact");
});

// ---------- Database + server ----------
async function startServer() {
  try {
    if (!process.env.MONGO_URL) {
      throw new Error("MONGO_URL is missing from .env");
    }

    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ MongoDB Connected");
    console.log("Database:", mongoose.connection.name);

    const carCount = await Car.countDocuments();
    if (carCount === 0) {
      await Car.insertMany([
        { name: "Mahindra Thar", brand: "Mahindra", price: 1200, image: "/images/image 1.jpg" },
        { name: "Hyundai Creta", brand: "Hyundai", price: 2500, image: "/images/image 4.jpg" },
        { name: "Tata Nexon", brand: "Tata", price: 2000, image: "/images/image 5.jpg" },
        { name: "Taxi Car", brand: "Toyota", price: 1500, image: "/images/image 6.jpg" },
        { name: "Toyota Corolla", brand: "Toyota", price: 3000, image: "/images/image 7.jpg" },
        { name: "Tesla Model Y", brand: "Tesla", price: 2500, image: "/images/image 8.jpg" },
        { name: "Ford F-Series", brand: "Ford", price: 3000, image: "/images/image 9.jpg" },
        { name: "Honda CR-V", brand: "Honda", price: 2000, image: "/images/image 10.jpg" }
      ]);
      console.log("🚘 Default cars added.");
    }

    app.listen(PORT, () => {
      console.log(`🚗 Server Running On http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ MongoDB connection failed:");
    console.error(err.message);
    console.error("Make sure MongoDB is installed and running, then start the app again.");
  }
}

startServer();
