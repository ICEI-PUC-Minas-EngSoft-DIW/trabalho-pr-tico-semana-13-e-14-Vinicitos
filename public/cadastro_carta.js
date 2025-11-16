document.addEventListener('DOMContentLoaded', () => {
    const formCadastro = document.getElementById('form-cadastro');
    const mensagemStatus = document.getElementById('mensagem-status');
    const API_URL = 'http://localhost:3000/cards';

    formCadastro.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        // Coleta os dados do formulário
        const formData = new FormData(formCadastro);
        const novaCarta = {};
        formData.forEach((value, key) => {
            // Simplesmente mapeia os campos do formulário para o objeto da carta
            // Em um projeto real, seria necessário um tratamento mais robusto
            novaCarta[key] = value;
        });

        // Adiciona campos essenciais que o JSON Server pode precisar ou que são úteis
        // O JSON Server adiciona o 'id' automaticamente, mas podemos adicionar outros
        // campos para simular uma carta completa, se necessário.
        novaCarta.id = crypto.randomUUID(); // Gera um ID único temporário, o JSON Server pode sobrescrever
        novaCarta.cmc = 0.0; // Valor padrão
        novaCarta.colors = []; // Valor padrão
        novaCarta.types = [novaCarta.type.split('—')[0].trim()]; // Exemplo de parsing simples
        novaCarta.subtypes = [novaCarta.type.split('—')[1]?.trim() || '']; // Exemplo de parsing simples
        novaCarta.set = "CUST"; // Set customizado
        novaCarta.setName = "Custom Set";
        novaCarta.artist = "Usuário";
        novaCarta.layout = "normal";

        try {
            const resposta = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(novaCarta),
            });

            if (!resposta.ok) {
                throw new Error(`Erro ao cadastrar: ${resposta.statusText}`);
            }

            const cartaCadastrada = await resposta.json();
            
            mensagemStatus.innerHTML = `
                <div class="alert alert-success" role="alert">
                    Carta "${cartaCadastrada.name}" cadastrada com sucesso! ID: ${cartaCadastrada.id}
                </div>
            `;
            formCadastro.reset(); // Limpa o formulário
            
            // Opcional: Redirecionar para a página de detalhes ou lista
            // setTimeout(() => {
            //     window.location.href = \`detalhes.html?id=\${cartaCadastrada.id}\`;
            // }, 3000);

        } catch (erro) {
            console.error('Erro no cadastro:', erro);
            mensagemStatus.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    Erro ao cadastrar a carta: ${erro.message}
                </div>
            `;
        }
    });
});
