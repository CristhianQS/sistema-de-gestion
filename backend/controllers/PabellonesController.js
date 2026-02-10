const PabellonesModel = require('../models/Pabellones');

const PabellonesController = {
  async getAllPabellones(req, res) {
    const reqdata = await PabellonesModel.findAll();

    if (!reqdata) {
      return res.status(404).json({ error: 'No se encontraron pabellones' });
    }

    res.json(reqdata);
  },

  async getPabellon(req, res) {
    const { id } = req.params;

    const reqdata = await PabellonesModel.findById(id);

    if (!reqdata) {
      return res.status(404).json({ error: 'No se encontró él pabellón' });
    }

    res.json(reqdata);
  },

  async insertPabellon(req, res) {
    const { nombre, descripcion, imagen_url, created_at } = req.body;
    const newQuery = {
      nombre,
      descripcion,
      imagen_url,
      created_at
    };

    const reqdata = await PabellonesModel.create(newQuery);

    if (!reqdata) {
      return res.status(404).json({ error: 'Error al insertar pabellón' });
    }

    res.json(reqdata);
  },

  async editPabellon(req, res) {
    const { id } = req.params;
    const { nombre, descripcion, imagen_url, created_at } = req.body;
    const newQuery = {
      nombre,
      descripcion,
      imagen_url,
      created_at
    };

    const reqdata = await PabellonesModel.update(id, newQuery);

    if (!reqdata) {
      return res.status(404).json({ error: 'Error al actualizar pabellón' });
    }

    res.json(reqdata);
  },

  async deletePabellon(req, res) {
    const { id } = req.params;

    const reqdata = await PabellonModel.delete(id);

    if (!reqdata) {
      return res.status(404).json({ error: 'Pabellón no encontrado' });
    }

    res.json(reqdata);
  },
}

module.exports = PabellonesController;