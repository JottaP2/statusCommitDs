const fastify = require('fastify')({ logger: true });

// O Easypanel vai injetar esse valor através da aba 'Environment'
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK;

fastify.post('/github-event', async (request, reply) => {
    const payload = request.body;

    // 1. Filtro de Segurança e Branch
    // Verifica se é um push e se é na main (o GitHub envia refs/heads/main)
    if (payload.ref === 'refs/heads/main' && payload.head_commit) {

        const repoName = payload.repository.name;
        const commit = payload.head_commit;
        const autor = commit.author.name;
        const mensagemCommit = commit.message;

        // 2. Formatação de Data e Hora (Padrão BR)
        const dataObj = new Date(commit.timestamp);
        const dataFormatada = dataObj.toLocaleDateString('pt-BR');
        const horaFormatada = dataObj.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'America/Maceio' // Ajustado para o seu fuso em Alagoas
        });

        // 3. Montagem do Embed (Visual do Discord)
        const discordPayload = {
            embeds: [{
                title: `🚀 Novo Push no Repositório: ${repoName}`,
                color: 0x5865F2, // Cor Blurple do Discord
                fields: [
                    { name: 'Branch', value: '`main`', inline: true },
                    { name: 'Quem commitou', value: `**${autor}**`, inline: true },
                    { name: 'Mensagem', value: `\`\`\`${mensagemCommit}\`\`\`` },
                    { name: 'Data', value: `${dataFormatada} às ${horaFormatada}`, inline: false }
                ],
                footer: { text: 'GitHub Notifier Bot' },
                timestamp: new Date()
            }]
        };

        // 4. Envio para o Discord usando a API nativa do Node (fetch)
        try {
            const response = await fetch(DISCORD_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(discordPayload)
            });

            if (!response.ok) {
                fastify.log.error('Erro ao enviar para o Discord');
            }
        } catch (err) {
            fastify.log.error(err);
        }
    }

    return reply.status(200).send({ received: true });
});

// O Easypanel gerencia a porta, mas o padrão é 3000
const port = process.env.PORT || 3000;

fastify.listen({ port: port, host: '0.0.0.0' }, (err) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    console.log(`Bot escutando na porta ${port}`);
});