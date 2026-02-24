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

  async createSubmission(req, res) {
    try {
      const submission = await ReportesModel.create(req.body);
      res.status(201).json(submission);
    } catch (error) {
      res.status(500).json({ error: 'Error al crear reporte' });
    }
  },

  async updateSubmission(req, res) {
    try {
      const { id } = req.params;
      const updated = await ReportesModel.update(id, req.body);

      if (!updated) {
        return res.status(404).json({ error: 'Reporte no encontrado' });
      }

      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar reporte' });
    }
  },

  async deleteSubmission(req, res) {
    try {
      const { id } = req.params;
      await ReportesModel.delete(id);
      res.json({ message: 'Reporte eliminado correctamente' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar reporte' });
    }
  },

  async getByStatus(req, res) {
    try {
      const { status } = req.params;
      const data = await ReportesModel.findByStatus(status);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener reportes por estado' });
    }
  },

  async countByStatus(req, res) {
    try {
      const data = await ReportesModel.countByStatus();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al contar reportes por estado' });
    }
  },

  async getRecent(req, res) {
    try {
      const days = Number(req.query.days) || 7;
      const data = await ReportesModel.findRecent(days);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener reportes recientes' });
    }
  },

  async getAIGenerated(req, res) {
    try {
      const data = await ReportesModel.findAIGenerated();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener reportes generados por IA' });
    }
  },

  async markAsReviewed(req, res) {
    try {
      const { submissionId, reviewedBy } = req.body;

      await ReportesModel.markAsReviewed(submissionId, reviewedBy);

      res.json({ message: 'Reporte marcado como revisado' });
    } catch (error) {
      res.status(500).json({ error: 'Error al marcar como revisado' });
    }
  },

  async getUnreviewed(req, res) {
    try {
      const data = await ReportesModel.findUnreviewed();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener reportes no revisados' });
    }
  },

  async countUnreviewedByArea(req, res) {
    try {
      const { areaId } = req.params;
      const count = await ReportesModel.countUnreviewedByArea(areaId);
      res.json(count);
    } catch (error) {
      res.status(500).json({ error: 'Error al contar no revisados por área' });
    }
  },

  async getDocenteReports(req, res) {
    try {
      const from = Number(req.query.from) || 0;
      const to = Number(req.query.to) || 9;

      const data = await ReportesModel.findDocentes(from, to);
      const count = await ReportesModel.countAll();

      res.json({ data, count });
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener reportes de docentes' });
    }
  },

  async getReportsWithPriority(req, res) {
    try {
      const from = Number(req.query.from) || 0;
      const to = Number(req.query.to) || 9;

      const data = await ReportesModel.findWithPriority(from, to);
      const count = await ReportesModel.countAll();

      res.json({ data, count });
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener reportes con prioridad' });
    }
  },

  async createDocenteSubmission(req, res) {
    try {
      const submission = await ReportesModel.createDocente(req.body);
      res.status(201).json(submission);
    } catch (error) {
      res.status(500).json({ error: 'Error al crear reporte de docente' });
    }
  }

}

module.exports = ReportesController;