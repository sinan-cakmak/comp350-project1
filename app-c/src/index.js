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

app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users ORDER BY id");
    const rows = result.rows
      .map(
        (row) => `
          <tr>
            <td>${row.id}</td>
            <td>${row.first_name}</td>
            <td>${row.last_name}</td>
            <td>${new Date(row.created_at).toLocaleString()}</td>
            <td><button onclick="deleteRecord(${row.id})">X</button></td>
          </tr>`
      )
      .join("");

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>User Records</title>
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
          table {
            border-collapse: collapse;
            width: 60%;
            margin: auto;
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          th, td {
            padding: 12px 15px;
            border: 1px solid #ddd;
            text-align: center;
          }
          th {
            background-color: #007BFF;
            color: white;
          }
          button {
            padding: 5px 10px;
            background-color: red;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
          }
          button:hover {
            background-color: darkred;
          }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Created At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        <script>
          function deleteRecord(id) {
            fetch('/delete/' + id, { method: 'DELETE' })
              .then(response => {
                if (response.ok) {
                  window.location.href = '/remaining';
                } else {
                  alert('Error deleting record');
                }
              });
          }
        </script>
      </body>
      </html>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.delete("/delete/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM users WHERE id = $1", [req.params.id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// remaining record counts
app.get("/remaining", async (req, res) => {
  try {
    const countResult = await pool.query("SELECT COUNT(*) FROM users");
    const count = countResult.rows[0].count;

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Remaining Records</title>
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
          <p>Remaining Records: ${count}</p>
          <a href="/">Back to List</a>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.listen(3001, () => console.log("App C is running on port 3001"));
