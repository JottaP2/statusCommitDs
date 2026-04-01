const fastify = require('fastify')({ logger: true });

const DISCORD_WEBHOOK_URL = 'SUA_URL_DO_PASSO_1_AQUI';

fastify.post('/github-event', async (request, reply) => {
  const payload = request.body;

  // 1. Verifica se é um evento de 'push' e na branch 'main'
  if (payload.ref === 'refs/heads/main') {
    const repo = payload.repository.name;
    const commit = payload.head_commit;
    const autor = commit.author.name;
    const mensagemCommit = commit.message;
    
    // 2. Formatar a data para o padrão brasileiro
    const dataObj = new Date(commit.timestamp);
    const dataFormatada = dataObj.toLocaleDateString('pt-BR');
    const horaFormatada = dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    // 3. Montar a mensagem estilo "Embed" para o Discord
    const discordPayload = {
      embeds: [{
        title: `Novo Commit em ${repo}`,
        color: 0x2f3136, // Cor da barra lateral
        fields: [
          { name: 'Branch', value: '`main`', inline: true },
          { name: 'Autor', value: autor, inline: true },
          { name: 'Mensagem', value: mensagemCommit },
          { name: 'Data', value: `${dataFormatada} às ${horaFormatada}` }
        ],
        timestamp: new Date()
      }]
    };

    // 4. Enviar para o Discord
    await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordPayload)
    });
  }

  return { status: 'ok' };
});

fastify.listen({ port: 3000, host: '0.0.0.0' }, (err) => {
  if (err) throw err;
  console.log('Servidor rodando na porta 3000');
});