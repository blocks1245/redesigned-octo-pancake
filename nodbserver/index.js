const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(express.json());

const database = 'AllPrintings.sqlite';
const port = 3000;

app.get('/', defaultRequest);

function defaultRequest(req, res) {
  res.status(200).send("Hello world");
}


app.get('/api/card/name/:name', (req, res) => {
  const db = new sqlite3.Database(database);
  var name = req.params.name.toLowerCase();
  const query = `SELECT * FROM cards WHERE LOWER(name) LIKE ? ORDER BY name ASC`;
  console.log("test")
  console.log(query, [name]);

  db.all(query, ["%" + name + "%"], (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.status(200).json(rows);
    }

    db.close();
  });
});

app.get('/api/card/id/:id', (req, res) => {
  const db = new sqlite3.Database(database);
  var id = req.params.id;
  const query = `SELECT * FROM cards WHERE id = ?`;

  db.all(query, [id], (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.status(200).json(rows);
    }

    db.close();
  });
});

app.put('/api/list/put/:list/:cardId', (req, res) => {
  const db = new sqlite3.Database(database);
  var list = req.params.list;
  var cardId = req.params.cardId;
  const createCards = `CREATE TABLE IF NOT EXISTS cardList (
                                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                                    list TEXT NOT NULL,
                                    cardId INTEGER,
                                    FOREIGN KEY(cardId) REFERENCES cards(id));`;
  const query = `INSERT INTO cardList(list, cardId) VALUES(?, ?)`;

  db.run(createCards, (err) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      db.run(query, [list, cardId], (err) => {
        if (err) {
          console.error(err.message);
          res.status(500).json({ error: 'Internal server error' });
        } else {
          res.status(201).send('ok');
        }
      });
    }
  });
  db.close();
});

app.delete('api/list/delete/:list/:cardId', (req, res) => {
  const db = new sqlite3.Database(database);
  var list = req.params.list;
  var cardId = req.params.list
  const query = `DELETE FROM cardList WHERE list = ? AND cardId = ?`
  db.run(query, [list, cardId], (err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'internal server error'});
    } else {
      res.status(201).send('ok');
    }
  });
  db.close();
});

app.get('/api/list', (req, res) => {
  const db = new sqlite3.Database(database);
  const query = `SELECT list, COUNT(cardId) AS listSize FROM cardList GROUP BY list`

  db.all(query, (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.status(200).json(rows);
    }

    db.close();
  });
});

app.get('/api/list/:list', (req, res) => {
  const db = new sqlite3.Database(database);
  var list = req.params.list;
  const query = `SELECT * FROM cardList WHERE list = ?`;

  db.all(query, [list], (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.status(200).json(rows);
    }
    db.close();
  });
});

app.get('api/coffee/', (req, res) => {
  res.status(418).send('418: i can\'t brew coffee im a teapot!')
  // because its funny
})

app.get('*', (req, res) => {
  res.status(404).send('404: This page does not exist')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});