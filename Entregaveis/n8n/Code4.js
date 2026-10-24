// Code "Extrair JSON e anexar e-mail"

// Pega resposta do Gemini e a formata em json com campos e-mail
const raw = $json.content?.parts?.[0]?.text ?? "";
const limpo = raw.replace(/```json|```/g, "").trim();

let email;
try {
  email = JSON.parse(limpo);
} catch (e) {
  throw new Error("Resposta do Gemini não é JSON válido: " + limpo.slice(0, 200));
}

const origem = $('Loop por cliente').item.json;

return {
  json: {
    email_to: origem.email_to,
    nome: origem.nome,
    subject: email.subject,
    text_body: email.text_body,
    html_body: email.html_body
  }
};