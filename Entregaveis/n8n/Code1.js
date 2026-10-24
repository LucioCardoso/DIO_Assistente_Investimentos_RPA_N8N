// Code "Formata opções de investimento e perfil"

// Pega o .csv como texto vindo do HTTP Request
const csvRaw = $json.data ?? $json.body ?? $json;
const text = (typeof csvRaw === "string") ? csvRaw : JSON.stringify(csvRaw);

const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
const headers = lines[0].split(",").map(h => h.trim());

const investimentos = lines.slice(1).map(line => {
  const cols = line.split(",").map(c => c.trim());
  const obj = {};
  headers.forEach((h, i) => obj[h] = cols[i] ?? "");

  // normaliza mínimo para número
  obj.minimo = Number(String(obj.minimo).replace(/[^\d]/g, "")) || 0;

  return obj;
});

return [{ json: { investimentos } }];