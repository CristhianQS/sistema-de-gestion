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
  },

  async filterAlumnosByTerm(req, res) {
    const { searchterm, from, to} = req.query;

    const reqdata = await AlumnosModel.findAllMatching(searchterm, from, to);

    if (!reqdata) {
      return res.status(404).json({ error: 'Ningún alumno coincide con el término de búsqueda' });
    }

    res.json(reqdata);
  },

  async countAlumnosByTerm(req, res) {
    const { searchterm } = req.query;

    const reqdata = await AlumnosModel.countAllMatching(searchterm);

    if (!reqdata) {
      return res.status(404).json({ error: 'Ningún alumno coincide con el término de búsqueda' });
    }

    res.json(reqdata);
  },
};

module.exports = AlumnosController;