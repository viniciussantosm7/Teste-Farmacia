function Cadastrar(event) {
    event.preventDefault();

    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const endereco = document.getElementById("endereco").value;
    const cidade = document.getElementById("cidade").value;
    const estado = document.getElementById("estado").value;

    if (!nome || !email || !endereco || !cidade || !estado) {
        alert("Por favor, preencha todos os campos!");
        return;
    }

    localStorage.setItem("nomeCliente", nome);

    alert(`Cadastro realizado com sucesso!\nNome: ${nome}\nE-mail: ${email}`);
    window.location.href = "catalogo.html";
}


function adicionarAoCarrinho(nome, preco) {
    let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

 
    let itemExistente = carrinho.find(item => item.nome === nome);

    if (itemExistente) {
        itemExistente.quantidade += 1;
    } else {
        carrinho.push({ nome, preco, quantidade: 1 });
    }

    localStorage.setItem("carrinho", JSON.stringify(carrinho));
    alert(`${nome} foi adicionado ao carrinho!`);
}


function carregarCarrinho() {
    let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
    let lista = document.getElementById("listaCarrinho");
    let total = 0;

    if (!lista) return; 

    if (carrinho.length === 0) {
        lista.innerHTML = "<p>Seu carrinho está vazio.</p>";
        document.getElementById("total").textContent = "Total: R$0,00";
        return;
    }

    lista.innerHTML = "";

    carrinho.forEach(item => {
        let li = document.createElement("li");
        li.textContent = `${item.nome} - R$ ${item.preco.toFixed(2)} x ${item.quantidade}`;
        lista.appendChild(li);
        total += item.preco * item.quantidade;
    });

    document.getElementById("total").textContent = "Total: R$ " + total.toFixed(2);
}


function limparCarrinho() {
    localStorage.removeItem("carrinho");
    carregarCarrinho();
}

function processarPagamento(event) {
    event.preventDefault();

    const forma = document.querySelector('input[name="pagamento"]:checked');
    if (!forma) {
        alert("Selecione uma forma de pagamento!");
        return;
    }

    if (forma.value === "cartao") {
        alert("Você escolheu pagar com Cartão de Crédito");
    } else if (forma.value === "pix") {
        alert("Você escolheu pagar com Pix");
    }

    localStorage.removeItem("carrinho");

    window.location.href = "confirmacao.html";
}