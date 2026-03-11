const NotificacionesModel = require('../models/Notificaciones');

const NotificacionesController = {
  async getByEmail(req, res) {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'User email is required' });
    }

    const reqdata = await NotificacionesModel.findByEmail(email);
    res.json(reqdata);
  },

  async getUnread(req, res) {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'User email is required' });
    }

    const reqdata = await NotificacionesModel.findUnread(email);
    res.json(reqdata);
  },

  async getUnreadCount(req, res) {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'User email is required' });
    }

    const reqdata = await NotificacionesModel.countUnread(email);
    res.json(reqdata);
  },

  async markNotiAsRead(req, res) {
    const { id } = req.params;

    const reqdata = await NotificacionesModel.markAsRead(id);

    if (!reqdata) {
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }

    res.json(reqdata);
  },

  async markAllNotisAsRead(req, res) {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'User email is required' });
    }

    const reqdata = await NotificacionesModel.markAllAsRead(email);
    res.json(reqdata);
  },

  async deleteNoti(req, res) {
    const { id } = req.params;

    const reqdata = await NotificacionesModel.delete(id);

    if (!reqdata) {
      return res.status(404).json({ error: 'Error al eliminar notificación' });
    }

    res.json(reqdata);
  },

  async insertNoti(req, res) {
    const {
      user_email,
      user_name,
      title,
      message,
      type,
      related_submission_id,
      related_area_id
    } = req.body;

    const newQuery = {
      user_email,
      user_name,
      title,
      message,
      type,
      related_submission_id,
      related_area_id
    };

    const reqdata = await NotificacionesModel.create(newQuery);

    if (!reqdata) {
      return res.status(404).json({ error: 'Error al ingresar notificación' });
    }

    res.json(reqdata);
  },
};

module.exports = NotificacionesController;