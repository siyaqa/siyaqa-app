// Notifications admin via ntfy.
// Le nom du topic vit dans NTFY_TOPIC (secret, non deviné) — jamais codé en dur,
// sinon le canal ntfy public exposerait les coordonnées des clients à tout le monde.
// Optionnel : NTFY_TOKEN pour un topic à accès restreint.

type NotifyOpts = {
  title: string;
  body: string;
  priority?: string;
  tags?: string;
};

export async function notifyAdmin({ title, body, priority = "default", tags }: NotifyOpts) {
  const topic = process.env.NTFY_TOPIC;
  if (!topic) return; // pas de topic configuré → on n'envoie rien (aucune fuite)

  try {
    const headers: Record<string, string> = { Title: title, Priority: priority };
    if (tags) headers.Tags = tags;
    if (process.env.NTFY_TOKEN) headers.Authorization = `Bearer ${process.env.NTFY_TOKEN}`;

    await fetch(`https://ntfy.sh/${topic}`, { method: "POST", headers, body });
  } catch {
    // Ne jamais bloquer le flux principal si la notification échoue.
  }
}
