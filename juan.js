
/* ==========================================
   CONECTA ESCOLA - SISTEMA PRINCIPAL
   Armazenamento: localStorage
   ========================================== */

const formulario = document.getElementById("formAtividade");
const lista = document.getElementById("listaAtividades");
const mensagem = document.getElementById("mensagem");

const campoTipo = document.getElementById("tipo");
const campoData = document.getElementById("data");
const labelData = document.getElementById("labelData");

const totalPendentes = document.getElementById("totalPendentes");
const totalConcluidas = document.getElementById("totalConcluidas");
const totalAtividades = document.getElementById("totalAtividades");

const botoesFiltro = document.querySelectorAll(".filtro");

let atividades = [];
let filtroAtual = "todas";

/* ==========================================
   MENSAGENS
   ========================================== */

function mostrarMensagem(texto, erro = false) {
    mensagem.textContent = texto;
    mensagem.style.color = erro ? "#b42318" : "#247445";
}

/* ==========================================
   MUDAR O TEXTO DA DATA
   ========================================== */

campoTipo.addEventListener("change", () => {
    labelData.textContent = campoTipo.value === "Prova"
        ? "Data da prova:"
        : "Data de entrega:";
});

/* ==========================================
   IDENTIFICAR O STATUS
   ========================================== */

