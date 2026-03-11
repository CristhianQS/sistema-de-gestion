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
  },

  async updateAdminPassword(req, res) {
    try {
      const { id } = req.params;
      const { password } = req.body;

      const updated = await AdminUsersModel.updatePassword(id, password);

      if (!updated) {
        return res.status(404).json({ error: 'Administrador no encontrado' });
      }

      res.json(updated);

    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar contraseña' });
    }
  },

  async deleteAdmin(req, res) {
    try {
      const { id } = req.params;

      const deleted = await AdminUsersModel.delete(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Administrador no encontrado' });
      }

      res.json({ message: 'Administrador eliminado correctamente' });

    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar administrador' });
    }
  },

  async getAllWithAreas(req, res) {
    try {
      const { role } = req.query;
      const data = await AdminUsersModel.findAllWithAreas(role);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener usuarios con áreas' });
    }
  },

};

module.exports = AdminUsersController;