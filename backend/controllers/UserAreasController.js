const UserAreasModel = require('../models/UserAreas');

const UserAreasController = {

  async deleteUserAreas(req, res) {
    try {
      const { userId } = req.params;

      await UserAreasModel.deleteByUserId(userId);

      res.json({ message: 'Áreas del usuario eliminadas correctamente' });

    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar áreas del usuario' });
    }
  },

  async insertUserAreas(req, res) {
    try {
        const userAreasData = req.body;

        const inserted = await UserAreasModel.insertMany(userAreasData);

        res.status(201).json(inserted);

    } catch (error) {
        res.status(500).json({ error: 'Error al asignar áreas al usuario' });
    }
  }

};

module.exports = UserAreasController;