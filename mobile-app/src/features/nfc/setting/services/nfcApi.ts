import { API_BASE_URL } from "../../../habits/screens/CreateHabit/services/config";

const BASE = `${API_BASE_URL}/nfc-tags`;
const headers = { "Content-Type": "application/json" };

async function handleRes(res: Response) {
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || `API error ${res.status}`);
  }
  return res.json().catch(() => null);
}

export async function getNfcTagsRemote() {
  const res = await fetch(BASE, {
    method: "GET",
    headers,
  });
  return handleRes(res);
}

export async function createNfcTagRemote(payload: {
  tag_id: string;
  type: string;
  tag_name: string;
  ndef_url: string;
  habit_id?: string | null;
}) {
  const res = await fetch(BASE, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  return handleRes(res);
}

export async function updateNfcTagRemote(
  id: string,
  payload: Partial<{
    tag_id: string;
    type: string;
    tag_name: string;
    ndef_url: string;
    habit_id?: string | null;
  }>,
) {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(payload),
  });
  return handleRes(res);
}

export async function deleteNfcTagRemote(id: string) {
  const res = await fetch(`${BASE}/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || `API error ${res.status}`);
  }
  return true;
}
