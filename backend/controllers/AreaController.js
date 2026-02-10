const AreaModel = require('../models/Areas');

const AreaController = {
  async getById(req, res) {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const area = await AreaModel.findById(id);

    if (!area) {
      return res.status(404).json({ error: 'Area no encontrado' });
    }

    res.json(area);
  },

  async getAll(req, res) {
    const areas = await AreaModel.findAll();
    res.json(areas);
  },

  async insertArea(req, res) {
    const { name, description, image_url } = req.body;
    const newArea = {
        name, 
        description, 
        image_url
    };

    const area = await AreaModel.create(newArea);

    if (!area) {
      return res.status(404).json({ error: 'No se pudo ingresar los datos' });
    }

    res.json(area);
  },

  async updateArea(req, res) {
    const { id } = req.params;
    const { name, description, image_url } = req.body;
    const newData = {
        name, 
        description, 
        image_url
    };

    const area = await AreaModel.update(id, newData);

    if (!area) {
      return res.status(404).json({ error: 'No se pudo ingresar los datos' });
    }

    res.json(area);
  },

  async deleteArea(req, res) {
    const { id } = req.params;

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const area = await AreaModel.delete(id);

    if (!area) {
      return res.status(404).json({ error: 'Area no encontrado' });
    }

    res.json(area);
  },

  async searchArea(req, res) {
    const { keyword = '', from = 0, to = 9 } = req.query;

    const limit = Number(to) - Number(from) + 1;
    const offset = Number(from);

    const areas = await AreaModel.search({keyword, limit, offset});

    res.json(areas);
  }
};

module.exports = AreaController;