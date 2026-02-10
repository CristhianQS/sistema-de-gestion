const SalonesModel = require('../models/Salones');

const SalonesController = {
  async getAllSalones(req, res) {
    const reqdata = await SalonesModel.findAll();

    if (!reqdata) {
      return res.status(404).json({ error: 'No se encontraron salones' });
    }

    res.json(reqdata);
  },

  async getAllSalonesByPabellon(req, res) {
    const { pabellonId } = req.query;

    const reqdata = await SalonesModel.findAllEx(pabellonId);

    if (!reqdata) {
      return res.status(404).json({ error: 'No se encontraron salones del pabellón' });
    }

    res.json(reqdata);
  },

  async getSalonById(req, res) {
    const { id } = req.params;

    const reqdata = await SalonesModel.find(id);

    if (!reqdata) {
      return res.status(404).json({ error: 'No se encontró el salón' });
    }

    res.json(reqdata);
  },

  async insertSalon(req, res) {
    const { nombre, capacidad, pabellon_id } = req.body;

    const newQuery = {
      nombre, 
      capacidad,
      pabellon_id
    }

    const reqdata = await SalonesModel.create(newQuery);

    if (!reqdata) {
      return res.status(404).json({ error: 'No se pudo registrar el salón' });
    }

    res.json(reqdata);
  },

  async editSalon(req, res) {
    const { id } = req.params;
    const { nombre, capacidad, pabellon_id } = req.body;

    const newQuery = {
      nombre, 
      capacidad,
      pabellon_id
    }

    const reqdata = await SalonesModel.update(id, newQuery);

    if (!reqdata) {
      return res.status(404).json({ error: 'No se pudo actualizar el salón' });
    }

    res.json(reqdata);
  },

  async deleteSalon(req, res) {
    const { id } = req.params;

    const reqdata = await SalonesModel.delete(id);

    if (!reqdata) {
      return res.status(404).json({ error: 'Pabellón no encontrado' });
    }

    res.json(reqdata);
  },

  async countSalonesByPabellon(req, res) {
    const { id } = req.params;

    const reqdata = await SalonesModel.countSalonesById(id);

    if (!reqdata) {
      return res.status(404).json({ error: 'No se encontró ningún salón' });
    }

    res.json(reqdata);
  },
};

module.exports = SalonesController;