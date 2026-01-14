export default function errorHandler(err, req, res, next) {
  console.error(err);

  if (err?.name === "SequelizeValidationError") {
    return res.status(422).json({
      message: "Erreur validation",
      details: err.errors?.map(e => ({ field: e.path, message: e.message })),
    });
  }

  if (err?.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({
      message: "Doublon détecté",
      details: err.errors?.map(e => ({ field: e.path, message: e.message })),
    });
  }

  if (
    err?.name === "SequelizeConnectionError" ||
    err?.name === "SequelizeConnectionRefusedError" ||
    err?.name === "SequelizeHostNotFoundError" ||
    err?.name === "SequelizeHostNotReachableError"
  ) {
    return res.status(503).json({ message: "BDD indisponible" });
  }

  return res.status(500).json({ message: "Erreur serveur" });
}