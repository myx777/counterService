const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', 'data');

// Создаем директорию, если она не существует
async function createDir(dir) {
    try {
        await fs.promises.access(dir, fs.constants.R_OK);
        console.log(`${dir} already exists`);
    } catch (err) {
        if (err.code === 'ENOENT') {
            try {
                await fs.promises.mkdir(dir);
                console.log(`${dir} created`);
            } catch (mkdirErr) {
                console.error('Error creating directory:', mkdirErr);
            }
        } else {
            console.error('Error checking directory:', err);
        }
    }
}

createDir(dataDir);

const counterFile = path.join(__dirname, '..', 'data', 'counterService.json');

// Функция для чтения данных из файла
async function readCounterFile() {
    return new Promise((resolve, reject) => {
        fs.readFile(counterFile, 'utf-8', (err, data) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    resolve({});
                } else {
                    reject(err);
                }
            } else {
                resolve(JSON.parse(data));
            }
        });
    });
}

// Функция для записи данных в файл
async function writeCounterFile(data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(counterFile, JSON.stringify(data, null, 2), (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

// Маршрут для инкремента счётчика
app.post('/counter/:bookId/incr', async (req, res) => {
    const { bookId } = req.params;
    try {
        let counterData = await readCounterFile();
        counterData[bookId] = (counterData[bookId] || 0) + 1;
        await writeCounterFile(counterData);
        res.status(200).json({ message: `Counter for book ${bookId} incremented` });
    } catch (err) {
        console.error('Error updating counterService:', err);
        res.status(500).json({ error: 'Error updating counterService' });
    }
});

// Маршрут для получения значения счётчика
app.get('/counter/:bookId', async (req, res) => {
    const { bookId } = req.params;
    try {
        let counterData = await readCounterFile();
        const count = counterData[bookId] || 0;
        res.status(200).json({ counter: count });
    } catch (err) {
        console.error('Error reading counterService:', err);
        res.status(500).json({ error: 'Error reading counterService' });
    }
});

app.listen(3004, () => {
    console.log('Server is running on port 3004');
});
