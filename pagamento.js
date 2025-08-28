function processarPagamento(event) {
    event.preventDefault();

    const forma = document.querySelector('input[name="pagamento"]:checked').value;

    if  (forma === "cartao"){
        alert ("Você escolheu pagar com Cartão de Crédito");
    } else if (forma === "pix"){
        alert ("Você escolheu pagar com Pix");
    }

    window.location.href = "confirmacao.html";
}