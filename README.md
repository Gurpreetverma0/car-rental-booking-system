# Car Rental Booking System

Node.js + Express + EJS + MongoDB car rental application.

## Run locally
1. Make sure MongoDB is running.
2. Open this project folder in VS Code.
3. Run `npm install`.
4. Run `node app.js`.
5. Open http://localhost:4000 (do not use Live Server).

## User accounts
Registration is stored permanently in MongoDB (`carRentalDB.users`). A returning user does not register again: they simply log in with the same email and password. Passwords are stored as bcrypt hashes.

## Bookings
Each booking is linked to the logged-in user's MongoDB `_id`. Users can see their own bookings at `/my-bookings`; administrators can manage all bookings from `/bookings`.
