const InvarianError = require('../../exceptions/InvarianError');
const { AlbumPayloadSchema } = require('./schema');

const AlbumsValidator = {
    validateAlbumPayload: (payload) => {
        const validationResult = AlbumPayloadSchema.validate(payload);
        if (validationResult.error) {
            throw new InvarianError(validationResult.error.message);
        }
    },
};

module.exports = AlbumsValidator;
