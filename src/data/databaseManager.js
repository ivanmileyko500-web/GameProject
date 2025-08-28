const sqlite3 = require('sqlite3');
const path = require('path');

class DatabaseManager {
    constructor() {
        if (DatabaseManager.instance) {
            return DatabaseManager.instance;
        }
        const dbPath = path.resolve(__dirname, 'gameData.db');
        this.connection = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('Ошибка подключения к базе данных:', err.message);
            } else {
                console.log('Подключено к базе данных SQLite.');
            }
        });
        DatabaseManager.instance = this;
    }

    // Получить все данные из таблицы
    getData(tableName) {
        return new Promise((resolve, reject) => {
            this.connection.all(`SELECT * FROM ${tableName}`, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Добавить новую запись
    insertData(tableName, data) {
        const columns = Object.keys(data).join(', ');
        const placeholders = Object.keys(data).map(() => '?').join(', ');
        const values = Object.values(data);

        return new Promise((resolve, reject) => {
            this.connection.run(
                `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`, values,
                function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ id: this.lastID });
                    }
                }
            );
        });
    }

    // Обновить существующую запись по ID
    updateData(tableName, id, data) {
        const updates = Object.keys(data).map((key) => `${key} = ?`).join(', ');
        const values = [...Object.values(data), id];

        return new Promise((resolve, reject) => {
            this.connection.run(
                `UPDATE ${tableName} SET ${updates} WHERE id = ?`, values,
                function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ changes: this.changes });
                    }
                }
            );
        });
    }

    // Удалить запись по ID
    deleteData(tableName, id) {
        return new Promise((resolve, reject) => {
            this.connection.run(
                `DELETE FROM ${tableName} WHERE id = ?`, [id],
                function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ deleted: this.changes > 0 });
                    }
                }
            );
        });
    }
}

module.exports = new DatabaseManager();