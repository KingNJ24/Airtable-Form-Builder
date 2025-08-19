import axios from 'axios';
import User from '../models/User.js';
import crypto from 'crypto';

// Minimal base64url helpers for signing state
const b64url = (buf) => Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/,'');
const enc = (obj) => b64url(Buffer.from(JSON.stringify(obj)));

function signState(secret, extra = {}) {
  const header = { alg: 'HS256', typ: 'STATE' };
  const payload = { nonce: Math.random().toString(36).slice(2), iat: Date.now(), exp: Date.now() + 10 * 60 * 1000, ...extra };
  const data = `${enc(header)}.${enc(payload)}`;
  const sig = b64url(crypto.createHmac('sha256', secret).update(data).digest());
  return `${data}.${sig}`;
}

function verifyState(token, secret) {
  const parts = (token || '').split('.');
  if (parts.length !== 3) return null;
  const [h, p, s] = parts;
  const data = `${h}.${p}`;
  const sig = b64url(crypto.createHmac('sha256', secret).update(data).digest());
  if (sig !== s) return null;
  try {
    const payload = JSON.parse(Buffer.from(p.replace(/-/g,'+').replace(/_/g,'/'), 'base64').toString('utf8'));
    if (!payload || typeof payload.exp !== 'number' || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

function generateVerifier(length = 64) {
  // Airtable restriction: allowed chars are A-Z / a-z / 0-9 / '-' / '.' / '_'
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._';
  let out = '';
  for (let i = 0; i < length; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
  return out;
}

function pkceChallenge(verifier) {
  return b64url(crypto.createHash('sha256').update(verifier).digest());
}

export const login = (req, res) => {
  const secret = process.env.SESSION_SECRET || 'dev_secret_change_me';
  const verifier = generateVerifier();
  const qsScopes = req.query?.scopes;
  let scopes;
  if (qsScopes === 'min') scopes = 'data.records:write';
  else if (qsScopes === 'read') scopes = 'data.records:write data.records:read';
  else if (qsScopes === 'list') scopes = 'schema.bases:read schema.tables:read schema.fields:read data.records:write';
  else scopes = process.env.AIRTABLE_SCOPES || 'data.records:write';

  const state = signState(secret, { v: verifier, sc: scopes });
  const code_challenge = pkceChallenge(verifier);
  const redirectUri = process.env.AIRTABLE_REDIRECT_URI || `${req.protocol}://${req.get('host')}/auth/callback`;
  const params = new URLSearchParams({
    client_id: process.env.AIRTABLE_CLIENT_ID || '',
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes,
    state,
    code_challenge,
    code_challenge_method: 'S256',
  });
  return res.redirect(`https://airtable.com/oauth2/v1/authorize?${params.toString()}`);
};

export const callback = async (req, res) => {
  try {
    const { code, state, error, error_description } = req.query;
    if (error) {
      const secret0 = process.env.SESSION_SECRET || 'dev_secret_change_me';
      const parsed0 = verifyState(state, secret0);
      const prevScopes = parsed0?.sc;
      if (error === 'invalid_scope' && prevScopes !== 'data.records:write') {
        return res.redirect('/auth/login?scopes=min');
      }
      return res.status(400).json({ error, error_description });
    }
    const secret = process.env.SESSION_SECRET || 'dev_secret_change_me';
    const parsed = verifyState(state, secret);
    if (!code || !parsed) {
      return res.status(400).json({ error: 'Invalid OAuth state' });
    }

    const clientId = process.env.AIRTABLE_CLIENT_ID || '';
    const clientSecret = process.env.AIRTABLE_CLIENT_SECRET || '';

    const redirectUri = process.env.AIRTABLE_REDIRECT_URI || `${req.protocol}://${req.get('host')}/auth/callback`;

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier: parsed.v,
    });

    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

    if (clientSecret) {
      // Use Authorization header when client_secret exists (per Airtable spec)
      const creds = `${clientId}:${clientSecret}`;
      headers.Authorization = `Basic ${Buffer.from(creds, 'utf8').toString('base64')}`;
    } else {
      // No client_secret -> include client_id in the body (Authorization is forbidden)
      body.append('client_id', clientId);
    }

    const tokenRes = await axios.post('https://airtable.com/oauth2/v1/token', body, { headers });

    const { access_token, refresh_token, expires_in } = tokenRes.data;

    const whoAmI = await axios.get('https://api.airtable.com/v0/meta/whoami', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const profile = whoAmI.data || {};
    const airtableUserId = profile.user?.id || profile.id || profile.userId || 'unknown';

    const tokenExpiresAt = expires_in ? new Date(Date.now() + expires_in * 1000) : null;

    const user = await User.findOneAndUpdate(
      { airtableUserId },
      {
        email: profile.user?.email || profile.email,
        name: profile.user?.name || profile.name,
        accessToken: access_token,
        refreshToken: refresh_token,
        tokenExpiresAt,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    req.session.userId = user._id.toString();

    // Redirect back to frontend dashboard after successful auth
    return res.redirect('http://localhost:3000/dashboard');
  } catch (err) {
    console.error(err?.response?.data || err.message);
    return res.status(500).json({ error: 'OAuth callback failed' });
  }
};
