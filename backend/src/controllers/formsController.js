import Form from '../models/Form.js';

export const createForm = async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { name, baseId, tableId, fields, logic } = req.body || {};

    const form = await Form.create({ user: userId, name, baseId, tableId, fields, logic });
    return res.status(201).json({ id: form._id, form });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to create form' });
  }
};

export const listForms = async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const forms = await Form.find({ user: userId }).sort({ updatedAt: -1 });
    return res.json(forms);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to list forms' });
  }
};

export const getForm = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) return res.status(404).json({ error: 'Form not found' });
    return res.json(form);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to fetch form' });
  }
};
