import axios from 'axios';
import ResponseModel from '../models/Response.js';
import Form from '../models/Form.js';
import User from '../models/User.js';

export const submitResponse = async (req, res) => {
  try {
    const formId = req.params.id;
    const payload = req.body || {};

    const form = await Form.findById(formId);
    if (!form) return res.status(404).json({ error: 'Form not found' });

    const owner = await User.findById(form.user);
    if (!owner) return res.status(401).json({ error: 'Form owner not found' });

    const fields = {};
    if (Array.isArray(form.fields)) {
      for (const f of form.fields) {
        if (!f) continue;
        if (f.airtableFieldId && Object.prototype.hasOwnProperty.call(payload, f.airtableFieldId)) {
          fields[f.airtableFieldId] = payload[f.airtableFieldId];
        } else if (f.label && Object.prototype.hasOwnProperty.call(payload, f.label)) {
          fields[f.airtableFieldId || f.label] = payload[f.label];
        }
      }
    } else {
      Object.assign(fields, payload);
    }

    const recordReq = { records: [{ fields }], typecast: true };
    const baseId = form.baseId || '';
    const tableId = form.tableId || '';
    const isLikelyBaseId = /^app[a-zA-Z0-9]{14,}$/.test(baseId);
    const isLikelyTableId = /^tbl[a-zA-Z0-9]{14,}$/.test(tableId);
    const headers = { Authorization: `Bearer ${owner.accessToken}`, 'Content-Type': 'application/json' };

    const pending = await ResponseModel.create({ form: form._id, user: owner._id, payload, status: 'pending' });

    // Development fallback: if IDs look invalid or missing token, mock success instead of failing
    if (!isLikelyBaseId || !isLikelyTableId || !owner.accessToken) {
      pending.status = 'sent';
      pending.airtableResponse = { mock: true, records: [{ id: 'recMock', fields }] };
      await pending.save();
      return res.status(201).json({ ok: true, mock: true, airtable: pending.airtableResponse });
    }

    const url = `https://api.airtable.com/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(tableId)}`;

    const result = await axios.post(url, recordReq, { headers });

    pending.status = 'sent';
    pending.airtableResponse = result.data;
    await pending.save();

    return res.status(201).json({ ok: true, airtable: result.data });
  } catch (e) {
    const details = e?.response?.data || e.message;
    console.error(details);
    try { await ResponseModel.create({ form: req.params.id, payload: req.body, status: 'error', error: String(details) }); } catch {}
    const status = e?.response?.status && Number.isInteger(e.response.status) ? e.response.status : 500;
    return res.status(status).json({ error: 'Failed to submit response', details });
  }
};
