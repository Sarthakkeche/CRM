# Mini CRM Application (MERN Stack)

This is a full-stack Mini CRM (Customer Relationship Management) application built for the Dev Innovations Labs developer assignment.

---

## 🚀 Live Demo

* **Frontend:**  [https://crm-one-sage.vercel.app/]
* **Backend:** [https://crm-88d6.onrender.com/]

---

## 🛠️ Tech Stack

-   **Frontend:** React.js, React Router, Axios, Context API
-   **Backend:** Node.js, Express.js
-   **Database:** MongoDB (with Mongoose)
-   **Authentication:** JSON Web Tokens (JWT)

---

## ✨ Features

-   **User Authentication:** Secure user registration and login using JWT.
-   **Customer Management:** Full CRUD (Create, Read, Update, Delete) functionality for customers.
-   **Lead Management:** Full CRUD functionality for leads associated with each customer.
-   **Search & Pagination:** Server-side search and pagination for the customer list.
-   **Filtering:** Filter leads by their current status (New, Converted, etc.).
-   **Responsive Design:** The UI is fully responsive and mobile-friendly.

---

### ✅ Bonus Features Implemented

-   [x] State Management using **React Context API**.
-   [x] **Responsive design** for desktop and mobile.
-   [ ] Role-based access (Admin vs. User) - *If you implemented it*
-   [ ] Request validation (Joi/Yup) - *If you implemented it*
-   [ ] Unit test for at least one API - *If you implemented it*
-   [ ] Reporting dashboard with charts - *If you implemented it*

---

## 📦 Local Setup and Installation

### Prerequisites

-   Node.js (v14 or later)
-   npm
-   MongoDB Atlas account or local MongoDB installation

### Setup Instructions

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/Sarthakkeche/CRM.git](https://github.com/Sarthakkeche/CRM.git)
    cd CRM
    ```

2.  **Backend Setup:**
    ```bash
    # Navigate to the backend folder
    cd backend

    # Install dependencies
    npm install

    # Create a .env file in the /backend folder and add your variables
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_super_secret_key

    # Start the backend server
    npm start
    ```
    The backend will be running on `http://localhost:5000`.

3.  **Frontend Setup:**
    ```bash
    # Navigate to the frontend folder from the root directory
    cd ../frontend

    # Install dependencies
    npm install

    # Start the React development server
    npm run dev
    ```
    The frontend will be running on `http://localhost:5173` (or another port).