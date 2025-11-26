const formLogin = document.getElementById("loginForm");
const emailLogin = document.getElementById("emailLogin");
const senhaLogin = document.getElementById("passwordLogin");
const erroLogin = document.getElementById("errorLogin");

formLogin.addEventListener("submit", function(evento) {
    evento.preventDefault();

    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    let usuarioEncontrado = usuarios.find(u =>
        u.email === emailLogin.value && u.senha === senhaLogin.value
    );

    if (usuarioEncontrado) {
        erroLogin.style.display = "block";
        erroLogin.style.color = "green";
        erroLogin.style.backgroundColor = "#d4edda";
        erroLogin.style.border = "1px solid #c3e6cb";

        erroLogin.textContent = "Login realizado com sucesso!";

        setTimeout(() => {
            alert("Bem-vindo ao jogo, " + usuarioEncontrado.nome + "!");
            window.location.href = "Snacke.html";  
        }, 800);

    } else {
        erroLogin.style.display = "block";
        erroLogin.style.color = "#d9534f";
        erroLogin.style.backgroundColor = "#f2dede";
        erroLogin.style.border = "1px solid #ebccd1";

        erroLogin.textContent = "Email ou senha incorretos.";
    }
});
