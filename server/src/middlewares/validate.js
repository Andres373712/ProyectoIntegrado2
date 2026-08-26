export const validate = (schema) => (req, res, next) => {
  const resultado = schema.safeParse(req.body);
  if (!resultado.success) {
    return res.status(400).json({ message: resultado.error.issues[0].message });
  }
  req.body = resultado.data;
  next();
};
