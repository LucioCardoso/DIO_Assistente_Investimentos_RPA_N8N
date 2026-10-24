// Code "Mensagens e melhor investimento para cliente"

// Entrada: 1 item vindo do Merge (clientes do Webhook + investimentos do CSV)
const dados = $input.first().json;

const clientes = dados.body?.clientes ?? dados.clientes;
const investimentos = dados.investimentos;

if (!Array.isArray(clientes) || !Array.isArray(investimentos)) {
  throw new Error("Esperado 'body.clientes' e 'investimentos' no item do Merge. Verifique o Merge e o Code anterior.");
}

// Helpers
const norm = s => String(s ?? "").trim().toLowerCase()
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// "R$ 12.500,00" -> 12500
const parseSaldo = txt =>
  Number(String(txt ?? "").replace(/[^\d,]/g, "").replace(",", ".")) || 0;

// 1000 -> "R$ 1.000,00"
const brl = n =>
  Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    .replace(/\u00a0/g, " ");

const escolheAleatorio = arr => arr[Math.floor(Math.random() * arr.length)];

// Processamento
const resultados = clientes.map(c => {
  const saldo = parseSaldo(c.saldo);
  const opcoes = investimentos.filter(i => norm(i.perfil) === norm(c.perfil));
  const elegiveis = opcoes.filter(i => Number(i.minimo) <= saldo);

  let recomendacao = null;
  let motivo;

  if (elegiveis.length) {
    // maior mínimo que o saldo comporta
    recomendacao = elegiveis.reduce((a, b) => Number(b.minimo) > Number(a.minimo) ? b : a);
    motivo = "saldo_ok";
  } else if (opcoes.length) {
    // nenhuma opção cabe no saldo: sugere a mais acessível
    recomendacao = opcoes.reduce((a, b) => Number(b.minimo) < Number(a.minimo) ? b : a);
    motivo = "saldo_insuficiente";
  } else {
    motivo = "perfil_sem_produto";
  }

  let mensagens = [];
  if (recomendacao) {
    const prod = `**${recomendacao.produto}**`;
    const min = brl(recomendacao.minimo);
    const sal = brl(saldo);
    const rent = recomendacao.rentabilidade;

    if (motivo === "saldo_ok") {
      mensagens = [
        `Olá ${c.nome}! Pelo seu perfil (${c.perfil}), uma boa opção é ${prod} (mínimo ${min}). Com seu saldo atual (${sal}), você já consegue investir. Rentabilidade: ${rent}.`,
        `Oi ${c.nome}! Recomendação para perfil ${c.perfil}: ${prod} (mínimo ${min}). Seu saldo (${sal}) já atende o mínimo. Rentabilidade: ${rent}.`,
        `${c.nome}, indo direto ao ponto: para o perfil ${c.perfil}, ${prod} (mínimo ${min}). Você tem ${sal}, então dá pra aplicar. Rentabilidade: ${rent}.`
      ];
    } else {
      const falta = brl(Number(recomendacao.minimo) - saldo);
      mensagens = [
        `Olá ${c.nome}! Pelo seu perfil (${c.perfil}), a opção mais acessível é ${prod} (mínimo ${min}). Seu saldo (${sal}) ainda não atinge o mínimo: faltam ${falta}. Rentabilidade: ${rent}.`,
        `Oi ${c.nome}! Para perfil ${c.perfil}, a entrada mais baixa é ${prod} (mínimo ${min}). Com ${sal} ainda faltam ${falta}. Rentabilidade: ${rent}.`,
        `${c.nome}, para o perfil ${c.perfil}, ${prod} exige ${min}. Seu saldo é ${sal}, faltam ${falta} para começar. Rentabilidade: ${rent}.`
      ];
    }
  }

  return {
    nome: c.nome,
    email: c.email,
    perfil: c.perfil,
    saldo_texto: c.saldo,
    saldo_num: saldo,
    recomendacao: recomendacao
      ? {
          perfil: recomendacao.perfil,
          produto: recomendacao.produto,
          minimo: Number(recomendacao.minimo),
          rentabilidade: recomendacao.rentabilidade
        }
      : null,
    motivo,
    mensagens,
    mensagem_escolhida: mensagens.length ? escolheAleatorio(mensagens) : ""
  };
});

return [{
  json: {
    ok: true,
    total_clientes: clientes.length,
    total_investimentos: investimentos.length,
    resultados
  }
}];