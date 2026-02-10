const DocentesModel = require('../models/Docentes');

const DocentesController = {
async getAllDocentesMatching(req, res) {
    const { search = ``, page = 1, pagesize = 50 } = req.query;
    const newQuery = {
        search, 
        page, 
        pagesize
    };
    console.log("Data is: " + search, page, pagesize)
    const reqdata = await DocentesModel.findAllMatching(newQuery.search, newQuery.page, newQuery.pagesize);

    if (!reqdata) {
      return res.status(404).json({ error: 'No hay docentes registrados' });
    }

    res.json(reqdata);
  },

  async getAllDocentes(req, res) {
    const reqdata = await DocentesModel.findAll();

    if (!reqdata) {
      return res.status(404).json({ error: 'No hay docentes registrados' });
    }

    res.json(reqdata);
  },

  async getDocente(req, res) {
    const { id, dni, estado } = req.query;
    const reqdata = await DocentesModel.find({dni, id, estado});

    if (!reqdata) {
      return res.status(404).json({ error: 'No se encontró al docente' });
    }

    res.json(reqdata);
  },

  async getEstados(req, res) {
    const reqdata = await DocentesModel.findAllEx();

    if (!reqdata) {
      return res.status(404).json({ error: 'No se pudo encontrar estadísticas' });
    }

    res.json(reqdata);
  }
};

module.exports = DocentesController;