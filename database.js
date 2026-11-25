
const AtividadesDB = (() => {
    const CHAVE = "atividadesEscolares";

    function lerDados() {
        try {
            const dados = localStorage.getItem(CHAVE);

            if (!dados) {
                return [];
            }

            const atividades = JSON.parse(dados);

            return Array.isArray(atividades) ? atividades : [];
        } catch (erro) {
            console.error("Erro ao ler atividades:", erro);
            throw new Error("Não foi possível ler as atividades salvas.");
        }
    }

    function salvarDados(atividades) {
        try {
            localStorage.setItem(CHAVE, JSON.stringify(atividades));
        } catch (erro) {
            console.error("Erro ao salvar atividades:", erro);
            throw new Error("Não foi possível salvar os dados no navegador.");
        }
    }

    return {
        async iniciar() {
            // Verifica se o armazenamento local está disponível.
            const teste = "__conecta_escola_teste__";

            localStorage.setItem(teste, "ok");
            localStorage.removeItem(teste);

            return true;
        },

        async salvar(atividade) {
            const atividades = lerDados();

            atividades.push(atividade);
            salvarDados(atividades);

            return atividade;
        },

        async listar() {
            return lerDados();
        },

        async buscarPorId(id) {
            return lerDados().find(item => item.id === id) || null;
        },

        async atualizar(id, alteracoes) {
            const atividades = lerDados();

            const indice = atividades.findIndex(
                item => item.id === id
            );

            if (indice === -1) {
                throw new Error("Atividade não encontrada.");
            }

            atividades[indice] = {
                ...atividades[indice],
                ...alteracoes
            };

            salvarDados(atividades);

            return atividades[indice];
        },

        async excluir(id) {
            const atividades = lerDados();

            const atualizadas = atividades.filter(
                item => item.id !== id
            );

            salvarDados(atualizadas);

            return true;
        },

        async pesquisar(termo) {
            const atividades = lerDados();
            const busca = String(termo).toLowerCase();

            return atividades.filter(item =>
                (item.nome || "").toLowerCase().includes(busca) ||
                (item.materia || "").toLowerCase().includes(busca) ||
                (item.descricao || "").toLowerCase().includes(busca)
            );
        },

        async exportar() {
            return JSON.stringify(lerDados(), null, 2);
        },

        async importar(dados) {
            const atividades = typeof dados === "string"
                ? JSON.parse(dados)
                : dados;

            if (!Array.isArray(atividades)) {
                throw new Error("Formato de dados inválido.");
            }

            salvarDados(atividades);

            return true;
        }
    };
})();

window.AtividadesDB = AtividadesDB;
