// Code "Resultado único para um item por cliente"

// Entrada: 1 item vindo do "Code in JavaScript1" com o array 'resultados'
const resultados = $input.first().json.resultados;

if (!Array.isArray(resultados)) {
  throw new Error("Campo 'resultados' não encontrado ou não é um array. Verifique a saída do Code in JavaScript1.");
}

// "R$ 12.500,00" -> 12500
function parseBRL(valor) {
  if (!valor) return 0;
  const s = String(valor)
    .replace("R$", "")
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.]/g, "")
    .trim();
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

// Retorna UM ITEM por cliente
return resultados.map(c => {
  const saldoNum = c.saldo_num ?? parseBRL(c.saldo_texto ?? c.saldo);

  return {
    json: {
      email_to: String(c.email ?? "").trim(),
      nome: String(c.nome ?? "").trim(),
      perfil: String(c.perfil ?? "").trim(),
      saldo_texto: c.saldo_texto ?? c.saldo ?? "",
      saldo_num: saldoNum,
      recomendacao: c.recomendacao ?? null,
      motivo: c.motivo ?? "",
      mensagem_base: c.mensagem_escolhida ?? c.mensagens?.[0] ?? ""
    }
  };
});