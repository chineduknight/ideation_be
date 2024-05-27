# Mini Note App - Backend

This is the backend part of the Mini Note App, which handles user authentication, password management, and note operations.

## Table of Content

- [About The App](#about-the-app)
- [Technologies](#technologies)
- [Setup](#setup)
- [Usage](#usage)
- [Endpoints](#endpoints)
- [Approach](#approach)
- [Status](#status)
- [Credits](#credits)
- [License](#license)

## About The App

This backend service provides RESTful APIs for user registration, login, password reset, and note management. It uses Express.js and Sequelize for handling requests and data persistence, respectively.

## Technologies

- **Node.js**
- **Express.js**
- **Sequelize**
- **TypeScript**
- **jsonwebtoken**
- **bcryptjs**
- **nodemailer**

## Setup

1. **Clone the repository:**
   ```sh
   git clone https://github.com/your-repository-url.git
   cd your-repository-folder/backend
   ```
2. **Install dependencies:**

   ```sh
   npm install

   # or with Yarn

   yarn install
   ```

3. **Environment Variables:**

   Create a `.env` file in the root directory and add the following environment variables:

   ```plaintext
   NODE_ENV=development
   PORT=5000
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d
   DB_HOST=your_database_host
   DB_PORT=your_database_port
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_NAME=your_database_name
   EMAIL_FROM=your_email@example.com
   SMTP_HOST=your_smtp_host
   SMTP_PORT=your_smtp_port
   SMTP_EMAIL=your_smtp_email
   SMTP_PASSWORD=your_smtp_password
   ```

4. **Run the server:**
   ```sh
   npm run build
   npm start
   # or with Yarn
   yarn build
   yarn start
   ```

## Usage

### Running the Application

Start the development server:

```sh
npm start

# or with Yarn

yarn start
```

The server will be running on `http://localhost:5000`.

### Testing the API

You can use Postman or any other API client to test the endpoints. Ensure you have a running instance of the frontend to fully utilize the authentication and note management features.

## Endpoints

### Authentication

- **POST** `/api/auth/register` - Register a new user
- **POST** `/api/auth/login` - Login a user
- **POST** `/api/auth/forgotpassword` - Send password reset email
- **PUT** `/api/auth/resetpassword/:resettoken` - Reset password

### Notes

- **GET** `/api/notes` - Get all notes for the authenticated user
- **POST** `/api/notes` - Create a new note
- **PUT** `/api/notes/:id` - Update a note
- **DELETE** `/api/notes/:id` - Delete a note

## Approach

The project uses a modular approach with controllers and services. JWT is used for securing routes, and Sequelize ORM is used for database interactions. Environment variables are managed using dotenv.

## Status

The Mini Notes App is a work in progress. Future updates will include more features and improvements.

## Credits

List of contributors:

- [Chinedu Knight](https://chineduknight.com)

## License

MIT license @ [knight](chineduknight.com)
