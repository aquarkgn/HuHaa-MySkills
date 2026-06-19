export async function getJson(url) {
  let res;
  try {
    res = await fetch(url, { headers: { accept: 'application/json' } });
  } catch (e) {
    throw new Error(`GET ${url} failed: ${e.message || e}`);
  }

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`GET ${url} returned non-JSON (${res.status}): ${text.slice(0, 160)}`);
  }

  if (!res.ok) throw new Error(data?.error || `GET ${url} failed: ${res.status} ${res.statusText}`);
  return data;
}

export async function postJson(url, body) {
  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (e) {
    throw new Error(`POST ${url} failed: ${e.message || e}`);
  }

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`POST ${url} returned non-JSON (${res.status}): ${text.slice(0, 160)}`);
  }

  if (!res.ok) throw new Error(data?.error || `POST ${url} failed: ${res.status} ${res.statusText}`);
  return data;
}
