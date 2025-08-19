'use server'

export async function getBackendBase() {
  return process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';
}
