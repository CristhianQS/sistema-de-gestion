const AlumnosModel = require('../models/Alumnos');

const AlumnosController = {
  async getAlumnosPaginated(req, res) {
    const { start, end } = req.query;

    const reqdata = await AlumnosModel.findAllEx(start, end);

    if (!reqdata) {
      return res.status(404).json({ error: 'No se encontraron alumnos' });
    }

    res.json(reqdata);
  },

  async getAllAlumnos(req, res) {
    const reqdata = await AlumnosModel.findAll();

    if (!reqdata) {
      return res.status(404).json({ error: 'No se encontraron alumnos' });
    }

    res.json(reqdata);
  },
  
  async countAlumnos(req, res) {
    const reqdata = await AlumnosModel.countAll();

    if (!reqdata) {
      return res.status(404).json({ error: 'No se encontraron alumnos en el conteo' });
    }

    res.json(reqdata);
  },
  
  async getAlumnoByParameter(req, res) {
    const { id, codigo } = req.query;
    const newQuery = {
      id, 
      codigo
    }

    const reqdata = await AlumnosModel.findEx(newQuery);

    if (!reqdata) {
      return res.status(404).json({ error: 'No se encontró al alumno' });
    }

    res.json(reqdata);
  }
};

module.exports = AlumnosController;