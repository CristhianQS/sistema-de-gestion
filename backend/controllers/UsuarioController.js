const UsuarioModel = require('../models/Usuario');

const UsuarioController = {
  async loginUser(req, res) {
    const { email, password} = req.body;

    const userdata = await UsuarioModel.findByCredentials(email, password);

    if (!userdata) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({data: userdata, success: true});
  },

  async findUser(req, res) {
    const email = "tester@testings.com";
    const password = "123456";

    const userdata = await UsuarioModel.findByCredentials(email, password);

    if (!userdata) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(userdata);
  },

  async getAllUsers(req, res) {
    const userdata = await UsuarioModel.findAll();

    if (!userdata) {
      return res.status(404).json({ error: 'No hay usuarios registrados' });
    }

    res.json(userdata);
  },

  async getUser(req, res) {
    const { id = 0, email = "", role = '', area_id = -1 } = req.query;
    const newQuery = {
        id, 
        email, 
        role, 
        area_id
    };

    const userdata = await UsuarioModel.find(newQuery);

    if (!userdata) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(userdata);
  },

  async verifyUser(req, res) {
    const { email, password} = req.body;

    const userdata = await UsuarioModel.findByCredentials(email, password);

    if (!userdata) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(userdata);
  },

  async createUser(req, res) {
    const data = req.body;
    
    if (!data.name || !data.email || !data.password) {
      return res.status(400).json({ error: 'Faltan campos por completar' });
    }

    const userdata = await AdminUserModel.create(data);

    if (!userdata) {
      return res.status(404).json({ error: 'No se pudo crear al usuario' });
    }

    res.json(userdata);
  },

  async updateUser(req, res) {
    const { id } = req.params;
    const data = req.body;

    const userdata = await AdminUserModel.update(id, data);

    if (!userdata) {
      return res.status(404).json({ error: 'No se pudo actualizar al usuario' });
    }

    res.json(userdata);
  },

  async deleteUser(req, res) {
    const { id } = req.params;

    const userdata = await AdminUserModel.delete(id);
  }
};

module.exports = UsuarioController;