const ReportesModel = require('../models/Reportes');

const ReportesController = {
  async getSubmissionsCount(req, res) {
    const reqdata = await ReportesModel.countAll();

    if (reqdata === 0) {
      return res.status(404).json({ error: 'No se pudieron contar los reportes' });
    }

    res.json(reqdata);
  },

  async getSubmissionsPaginated(req, res) {
    const { from, to } = req.query;

    const reqdata = await ReportesModel.findAllEx(from, to);

    if (!reqdata) {
      return res.status(404).json({ error: 'No se encontraron registros' });
    }

    res.json(reqdata);
  },

  async getAllSubmissions(req, res) {
    const reqdata = await ReportesModel.findAll();

    if (!reqdata) {
        return res.status(404).json({ error: 'No se encontraron reportes' });
    }

    res.json(reqdata);
  },
  
  async getSubmissionById(req, res) {
    const { id } = req.params;

    const reqdata = await ReportesModel.find(id);

    if (!reqdata) {
        return res.status(404).json({ error: 'Error al obtener reporte' });
    }

    res.json(reqdata);
  },

  async getSubmissionsCountByArea(req, res) {
    const { areaId } = req.params;

    const reqdata = await ReportesModel.countOne(areaId);

    if (!reqdata) {
      return res.status(404).json({ error: 'No se encontraron reportes para este área' });
    }

    res.json(reqdata);
  },

  async getSubmissionsByArea(req, res) {
    const { areaId, from, to } = req.query;

    const reqdata = await ReportesModel.findEx(areaId, from, to);

    if (!reqdata) {
      return res.status(404).json({ error: 'No se encontraron reportes para este área' });
    }

    res.json(reqdata);
  },

  async getSubmissionsCountByStudent(req, res) {
    const { codigoAlumno } = req.params;

    const reqdata = await ReportesModel.countEx2(codigoAlumno);

    if (!reqdata) {
      return res.status(404).json({ error: 'No se encontraron reportes del estudiante' });
    }

    res.json(reqdata);
  },

  async getSubmissionsByStudent(req, res) {
    const { codigoAlumno, from, to } = req.query;

    const reqdata = await ReportesModel.findEx2(codigoAlumno, from, to);

    if (!reqdata) {
      return res.status(404).json({ error: 'No se encontraron reportes del estudiante' });
    }

    res.json(reqdata);
  },

}

module.exports = ReportesController;