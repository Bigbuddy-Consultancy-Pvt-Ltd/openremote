const { json } = require("body-parser");
const { Router } = require("express");
const express = require("express");
const Client = require("pg").Pool;

const client = new Client({
    user: "dhawansolanki",
    host: "db.bit.io",
    database: "dhawansolanki/openremote",
    password: "v2_3zhQc_ZWqNqDpQMaCdKxM3tq4VEgt",
    port:5432,
    ssl:true
  });
  
const router = express.Router();

let deviceTypes = 'A'

router.post("/", async (req, res) => {
  try {
    res.send("FetchDetails API LOADED...");
  }catch (err) {
    res.status(400).json(err);
  }
});

router.post('/flowmeter', (req, res) => {
  const { id,name, flowrate, totaliser } = req.body;
    client.query(
        `INSERT INTO device (  id, name,flowrate,totaliser
            ) VALUES ($1,$2,$3,$4);`,
        [
            id,name,flowrate,totaliser
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
    const { id,name, flowrate, totaliser, changes } = req.body;
    try {
      const result1 = await client.query(
        'UPDATE device SET name=$1, flowrate=$2, totaliser=$3 WHERE id=$4 RETURNING *',
        [name, flowrate, totaliser, id]
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
