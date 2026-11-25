/* ==========================================
   CONECTA ESCOLA - AUTENTICAÇÃO
   ========================================== */

const CHAVE_USUARIOS = "conectaEscola_usuarios";
const CHAVE_SESSAO = "conectaEscola_usuarioLogado";

const tabLogin = document.getElementById("tabLogin");
const tabRegistro = document.getElementById("tabRegistro");
const formLogin = document.getElementById("formLogin");
const formRegistro = document.getElementById("formRegistro");
const authMensagem = document.getElementById("authMensagem");

// Se já estiver logado, vai direto para a página principal
if (localStorage.getItem(CHAVE_SESSAO)) {
    window.location.href = "./index.html";
}

function mostrarAviso(texto, erro = false) {
    authMensagem.textContent = texto;
    authMensagem.style.color = erro ? "#b42318" : "#247445";
}

// Alternar entre abas
tabLogin.addEventListener("click", () => {
    tabLogin.classList.add("ativo");
    tabRegistro.classList.remove("ativo");
    formLogin.classList.remove("oculto");
    formRegistro.classList.add("oculto");
    authMensagem.textContent = "";
});

tabRegistro.addEventListener("click", () => {
    tabRegistro.classList.add("ativo");
    tabLogin.classList.remove("ativo");
    formRegistro.classList.remove("oculto");
    formLogin.classList.add("oculto");
    authMensagem.textContent = "";
});

// Registrar novo usuário
formRegistro.addEventListener("submit", (e) => {
    e.preventDefault();

    const nome = document.getElementById("regNome").value.trim();
    const email = document.getElementById("regEmail").value.trim().toLowerCase();
    const senha = document.getElementById("regSenha").value;

    const usuarios = JSON.parse(localStorage.getItem(CHAVE_USUARIOS) || "[]");

    if (usuarios.some(u => u.email === email)) {
        mostrarAviso("Este e-mail já está cadastrado.", true);
        return;
    }

    const novoUsuario = {
        id: Date.now().toString(),
        nome,
        email,
        senha
    };

    usuarios.push(novoUsuario);
    localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(usuarios));
    localStorage.setItem(CHAVE_SESSAO, JSON.stringify({ id: novoUsuario.id, nome: novoUsuario.nome, email: novoUsuario.email }));

    mostrarAviso("Conta criada com sucesso! Redirecionando...");
    setTimeout(() => {
        window.location.href = "./index.html";
    }, 800);
});

// Fazer login
formLogin.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const senha = document.getElementById("loginSenha").value;

    const usuarios = JSON.parse(localStorage.getItem(CHAVE_USUARIOS) || "[]");
    const usuario = usuarios.find(u => u.email === email && u.senha === senha);

    if (!usuario) {
        mostrarAviso("E-mail ou senha incorretos.", true);
        return;
    }

    localStorage.setItem(CHAVE_SESSAO, JSON.stringify({ id: usuario.id, nome: usuario.nome, email: usuario.email }));
    window.location.href = "./index.html";
});
