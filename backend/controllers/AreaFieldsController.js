const AreaFieldsModel = require('../models/AreaFieldsModel');

const AreaFieldsController = {

  async getAreaFields(req, res) {
    const { areaId } = req.params;

    const fields = await AreaFieldsModel.getAreaFields(areaId);

    if (!fields) {
      return res.status(404).json({ error: 'No se encontraron campos' });
    }

    res.json(fields);
  },

  async createAreaField(req, res) {
    const fieldData = req.body;

    const newField = await AreaFieldsModel.createAreaField(fieldData);

    if (!newField) {
      return res.status(400).json({ error: 'No se pudo crear el campo' });
    }

    res.json(newField);
  },

  async updateAreaField(req, res) {
    const { id } = req.params;
    const fieldData = req.body;

    const updatedField = await AreaFieldsModel.updateAreaField(id, fieldData);

    if (!updatedField) {
      return res.status(404).json({ error: 'Campo no encontrado' });
    }

    res.json(updatedField);
  },

  async deleteAreaField(req, res) {
    const { id } = req.params;

    const deleted = await AreaFieldsModel.deleteAreaField(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Campo no encontrado' });
    }

    res.json({ message: 'Campo eliminado correctamente' });
  },

  async getSelectionOptions(req, res) {
    const { areaId } = req.params;

    const options = await AreaFieldsModel.getSelectionOptions(areaId);

    if (!options) {
      return res.status(404).json({ error: 'No se encontraron opciones' });
    }

    res.json(options);
  },

  async createSelectionOption(req, res) {
    const optionData = req.body;

    const newOption = await AreaFieldsModel.createSelectionOption(optionData);

    if (!newOption) {
      return res.status(400).json({ error: 'No se pudo crear la opción' });
    }

    res.json(newOption);
  },

  async deleteSelectionOption(req, res) {
    const { id } = req.params;

    const deleted = await AreaFieldsModel.deleteSelectionOption(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Opción no encontrada' });
    }

    res.json({ message: 'Opción eliminada correctamente' });
  }

};

module.exports = AreaFieldsController;