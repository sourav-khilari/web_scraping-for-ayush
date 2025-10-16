export function notFound(_req, res) {
  res.status(404).json({ message: 'Not found' });
}

export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal error',
    ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {})
  });
}
