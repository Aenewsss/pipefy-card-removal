import axios from 'axios';

const PIPEFY_API_URL = 'https://api.pipefy.com/graphql';
const PIPEFY_ACCESS_TOKEN = process.env.PIPEFY_API_TOKEN;

const NUM_THREADS = 10;

function chunkArray(array, size) {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
}

// Função para excluir um card específico pelo ID e Pipe
async function deleteCard(cardId) {
    console.log(`🗑️ Deletando Card ID: ${cardId}`);

    const query = `
      mutation {
        deleteCard(input: {id: ${cardId}}) {
          success
        }
      }
    `;

    try {
        const response = await axios.post(
            PIPEFY_API_URL,
            { query },
            {
                headers: {
                    Authorization: `${PIPEFY_ACCESS_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (response.data?.data?.deleteCard?.success) {
            console.log(`🗑️ Card ${cardId} deletado com sucesso!`);
        } else {
            console.error(`❌ Falha ao deletar o card ${cardId}`, response.data.errors);
        }
    } catch (error) {
        console.error(`❌ Erro ao deletar o card ${cardId}:`, error.response?.data || error.message);
    }
}

// Função principal para excluir um array de cards em um pipe específico
async function deleteCardsByIds(cardIds) {

    if (!Array.isArray(cardIds) || cardIds.length === 0) {
        console.log('ℹ️ Nenhum ID de card fornecido para exclusão.');
        return;
    }

    console.log(`🛠️ Iniciando exclusão de ${cardIds.length} cards`);

    // Dividir os cards em lotes para os workers
    const cardChunks = chunkArray(cardIds, NUM_THREADS);

    for (const chunk of cardChunks) {
        console.log(`🛠️ Processando lote de ${chunk.length} cards...`);
        await Promise.all(chunk.map(cardId => deleteCard(cardId)));
    }

    console.log('✅ Todos os cards especificados foram processados.');
}

// Executar a exclusão com um array de IDs de exemplo
const cardIdsToDelete = []

deleteCardsByIds(cardIdsToDelete)
    .then(() => console.log('🚀 Exclusão concluída com sucesso!'))
    .catch((err) => console.error('❌ Erro na exclusão de cards:', err));