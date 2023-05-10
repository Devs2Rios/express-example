const morgan = require('morgan'),
    express = require('express'),
    cors = require('cors'),
    sqlite3 = require('sqlite3').verbose(),
    app = express(),
    port = process.env.PORT || 8080;

app.use(
    morgan('tiny'),
    express.json(),
    cors({ origin: '*', allowedHeaders: '*' })
);

app.get('/', (req, res) => {
    const db = new sqlite3.Database('./data.db');
    db.all('SELECT * FROM users', (err, rows) => {
        if (err) {
            res.status(500).send(err.message);
            return;
        }
        db.close();
        res.status(200).json({
            success: true,
            data: rows,
        });
    });
});

app.post('/add', (req, res) => {
    const { ens } = req.body,
        db = new sqlite3.Database('./data.db');

    if (!/^[a-z]+\.eth$/.test(ens)) {
        res.status(400).send('ENS must be lowercase and end with .eth');
        return;
    }

    db.run('INSERT INTO users (ens) VALUES (?)', [ens], function (err) {
        if (err) {
            res.status(500).send(err.message);
            return;
        }
        const id = this.lastID;
        db.close();
        res.status(201).json({
            success: true,
            data: { id, ens },
        });
    });
});

app.put('/edit/:id', (req, res) => {
    const { ens } = req.body,
        { id } = req.params,
        db = new sqlite3.Database('./data.db');

    if (!id || !/\d+/.test(id)) {
        res.status(400).send('Must be a valid ID');
        return;
    }

    if (!/^[a-z]+\.eth$/.test(ens)) {
        res.status(400).send('ENS must be lowercase and end with .eth');
        return;
    }

    db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).send(err.message);
            return;
        }

        if (!row) {
            res.status(404).send('ID not found');
            return;
        }

        db.run(
            'UPDATE users SET ens = ? WHERE id = ?',
            [ens, id],
            function (err) {
                if (err) {
                    res.status(500).send(err.message);
                    return;
                }
                db.close();
                res.status(200).json({
                    success: true,
                    data: { id, ens },
                });
            }
        );
    });
});

app.delete('/delete/:id', (req, res) => {
    const { id } = req.params,
        db = new sqlite3.Database('./data.db');

    if (!id || !/\d+/.test(id)) {
        res.status(400).send('Must be a valid ID');
        return;
    }

    db.run('DELETE FROM users WHERE id = ?', [id], function (err) {
        if (err) {
            res.status(500).send(err.message);
            return;
        }
        if (this.changes === 0) {
            res.status(404).send('ID not found');
            return;
        }
        db.close();
        res.status(200).json({
            success: true,
            data: { id },
        });
    });
});

app.all('*', (req, res) => {
    res.status(400).send('404 - Page Not Found');
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
