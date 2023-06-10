const { json } = require("body-parser");
const { Router } = require("express");
const express = require("express");
const Client = require("pg").Pool;
require('dotenv').config()

// const DB_USER = process.env.DB_USER; 
// const DB_HOST = process.env.DB_HOST; 
// const DB_DATABASE = process.env.DB_DATABASE; 
// const DB_PASSWORD = process.env.DB_PASSWORD; 

DB_USER="dhawansolanki"
DB_HOST="db.bit.io"
DB_DATABASE="dhawansolanki/openremote"
DB_PASSWORD="v2_3zhQc_ZWqNqDpQMaCdKxM3tq4VEgt"

const client = new Client({
    user: DB_USER,
    host: DB_HOST,
    database: DB_DATABASE,
    password: DB_PASSWORD,
    port:5432,
    ssl:true
  });
  
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    res.send("FetchDetails API LOADED...");
  }catch (err) {
    res.status(400).json(err);
  }
});

router.post('/flowmeter', (req, res) => {
  const { id,name, flowrate, totaliser,email } = req.body;
    client.query(
        `INSERT INTO device (  id, name,flowrate,totaliser,email
            ) VALUES ($1,$2,$3,$4,$5);`,
        [
            id,name,flowrate,totaliser,email
        ],
        (err) => {
          if (err) {
            console.error(err);
            return res.status(400).json({
              error: "Database error",
            });
          } else {
            res.status(200).send({ message: "DATA added to database" });
          }
        }
      );
        res.status('Data Added')
  });
  

  router.get('/flowmeter/details/:id', async (req, res) => {
    const id = req.params.id;
    try {
      const result = await client.query(`SELECT * FROM device WHERE id=$1`, [id]);
      res.send(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error retrieving data from bit.io database');
    }
  });

  router.put('/flowmeter/details', async (req, res) => {
    const { id,name, flowrate, totaliser, changes, email } = req.body;
    try {
      const result1 = await client.query(
        'UPDATE device SET name=$1, flowrate=$2, totaliser=$3, email=$4 WHERE id=$5 RETURNING *',
        [name, flowrate, totaliser, id, email]
      );
      const result2 = await client.query(
        'INSERT INTO devicehistory (device_id, changes,timestamp) VALUES ($1, $2,NOW()) RETURNING *',
        [id, changes]
      );
      res.send({ updatedDevice: result1.rows[0], historyRecord: result2.rows[0] });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error updating data in database');
    }
  });

module.exports = router;