function obterStatus(item) {
    if (item.concluida) {
        return "Concluída";
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const dataAtividade = new Date(item.data + "T00:00:00");

    if (dataAtividade < hoje) {
        return "Atrasada";
    }

    return "Pendente";
}

/* ==========================================
   CARREGAR ATIVIDADES
   ========================================== */

async function carregarAtividades() {
    try {
        atividades = await AtividadesDB.listar();

        atividades.sort((a, b) => {
            return (a.data || "").localeCompare(b.data || "");
        });

        atualizarTela();
    } catch (erro) {
        console.error("Erro ao carregar atividades:", erro);
        mostrarMensagem("Erro ao carregar as atividades salvas.", true);
    }
}

/* ==========================================
   CADASTRAR ATIVIDADE
   ========================================== */

formulario.addEventListener("submit", async (event) => {
    // Impede o navegador de recarregar a página.
    event.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const materia = document.getElementById("materia").value;
    const tipo = campoTipo.value;
    const data = campoData.value;
    const descricao = document.getElementById("descricao").value.trim();

    if (!nome || !materia || !tipo || !data) {
        mostrarMensagem("Preencha todos os campos obrigatórios.", true);
        return;
    }

    const agora = new Date().toISOString();

    const id = window.crypto && window.crypto.randomUUID
        ? window.crypto.randomUUID()
        : Date.now().toString() + Math.random().toString(16).slice(2);

    const novaAtividade = {
        id: id,
        nome: nome,
        materia: materia,
        tipo: tipo,
        data: data,
        descricao: descricao,
        concluida: false,
        criadaEm: agora,
        atualizadaEm: agora
    };

    try {
        await AtividadesDB.salvar(novaAtividade);

        await carregarAtividades();

        formulario.reset();
        labelData.textContent = "Data de entrega:";

        mostrarMensagem("Atividade cadastrada com sucesso!");

        document.getElementById("atividades").scrollIntoView({
            behavior: "smooth"
        });

    } catch (erro) {
        console.error("Erro ao cadastrar atividade:", erro);
        mostrarMensagem(
            erro.message || "Não foi possível cadastrar a atividade.",
            true
        );
    }
});

/* ==========================================
   MOSTRAR ATIVIDADES
   ========================================== */

function mostrarAtividades() {
    lista.innerHTML = "";

    let filtradas = atividades;

    if (filtroAtual === "pendente") {
        filtradas = atividades.filter(item => !item.concluida);
    }

    if (filtroAtual === "concluida") {
        filtradas = atividades.filter(item => item.concluida);
    }

    if (filtradas.length === 0) {
        const aviso = document.createElement("p");

        aviso.className = "vazio";
        aviso.textContent = "Nenhuma atividade encontrada.";

        lista.appendChild(aviso);
        return;
    }

    filtradas.forEach(item => {
        const card = document.createElement("article");
        card.className = "atividade";

        const statusAtual = obterStatus(item);

        if (item.concluida) {
            card.classList.add("concluida");
        } else if (statusAtual === "Atrasada") {
            card.classList.add("atrasada");
        }

        // Nome da atividade
        const titulo = document.createElement("h3");
        titulo.textContent = item.nome;

        // Matéria
        const materia = document.createElement("p");
        materia.textContent = "📚 Matéria: " + item.materia;

        // Tipo
        const tipo = document.createElement("p");
        tipo.textContent = "📝 Tipo: " + item.tipo;

        // Data
        const data = document.createElement("p");
        const partes = item.data.split("-");

        const dataFormatada = partes.length === 3
            ? partes[2] + "/" + partes[1] + "/" + partes[0]
            : item.data;

        if (item.tipo === "Prova") {
            data.textContent = "📅 Data da prova: " + dataFormatada;
        } else {
            data.textContent = "📅 Data de entrega: " + dataFormatada;
        }

        card.append(titulo, materia, tipo, data);

        // Descrição
        if (item.descricao) {
            const descricao = document.createElement("p");
            descricao.textContent = "📄 Descrição: " + item.descricao;
            card.appendChild(descricao);
        }

        // Status
        const status = document.createElement("p");
        status.className = "status";

        if (item.concluida) {
            status.classList.add("concluida");
        } else if (statusAtual === "Atrasada") {
            status.classList.add("atrasada");
        }

        status.textContent = "Status: " + statusAtual;
        card.appendChild(status);

        // Área dos botões
        const acoes = document.createElement("div");
        acoes.className = "acoes";

        // Concluir ou reabrir
        const concluir = document.createElement("button");
        concluir.type = "button";
        concluir.className = "btn-concluir";

        concluir.textContent = item.concluida
            ? "Reabrir atividade"
            : "Marcar como feita";

        concluir.addEventListener("click", async () => {
            try {
                await AtividadesDB.atualizar(item.id, {
                    concluida: !item.concluida,
                    atualizadaEm: new Date().toISOString()
                });

                await carregarAtividades();

                mostrarMensagem(
                    item.concluida
                        ? "Atividade reaberta."
                        : "Atividade concluída!"
                );
            } catch (erro) {
                console.error("Erro ao atualizar atividade:", erro);
                mostrarMensagem("Erro ao atualizar atividade.", true);
            }
        });

        // Excluir
        const excluir = document.createElement("button");
        excluir.type = "button";
        excluir.className = "btn-excluir";
        excluir.textContent = "Excluir";

        excluir.addEventListener("click", async () => {
            const confirmou = confirm(
                "Deseja realmente excluir esta atividade?"
            );

            if (!confirmou) {
                return;
            }

            try {
                await AtividadesDB.excluir(item.id);

                await carregarAtividades();

                mostrarMensagem("Atividade excluída com sucesso.");
            } catch (erro) {
                console.error("Erro ao excluir atividade:", erro);
                mostrarMensagem("Erro ao excluir atividade.", true);
            }
        });

        acoes.append(concluir, excluir);
        card.appendChild(acoes);

        lista.appendChild(card);
    });
}

/* ==========================================
   ATUALIZAR CONTADORES
   ========================================== */

function atualizarResumo() {
    const pendentes = atividades.filter(
        item => !item.concluida
    ).length;

    const concluidas = atividades.filter(
        item => item.concluida
    ).length;

    totalPendentes.textContent = pendentes;
    totalConcluidas.textContent = concluidas;
    totalAtividades.textContent = atividades.length;
}

/* ==========================================
   ATUALIZAR INTERFACE
   ========================================== */

function atualizarTela() {
    mostrarAtividades();
    atualizarResumo();
}

/* ==========================================
   FILTROS
   ========================================== */

botoesFiltro.forEach(botao => {
    botao.addEventListener("click", () => {
        filtroAtual = botao.dataset.filtro;

        botoesFiltro.forEach(item => {
            item.classList.remove("ativo");
        });

        botao.classList.add("ativo");

        mostrarAtividades();
    });
});

/* ==========================================
   INICIALIZAR SISTEMA
   ========================================== */

async function iniciarSistema() {
    try {
        await AtividadesDB.iniciar();
        await carregarAtividades();

        console.log("Conecta Escola iniciado com localStorage.");
    } catch (erro) {
        console.error("Falha ao iniciar o sistema:", erro);

        mostrarMensagem(
            "Não foi possível acessar o armazenamento do navegador.",
            true
        );
    }
}

iniciarSistema();
