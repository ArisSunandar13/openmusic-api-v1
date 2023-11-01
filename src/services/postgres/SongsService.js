const { Pool } = require('pg')
const { nanoid } = require('nanoid');
const InvarianError = require('../../exceptions/InvarianError');
const { mapDBToSongModel } = require('../../utils');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumsService {
    constructor() {
        this._pool = new Pool()
    }

    async addSong({
        title,
        year,
        genre,
        performer,
        duration,
        albumId,
    }) {
        const id = nanoid(16);
        const createdAt = new Date().toISOString();
        const updatedAt = createdAt;

        const query = {
            text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
            values: [id, title, year, genre, performer, duration, albumId, createdAt, updatedAt],
        };

        const result = await this._pool.query(query)

        if (!result.rows[0].id) {
            throw new InvarianError('Song gagal ditambahkan')
        }

        return result.rows[0].id
    }

    async getSongs(title = undefined, performer = undefined) {
        if (title !== undefined || performer !== undefined) {
            if (title !== undefined && performer !== undefined) {
                const query = {
                    text: 'SELECT id, title, performer FROM songs WHERE title ILIKE $1 AND performer ILIKE $2',
                    values: [`${title}%`, `${performer}%`],
                }

                const result = await this._pool.query(query)

                return result.rows
            }
            const query = {
                text: 'SELECT id, title, performer FROM songs WHERE title ILIKE $1 OR performer ILIKE $2',
                values: [`${title}%`, `${performer}%`],
            }

            const result = await this._pool.query(query)

            return result.rows
        }

        const result = await this._pool.query('SELECT id, title, performer FROM songs')

        return result.rows
    }

    async getSongById(id) {
        const query = {
            text: 'SELECT id, title, year, performer, genre, duration, album_id FROM songs WHERE id=$1',
            values: [id],
        }

        const result = await this._pool.query(query)

        if (!result.rows.length) {
            throw new NotFoundError('Song tidak ditemukan')
        }

        return result.rows.map(mapDBToSongModel)[0]
    }

    async putSongById(id, {
        title,
        year,
        genre,
        performer,
        duration,
        albumId,
    }) {
        const updatedAt = new Date().toISOString()
        const query = {
            text: 'UPDATE songs SET title=$1, year=$2, genre=$3, performer=$4, duration=$5, album_id=$6, updated_at=$7 WHERE id=$8 RETURNING id',
            values: [title, year, genre, performer, duration, albumId, updatedAt, id],
        }

        const result = await this._pool.query(query)

        if (!result.rows.length) {
            throw new NotFoundError('Gagal memperbaharui Song. Id tidak ditemukan')
        }
    }

    async deleteSongById(id) {
        const query = {
            text: 'DELETE FROM songs WHERE id=$1 RETURNING id',
            values: [id],
        }

        const result = await this._pool.query(query)

        if (!result.rows.length) {
            throw new NotFoundError('Song gagal dihapus. Id tidak ditemukan')
        }
    }
}

module.exports = AlbumsService
