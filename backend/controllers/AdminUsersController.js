const AdminUsersModel = require('../models/AdminUsers');

const AdminUsersController = {

  async getAdminOroWithAreas(req, res) {
    try {
      const data = await AdminUsersModel.findAdminOroWithAreas();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener administradores con áreas' });
    }
  },

  async updateAdmin(req, res) {
    try {
      const { id } = req.params;

      const updated = await AdminUsersModel.update(id, req.body);

      if (!updated) {
        return res.status(404).json({ error: 'Administrador no encontrado' });
      }

      res.json(updated);

    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar administrador' });
    }
  }

};

module.exports = AdminUsersController;