const getEl = id => document.getElementById(id);
const getVal = id => (getEl(id)?.value || "").trim();
const BRL = n => Number(n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function getUsuarioLogado() {
  const u = localStorage.getItem("usuarioLogado");
  try { return u ? JSON.parse(u) : null; } catch { return null; }
}
function getCarrinhoKey() {
  const user = getUsuarioLogado();
  const email = user?.email || "anonimo";
  return `carrinho:${email}`;
}
function getCarrinho() {
  const key = getCarrinhoKey();
  try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }
}
function setCarrinho(carrinho) {
  localStorage.setItem(getCarrinhoKey(), JSON.stringify(carrinho || []));
}

function Cadastrar(event) {
  event.preventDefault();

  const nome      = getVal("nome");
  const email     = getVal("email");
  const senha     = getEl("senha") ? getVal("senha") : "";
  const endereco  = getVal("endereco");
  const cidade    = getVal("cidade");
  const estado    = getVal("estado");
  const cep       = getEl("cep")    ? getVal("cep")    : "";   
  const numero    = getEl("numero") ? getVal("numero") : "";   
  const sobrenome = getEl("sobrenome") ? getVal("sobrenome") : ""; 


  const obrigatorios = [
    ["nome", nome], ["email", email],
    ...(getEl("senha") ? [["senha", senha]] : []),
    ["endereco", endereco], ["cidade", cidade], ["estado", estado],
    ...(getEl("cep") ? [["cep", cep]] : []),
    ...(getEl("numero") ? [["numero", numero]] : []),
  ];
  const faltando = obrigatorios.find(([_, v]) => !v);
  if (faltando) {
    alert("Por favor, preencha todos os campos obrigatórios!");
    return;
  }


  const reEmail = /\S+@\S+\.\S+/;
  if (!reEmail.test(email)) {
    alert("Digite um e-mail válido.");
    return;
  }


  if (getEl("senha") && senha.length < 6) {
    alert("A senha deve ter no mínimo 6 caracteres.");
    return;
  }


  if (getEl("cep") && !/^\d{5}-?\d{3}$/.test(cep)) {
    alert("Digite um CEP válido (00000-000).");
    return;
  }


  if (getEl("numero") && !/^\d+$/.test(numero)) {
    alert("O número deve conter apenas dígitos.");
    return;
  }

  // Salva usuários
  const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
  if (usuarios.find(u => u.email === email)) {
    alert("Este e-mail já está cadastrado!");
    return;
  }

  const novoUsuario = {
    nome, sobrenome, email, senha, endereco, numero, cidade, estado, cep,
    createdAt: new Date().toISOString()
  };

  usuarios.push(novoUsuario);
  localStorage.setItem("usuarios", JSON.stringify(usuarios));

  alert("Cadastro realizado com sucesso!");
  window.location.href = "login.html";
}


function Login(event) {
  event.preventDefault();

  const email = getVal("loginEmail");
  const senha = getVal("loginSenha");
  const lembrar = getEl("lembrar")?.checked || false;

  const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
  const usuarioValido = usuarios.find(u => u.email === email && u.senha === senha);

  if (!usuarioValido) {
    alert("E-mail ou senha incorretos!");
    return;
  }

  localStorage.setItem("usuarioLogado", JSON.stringify(usuarioValido));
  if (lembrar) localStorage.setItem("ultimoEmail", email);
  else localStorage.removeItem("ultimoEmail");

  alert("Login realizado com sucesso!");
  window.location.href = "catalogo.html";
}

function Logout() {
  localStorage.removeItem("usuarioLogado");
  window.location.href = "login.html";
}


document.addEventListener("DOMContentLoaded", () => {
  const emailInput = getEl("loginEmail");
  if (emailInput) {
    const last = localStorage.getItem("ultimoEmail");
    if (last) emailInput.value = last;
  }


  const cepInput = getEl("cep");
  if (cepInput) {
    cepInput.addEventListener("input", () => {
      let v = cepInput.value.replace(/\D/g, "").slice(0, 8);
      if (v.length > 5) v = v.slice(0,5) + "-" + v.slice(5);
      cepInput.value = v;
    });
  }


  if (getEl("carrinhoItens") || getEl("listaCarrinho")) {
    VerCarrinho();
  };

const radios = document.querySelectorAll('input[name="pagamento"]');
  const dadosCartao = getEl("dados-cartao");

  if (radios && dadosCartao) {
    radios.forEach(radio => {
      radio.addEventListener("change", () => {
        if (radio.value === "cartao" && radio.checked) {
          dadosCartao.style.display = "block";
        } else {
          dadosCartao.style.display = "none";
        }
      });
    });
  }
});


