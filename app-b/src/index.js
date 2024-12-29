const express = require("express");
const { Pool } = require("pg");

const app = express();
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

app.use(express.urlencoded({ extended: true }));

// main page with form
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Enter a Record</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          background-color: #f4f4f4;
        }
        .form-container {
          background: #fff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          text-align: center;
        }
        input {
          width: 80%;
          padding: 10px;
          margin: 10px 0;
          border: 1px solid #ddd;
          border-radius: 5px;
        }
        button {
          padding: 10px 20px;
          background-color: #007BFF;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
        button:hover {
          background-color: #0056b3;
        }
      </style>
    </head>
    <body>
      <div class="form-container">
        <form action="/submit" method="POST">
          <input type="text" name="firstName" placeholder="First Name" required />
          <input type="text" name="lastName" placeholder="Last Name" required />
          <button type="submit">Submit</button>
        </form>
      </div>
    </body>
    </html>
  `);
});

app.post("/submit", async (req, res) => {
  try {
    const { firstName, lastName } = req.body;

    const result = await pool.query(
      "INSERT INTO users (first_name, last_name) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *",
      [firstName, lastName]
    );

    if (result.rows.length > 0) {
      // new record added -> show total count
      const count = await pool.query("SELECT COUNT(*) FROM users");
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Total Records</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background-color: #f4f4f4;
            }
            .message-container {
              background: #fff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
              text-align: center;
            }
            a {
              display: inline-block;
              margin-top: 10px;
              padding: 10px 20px;
              background-color: #007BFF;
              color: white;
              text-decoration: none;
              border-radius: 5px;
            }
            a:hover {
              background-color:#0056b3;
            }
          </style>
        </head>
        <body>
          <div class="message-container">
            <p>Total Records: ${count.rows[0].count}</p>
            <a href="/">Enter a New Record</a>
          </div>
        </body>
        </html>
      `);
    } else {
      // record already exists
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Duplicate Record</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background-color: #f4f4f4;
            }
            .message-container {
              background: #fff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
              text-align: center;
            }
            a {
              display: inline-block;
              margin-top: 10px;
              padding: 10px 20px;
              background-color: #007BFF;
              color: white;
              text-decoration: none;
              border-radius: 5px;
            }
            a:hover {
              background-color: #0056b3;
            }
          </style>
        </head>
        <body>
          <div class="message-container">
            <p>Name already exists</p>
            <a href="/">Enter a New Record</a>
          </div>
        </body>
        </html>
      `);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.listen(3000, () => console.log("App B is running on port 3000"));
