const formulario = document.getElementById("registrationForm");
const nome = document.getElementById("username");
const email = document.getElementById("email");
const senha = document.getElementById("password");
const confirmacaoSenha = document.getElementById("confirmPassword");
const erroMensagem = document.getElementById("errorMessage");

formulario.addEventListener("submit", function(evento) {
    evento.preventDefault();

    if (nome.value.trim() === "") {
        erroMensagem.textContent = "Digite um nome de usuário.";
        return;
    }

    if (!email.value.includes("@") || !email.value.includes(".")) {
        erroMensagem.textContent = "Digite um email válido.";
        return;
    }

    if (senha.value.length < 6) {
        erroMensagem.textContent = "A senha deve ter no mínimo 6 caracteres.";
        return;
    }

    if (senha.value !== confirmacaoSenha.value) {
        erroMensagem.textContent = "As senhas não coincidem.";
        return;
    }

    // Pega todos os usuários já cadastrados
    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    // Verifica se o email já está cadastrado
    if (usuarios.some(u => u.email === email.value)) {
        erroMensagem.textContent = "Este email já está cadastrado.";
        return;
    }

    //Adiciona o novo usuário à lista
    usuarios.push({
        nome: nome.value,
        email: email.value,
        senha: senha.value
    });

    // LocalStorage
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    erroMensagem.style.color = "green";
    erroMensagem.textContent = "Cadastro realizado com sucesso!";

    // Redireciona após aparecer a mensagem
    setTimeout(() => {
        alert("Cadastro concluído!");
        window.location.href = "Snacke.html"; 
    }, 800);
});