function AdicionarCarrinho(nome, preco) {
  if (!nome) return;

  const valor = Number(preco);
  if (Number.isNaN(valor)) {
    alert("Preço inválido do produto.");
    return;
  }

  const carrinho = getCarrinho();
  const existente = carrinho.find(p => p.nome === nome);

  if (existente) existente.quantidade += 1;
  else carrinho.push({ nome, preco: valor, quantidade: 1 });

  setCarrinho(carrinho);
  alert(`${nome} adicionado ao carrinho!`);
  VerCarrinho();
}

function AtualizarQuantidade(index, delta) {
  const carrinho = getCarrinho();
  if (!carrinho[index]) return;

  carrinho[index].quantidade += delta;
  if (carrinho[index].quantidade <= 0) carrinho.splice(index, 1);

  setCarrinho(carrinho);
  VerCarrinho();
}

function RemoverItem(index) {
  const carrinho = getCarrinho();
  carrinho.splice(index, 1);
  setCarrinho(carrinho);
  VerCarrinho();
}

function LimparCarrinho() {
  setCarrinho([]);
  VerCarrinho();
}

function VerCarrinho() {
  const carrinho = getCarrinho();

  const ul = getEl("listaCarrinho");
  const totalH = getEl("total");
  const div = getEl("carrinhoItens");

  let total = 0;

  if (ul) {
    ul.innerHTML = "";
    if (carrinho.length === 0) {
      ul.innerHTML = "<p>Seu carrinho está vazio.</p>";
      if (totalH) totalH.textContent = "Total: R$0,00";
      return;
    }

    carrinho.forEach((item, i) => {
      total += item.preco * item.quantidade;
      const li = document.createElement("li");
      li.innerHTML = `
        ${item.nome} — ${BRL(item.preco)} x ${item.quantidade}
        <button onclick="AtualizarQuantidade(${i}, -1)">-</button>
        <button onclick="AtualizarQuantidade(${i}, +1)">+</button>
        <button onclick="RemoverItem(${i})">Remover</button>
      `;
      ul.appendChild(li);
    });

    if (totalH) totalH.textContent = `Total: ${BRL(total)}`;
    return;
  }

  if (div) {
    div.innerHTML = "";
    if (carrinho.length === 0) {
      div.innerHTML = "<p>Seu carrinho está vazio.</p>";
      return;
    }

    carrinho.forEach((item, i) => {
      total += item.preco * item.quantidade;
      const itemDiv = document.createElement("div");
      itemDiv.className = "item-carrinho";
      itemDiv.innerHTML = `
        <p>${item.nome} — ${BRL(item.preco)} x ${item.quantidade}</p>
        <div style="display:flex; gap:.5rem; margin:.25rem 0;">
          <button onclick="AtualizarQuantidade(${i}, -1)">-</button>
          <button onclick="AtualizarQuantidade(${i}, +1)">+</button>
          <button onclick="RemoverItem(${i})">Remover</button>
        </div>
      `;
      div.appendChild(itemDiv);
    });

    const totalDiv = document.createElement("div");
    totalDiv.className = "total-carrinho";
    totalDiv.innerHTML = `<h3>Total: ${BRL(total)}</h3>
      <button onclick="LimparCarrinho()">Esvaziar carrinho</button>`;
    div.appendChild(totalDiv);
  }
}

function processarPagamento(event) {
  event.preventDefault();

  const forma = document.querySelector('input[name="pagamento"]:checked')?.value;
  if (!forma) {
    alert("Selecione uma forma de pagamento.");
    return;
  }

  if (forma === 'cartao') {
    const numero = getVal("numero-cartao").replace(/\s/g, '');
    const validade = getVal("validade-cartao");
    const cvv = getVal("cvv-cartao");
    const nome = getVal("nome-titular");

    if (!/^\d{16}$/.test(numero)) {
      alert("Número do cartão inválido. Use 16 dígitos.");
      return;
    }

    if (!/^\d{2}\/\d{2}$/.test(validade)) {
      alert("Data de validade inválida. Use MM/AA.");
      return;
    }

    if (!/^\d{3}$/.test(cvv)) {
      alert("CVV inválido. Use 3 dígitos.");
      return;
    }

    if (nome.length < 3) {
      alert("Digite o nome do titular corretamente.");
      return;
    }
  }

  localStorage.setItem("formaPagamento", forma);

  alert(`Você escolheu ${forma.toUpperCase()}. Redirecionando...`);
  window.location.href = "sucesso-pagamento.html";
}

window.processarPagamento = processarPagamento;
window.Cadastrar = Cadastrar;
window.Login = Login;
window.Logout = Logout;
window.AdicionarCarrinho = AdicionarCarrinho;
window.VerCarrinho = VerCarrinho;
window.RemoverItem = RemoverItem;
window.AtualizarQuantidade = AtualizarQuantidade;
window.LimparCarrinho = LimparCarrinho;
