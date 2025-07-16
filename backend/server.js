// backend/server.js

require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

const dbPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- AUTH ROUTES ---
app.post('/api/signup', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ message: 'Username and password are required.' });
        const hashedPassword = await bcrypt.hash(password, 10);
        await dbPool.execute('INSERT INTO bunker (username, password) VALUES (?, ?)', [username, hashedPassword]);
        const vaultId = uuidv4();
        await dbPool.execute('INSERT INTO vault (id, namavault, bunker_username) VALUES (?, ?, ?)', [vaultId, `${username}'s Vault`, username]);
        res.status(201).json({ message: 'User created successfully!' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Username already exists.' });
        console.error('Signup Error:', error);
        res.status(500).json({ message: 'Server error during signup.' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const [rows] = await dbPool.execute('SELECT * FROM bunker WHERE username = ?', [username]);
        if (rows.length === 0) return res.status(401).json({ message: 'Invalid username or password.' });
        const user = rows[0];
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) return res.status(401).json({ message: 'Invalid username or password.' });
        const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '8h' });
        res.status(200).json({ message: 'Login successful!', token });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// --- FOLDER ROUTES ---
app.get('/api/memos', authenticateToken, async (req, res) => {
    try {
        const { username } = req.user;

        // We use a JOIN to get all memos from all folders that belong to the user's vault.
        const [memos] = await dbPool.execute(
            `SELECT m.id, m.judul, m.date, m.icon_name 
             FROM memo m
             JOIN folder f ON m.folder_id = f.id
             JOIN vault v ON f.vault_id = v.id
             WHERE v.bunker_username = ? 
             ORDER BY m.date DESC`,
            [username]
        );

        res.json(memos);
    } catch (error) {
        console.error('Get All Memos Error:', error);
        res.status(500).json({ message: 'Failed to fetch all memos.' });
    }
});

app.get('/api/folders', authenticateToken, async (req, res) => {
    try {
        const { username } = req.user;
        const [vaults] = await dbPool.execute('SELECT id FROM vault WHERE bunker_username = ?', [username]);
        if (vaults.length === 0) return res.status(404).json({ message: 'User vault not found.' });
        const vaultId = vaults[0].id;
        const [folders] = await dbPool.execute('SELECT id, name FROM folder WHERE vault_id = ?', [vaultId]);
        res.json(folders);
    } catch (error) {
        console.error('Get Folders Error:', error);
        res.status(500).json({ message: 'Failed to fetch folders.' });
    }
});

app.post('/api/folders', authenticateToken, async (req, res) => {
    try {
        const { name } = req.body;
        const { username } = req.user;
        const [vaults] = await dbPool.execute('SELECT id FROM vault WHERE bunker_username = ?', [username]);
        const vaultId = vaults[0].id;
        const newFolderId = uuidv4();
        await dbPool.execute('INSERT INTO folder (id, name, vault_id) VALUES (?, ?, ?)', [newFolderId, name, vaultId]);
        res.status(201).json({ id: newFolderId, name });
    } catch (error) {
        console.error('Create Folder Error:', error);
        res.status(500).json({ message: 'Failed to create folder.' });
    }
});

app.delete('/api/folders/:folderId', authenticateToken, async (req, res) => {
    try {
        const { folderId } = req.params;
        await dbPool.execute('DELETE FROM folder WHERE id = ?', [folderId]);
        res.status(204).send();
    } catch (error) {
        console.error('Delete Folder Error:', error);
        res.status(500).json({ message: 'Failed to delete folder.' });
    }
});

// --- MEMO ROUTES ---
app.get('/api/memos', authenticateToken, async (req, res) => {
    try {
        const { username } = req.user;
        const searchTerm = req.query.search || '';

        let sql = `SELECT m.id, m.judul, m.date, m.icon_name 
                   FROM memo m
                   JOIN folder f ON m.folder_id = f.id
                   JOIN vault v ON f.vault_id = v.id
                   WHERE v.bunker_username = ?`;
        const params = [username];

        if (searchTerm) {
            sql += ` AND m.judul LIKE ?`;
            params.push(`%${searchTerm}%`);
        }

        sql += ` ORDER BY m.date DESC`;
        const [memos] = await dbPool.execute(sql, params);
        res.json(memos);
    } catch (error) {
        console.error('Get All Memos Error:', error);
        res.status(500).json({ message: 'Failed to fetch all memos.' });
    }
});

// Get memos for a specific folder, with optional search
app.get('/api/memos/:folderId', authenticateToken, async (req, res) => {
    try {
        const { folderId } = req.params;
        const searchTerm = req.query.search || '';

        let sql = `SELECT id, judul, date, icon_name FROM memo WHERE folder_id = ?`;
        const params = [folderId];

        if (searchTerm) {
            sql += ` AND judul LIKE ?`;
            params.push(`%${searchTerm}%`);
        }

        sql += ` ORDER BY date DESC`;
        const [memos] = await dbPool.execute(sql, params);
        res.json(memos);
    } catch (error) {
        console.error('Get Memos Error:', error);
        res.status(500).json({ message: 'Failed to fetch memos.' });
    }
});

app.post('/api/memos', authenticateToken, async (req, res) => {
    try {
        const { judul, deskripsi, link, folder_id, icon_name } = req.body;
        const newMemoId = uuidv4();
        await dbPool.execute('INSERT INTO memo (id, judul, deskripsi, link, folder_id, icon_name) VALUES (?, ?, ?, ?, ?, ?)', [newMemoId, judul, deskripsi, link, folder_id, icon_name]);
        res.status(201).json({ message: 'Memo created successfully', id: newMemoId });
    } catch (error) {
        console.error('Create Memo Error:', error);
        res.status(500).json({ message: 'Failed to create memo.' });
    }
});

app.put('/api/memos/:memoId', authenticateToken, async (req, res) => {
    try {
        const { memoId } = req.params;
        const { judul, deskripsi, link, folder_id, icon_name } = req.body;
        await dbPool.execute('UPDATE memo SET judul = ?, deskripsi = ?, link = ?, folder_id = ?, icon_name = ? WHERE id = ?', [judul, deskripsi, link, folder_id, icon_name, memoId]);
        res.status(200).json({ message: 'Memo updated successfully' });
    } catch (error) {
        console.error('Update Memo Error:', error);
        res.status(500).json({ message: 'Failed to update memo.' });
    }
});

app.delete('/api/memos/:memoId', authenticateToken, async (req, res) => {
    try {
        const { memoId } = req.params;
        await dbPool.execute('DELETE FROM memo WHERE id = ?', [memoId]);
        res.status(204).send();
    } catch (error) {
        console.error('Delete Memo Error:', error);
        res.status(500).json({ message: 'Failed to delete memo.' });
    }
});

// --- Start Server ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});
