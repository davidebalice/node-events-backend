# Node Events Backend

Backend for an events website, built with Node.js, Express and MongoDB.
It includes an admin CMS (server-side rendered with EJS) to manage events, categories, bookings, reviews and messages, and a public REST API used by the React frontend, with online booking and Stripe payments.

**Live demo (website):** <https://react-events.davidebalice.dev>

**Live demo (admin):** <https://node-events.davidebalice.dev>

![Screenshot](https://www.aroundweb.it/screenshot/events1.jpg)

![Screenshot](https://www.aroundweb.it/screenshot/events2.jpg)

The frontend is available in a separate repository: [react-events-frontend](https://github.com/davidebalice/react-events-frontend).

## Features

- Admin CMS with dashboard, login and user management
- Events with photo, gallery, location and active status
- Categories and subcategories with ordering and photos
- Online booking with [Stripe](https://stripe.com/) payment intents
- Reviews and contact messages, with unread message notifications in the admin
- Public REST API with search and pagination for the frontend
- JWT authentication stored in a cookie
- Demo mode that blocks write operations

## Tech stack

- [Node.js](https://nodejs.org/) and [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- [EJS](https://ejs.co/) with express-ejs-layouts for the admin panel
- [Stripe](https://stripe.com/docs/api) for payments
- [JSON Web Token](https://github.com/auth0/node-jsonwebtoken) and [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- [Multer](https://github.com/expressjs/multer) and [Sharp](https://sharp.pixelplumbing.com/) for image uploads
- [Nodemailer](https://nodemailer.com/)

## Getting started

### Requirements

- Node.js 20 or later
- MongoDB (local or Atlas)
- A Stripe account (test keys are fine)

### Installation

```bash
git clone https://github.com/davidebalice/node-events-backend.git
cd node-events-backend
npm install
```

Sample data (categories and events) is available as MongoDB JSON exports in the `db/` folder and can be imported with `mongoimport`.

### Configuration

Create a `config.env` file in the project root:

```env
NODE_ENV=development
DATABASE=mongodb://127.0.0.1:27017/events
FRONTEND_URL=http://localhost:3000

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

STRIPE_SECRET_KEY=sk_test_xxx
DEMO_MODE=false

EMAIL_FROM=noreply@example.com
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USERNAME=your_smtp_user
EMAIL_PASSWORD=your_smtp_password
SENDGRID_USERNAME=
SENDGRID_PASSWORD=
```

SendGrid credentials are used in production, the generic SMTP settings in development.

### Run

| Command     | Description                                              |
| ----------- | -------------------------------------------------------- |
| `npm start` | Start the server on `http://localhost:8000` with nodemon |

The admin panel is available at `http://localhost:8000/login`.

## API endpoints

Public REST API used by the frontend, prefixed with `/api/v1`.

| Method | Endpoint                    | Description                                       |
| ------ | --------------------------- | ------------------------------------------------- |
| GET    | `/api/v1/events`            | List events (`?key=` search, `?page=`, `?limit=`) |
| GET    | `/api/v1/event/slug/:slug`  | Get an event by slug                              |
| GET    | `/api/v1/event/id/:id`      | Get an event by id                                |
| GET    | `/api/v1/updatedatefordemo` | Move event dates to the current month (demo data) |
| GET    | `/api/v1/categories`        | List categories                                   |
| POST   | `/api/v1/payment-intent`    | Create a Stripe payment intent                    |
| POST   | `/api/v1/booking/create`    | Create a booking                                  |
| POST   | `/api/v1/booking/success`   | Confirm a paid booking                            |
| POST   | `/api/v1/message/send`      | Send a contact message                            |

### Admin panel routes

Server-side rendered pages (EJS), protected by login. `GET` renders the page, `POST` saves the form.

| Area          | Routes                                                                                                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Auth          | `/login`, `/logout`                                                                                                                                                 |
| Dashboard     | `/`                                                                                                                                                                 |
| Events        | `/events`, `/add/event`, `/event/:id`, `/event/photo/:id`, `/event/gallery/:id`, `/event/location/:id`, `/active/event/:id`, `/event/delete/:id`, `/gallery/delete` |
| Categories    | `/categories`, `/add/category`, `/category/:id`, `/category/photo/:id`, `/move/category`, `/active/category/:id`, `/category/delete/:id`                            |
| Subcategories | `/subcategories`, `/subcategories/:categoryId`, `/add/subcategory`, `/subcategory/:id`, `/move/subcategory`, `/active/subcategory/:id`, `/subcategory/delete/:id`   |
| Bookings      | `/bookings`, `/booking/:id`, `/booking/delete/:id`                                                                                                                  |
| Reviews       | `/reviews`, `/review/:id`, `/review/delete/:id`                                                                                                                     |
| Messages      | `/messages`, `/message/:id`, `/message/delete/:id`                                                                                                                  |
| Users         | `/users`, `/add/user`, `/user/:id`, `/user/password/:id`, `/user/photo/:id`, `/user/delete/:id`, `/profile`, `/passwordMe`                                          |

## Project structure

```text
├── index.js        # Express app setup, MongoDB connection and routes
├── routers/        # Admin routes and REST API routes (*ApiRoutes.js)
├── controllers/    # Request handlers
├── models/         # Mongoose models
├── middlewares/    # Auth helpers, error handling, demo mode, email
├── views/          # EJS templates for the admin panel
├── public/         # Static assets
└── db/             # Sample data (MongoDB JSON exports)
```

## Author

**Davide Balice** – [davidebalice.dev](https://www.davidebalice.dev)
