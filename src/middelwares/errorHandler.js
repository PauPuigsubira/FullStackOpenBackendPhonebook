const errorHandler = (err, req, res, next) => {
  console.error('Error name', err.name);
  console.error('Error kind', err.kind);
  console.error('Error message', err.message);

  if (
    err.name.match(/CastError|BSONError/) &&
    err.kind === "ObjectId"
  ) {
    return res.status(400).send({ error: "malformatted id" });
  } else if (err.name === "ValidationError") {
    return res.status(400).json({ error: err.message });
  }

  next(err);
}

module.exports = errorHandler;