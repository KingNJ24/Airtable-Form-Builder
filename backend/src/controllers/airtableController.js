import axios from 'axios';
import User from '../models/User.js';

function requireUser(req, res) {
  const userId = req.session?.userId;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  return userId;
}

async function getOwner(userId) {
  const owner = await User.findById(userId);
  return owner;
}

export const listBases = async (req, res) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;
    const owner = await getOwner(userId);
    if (!owner?.accessToken) return res.status(401).json({ error: 'Missing token' });
    const r = await axios.get('https://api.airtable.com/v0/meta/bases', {
      headers: { Authorization: `Bearer ${owner.accessToken}` }
    });
    return res.json(r.data);
  } catch (e) {
    const details = e?.response?.data || e.message;
    console.error(details);
    return res.status(500).json({ error: 'Failed to list bases', details });
  }
};

export const listTables = async (req, res) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;
    const { baseId } = req.query;
    if (!baseId) return res.status(400).json({ error: 'baseId is required' });
    const owner = await getOwner(userId);
    if (!owner?.accessToken) return res.status(401).json({ error: 'Missing token' });
    const url = `https://api.airtable.com/v0/meta/bases/${encodeURIComponent(baseId)}/tables`;
    const r = await axios.get(url, { headers: { Authorization: `Bearer ${owner.accessToken}` } });
    return res.json(r.data);
  } catch (e) {
    const details = e?.response?.data || e.message;
    console.error(details);
    return res.status(500).json({ error: 'Failed to list tables', details });
  }
};

export const listFields = async (req, res) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;
    const { baseId, tableId } = req.query;
    if (!baseId || !tableId) return res.status(400).json({ error: 'baseId and tableId are required' });
    const owner = await getOwner(userId);
    if (!owner?.accessToken) return res.status(401).json({ error: 'Missing token' });
    const url = `https://api.airtable.com/v0/meta/bases/${encodeURIComponent(baseId)}/tables`;
    const r = await axios.get(url, { headers: { Authorization: `Bearer ${owner.accessToken}` } });
    const tables = r.data?.tables || [];
    const table = tables.find((t) => t.id === tableId || t.name === tableId);
    if (!table) return res.status(404).json({ error: 'Table not found' });
    return res.json({ fields: table.fields || [] });
  } catch (e) {
    const details = e?.response?.data || e.message;
    console.error(details);
    return res.status(500).json({ error: 'Failed to list fields', details });
  }
};
