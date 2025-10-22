const getEl = id => document.getElementById(id);
const getVal = id => (getEl(id)?.value || "").trim();
const BRL = n => Number(n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const TAXA_ENTREGA = 5;
const FRETE_GRATIS_LIMITE = 60;

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

function mostrarModal(mensagem, callback = null) {
    const modal = getEl('modal');
    const mensagemEl = getEl('modal-mensagem');
    const botao = getEl('modal-ok');

    if (!modal || !mensagemEl || !botao) {
        alert(mensagem);
        if (callback) callback();
        return;
    }

    mensagemEl.textContent = mensagem;
    modal.style.display = 'flex';

    botao.onclick = () => {
        modal.style.display = 'none';
        if (callback) callback();
    };
}

function mostrarNotificacaoCarrinho(mensagem) {
    let notif = getEl("notif-carrinho");
    if (!notif) {
        notif = document.createElement("div");
        notif.id = "notif-carrinho";
        notif.style.position = "fixed";
        notif.style.top = "20px";
        notif.style.right = "20px";
        notif.style.background = "#4caf50";
        notif.style.color = "#fff";
        notif.style.padding = "12px 20px";
        notif.style.borderRadius = "6px";
        notif.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
        notif.style.zIndex = "9999";
        document.body.appendChild(notif);
    }

    notif.textContent = mensagem;
    notif.style.display = "block";

    setTimeout(() => { notif.style.display = "none"; }, 3000);
}

function Cadastrar(event) {
    event.preventDefault();

    const nome = getVal("nome");
    const email = getVal("email");
    const senha = getEl("senha") ? getVal("senha") : "";
    const endereco = getVal("endereco");
    const cidade = getVal("cidade");
    const estado = getVal("estado");
    const cep = getEl("cep") ? getVal("cep") : "";
    const numero = getEl("numero") ? getVal("numero") : "";
    const sobrenome = getEl("sobrenome") ? getVal("sobrenome") : "";

    const obrigatorios = [
        ["nome", nome], ["email", email],
        ...(getEl("senha") ? [["senha", senha]] : []),
        ["endereco", endereco], ["cidade", cidade], ["estado", estado],
        ...(getEl("cep") ? [["cep", cep]] : []),
        ...(getEl("numero") ? [["numero", numero]] : []),
    ];

    const faltando = obrigatorios.find(([_, v]) => !v);
    if (faltando) { mostrarModal("Por favor, preencha todos os campos obrigatórios!"); return; }

    const reEmail = /\S+@\S+\.\S+/;
    if (!reEmail.test(email)) { mostrarModal("Digite um e-mail válido."); return; }
    if (getEl("senha") && senha.length < 6) { mostrarModal("A senha deve ter no mínimo 6 caracteres."); return; }
    if (getEl("cep") && !/^\d{5}-?\d{3}$/.test(cep)) { mostrarModal("Digite um CEP válido (00000-000)."); return; }
    if (getEl("numero") && !/^\d+$/.test(numero)) { mostrarModal("O número deve conter apenas dígitos."); return; }

    const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
    if (usuarios.find(u => u.email === email)) { mostrarModal("Este e-mail já está cadastrado!"); return; }

    const novoUsuario = { nome, sobrenome, email, senha, endereco, numero, cidade, estado, cep, createdAt: new Date().toISOString() };
    usuarios.push(novoUsuario);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    mostrarModal("Cadastro realizado com sucesso!", () => { window.location.href = "login.html"; });
}

function Login(event) {
    event.preventDefault();
    const email = getVal("loginEmail");
    const senha = getVal("loginSenha");
    const lembrar = getEl("lembrar")?.checked || false;

    const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
    const usuarioValido = usuarios.find(u => u.email === email && u.senha === senha);
    if (!usuarioValido) { mostrarModal("E-mail ou senha incorretos!"); return; }

    localStorage.setItem("usuarioLogado", JSON.stringify(usuarioValido));
    if (lembrar) localStorage.setItem("ultimoEmail", email); else localStorage.removeItem("ultimoEmail");
    mostrarModal("Login realizado com sucesso!", () => { window.location.href = "catalogo.html"; });
}

function Logout() { localStorage.removeItem("usuarioLogado"); window.location.href = "login.html"; }

function AdicionarCarrinho(nome, preco) {
    if (!nome) return;
    const valor = Number(preco);
    if (Number.isNaN(valor)) { mostrarModal("Preço inválido do produto."); return; }

    const carrinho = getCarrinho();
    const existente = carrinho.find(p => p.nome === nome);
    if (existente) existente.quantidade += 1; else carrinho.push({ nome, preco: valor, quantidade: 1 });
    setCarrinho(carrinho);
    VerCarrinho();
    mostrarNotificacaoCarrinho(`${nome} adicionado ao carrinho!`);
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
    carrinho.splice(index,1);
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
    const div = getEl("carrinhoItens");
    let totalProdutos = 0;

    if (ul) {
        ul.innerHTML = "";
        if (!carrinho.length) { 
            ul.innerHTML = "<p>Seu carrinho está vazio.</p>"; 
        } else {
            carrinho.forEach((item,i)=>{
                totalProdutos += item.preco*item.quantidade;
                const li = document.createElement("li");
                li.innerHTML = `${item.nome} — ${BRL(item.preco)} x ${item.quantidade} 
                    <button onclick="AtualizarQuantidade(${i},-1)">-</button>
                    <button onclick="AtualizarQuantidade(${i},+1)">+</button>
                    <button onclick="RemoverItem(${i})">Remover</button>`;
                ul.appendChild(li);
            });
        }
    }

    let taxaEntrega = totalProdutos >= FRETE_GRATIS_LIMITE ? 0 : TAXA_ENTREGA;
    const totalFinal = totalProdutos + taxaEntrega;

    if (ul) {
        const totalEl = getEl("total");
        if (totalEl) totalEl.textContent = `Total: ${BRL(totalFinal)} (Taxa de entrega: ${BRL(taxaEntrega)})`;
    }

    if (div) {
        div.innerHTML = "";
        if (!carrinho.length) { div.innerHTML = "<p>Seu carrinho está vazio.</p>"; return; }
        carrinho.forEach((item,i)=>{
            const itemDiv = document.createElement("div");
            itemDiv.className = "item-carrinho";
            itemDiv.innerHTML = `<p>${item.nome} — ${BRL(item.preco)} x ${item.quantidade}</p>
                <div style="display:flex;gap:.5rem;margin:.25rem 0;">
                    <button onclick="AtualizarQuantidade(${i},-1)">-</button>
                    <button onclick="AtualizarQuantidade(${i},+1)">+</button>
                    <button onclick="RemoverItem(${i})">Remover</button>
                </div>`;
            div.appendChild(itemDiv);
        });
        const totalDiv = document.createElement("div");
        totalDiv.className = "total-carrinho";
        totalDiv.innerHTML = `<h3>Total: ${BRL(totalFinal)} (Taxa de entrega: ${BRL(taxaEntrega)})</h3>
            <button onclick="LimparCarrinho()">Esvaziar carrinho</button>`;
        div.appendChild(totalDiv);
    }
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

    if (getEl("carrinhoItens") || getEl("listaCarrinho")) VerCarrinho();
});

window.Cadastrar = Cadastrar;
window.Login = Login;
window.Logout = Logout;
window.AdicionarCarrinho = AdicionarCarrinho;
window.VerCarrinho = VerCarrinho;
window.RemoverItem = RemoverItem;
window.AtualizarQuantidade = AtualizarQuantidade;
window.LimparCarrinho = LimparCarrinho;
window.mostrarModal = mostrarModal;
