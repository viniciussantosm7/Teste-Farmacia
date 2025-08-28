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

    window.location.href = "sucesso.html";
}
