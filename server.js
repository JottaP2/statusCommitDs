const fastify = require('fastify')({ logger: true, ignoreTrailingSlash: true });
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK;

if (!DISCORD_WEBHOOK_URL) {
    fastify.log.warn('Variavel DISCORD_WEBHOOK nao definida; envios para o Discord serao ignorados.');
}

fastify.post('/github-event', async (request, reply) => {
    const payload = request.body;
    const branchRef = payload.ref;
    const branchName = branchRef?.replace('refs/heads/', '');
    const branchPermitida = branchName === 'main' || branchName === 'dev';

    if (branchPermitida && payload.head_commit) {
        const repoName = payload.repository.name;
        const commit = payload.head_commit;
        const autor = commit.author.name;
        const mensagemCommit = commit.message;

        const dataObj = new Date(commit.timestamp);
        const dataFormatada = dataObj.toLocaleDateString('pt-BR');
        const horaFormatada = dataObj.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'America/Maceio'
        });

        const discordPayload = {
            embeds: [{
                title: `🚀 Novo Push no Repositório: ${repoName}`,
                color: 0x5865F2,
                fields: [
                    { name: 'Branch', value: `\`${branchName}\``, inline: true },
                    { name: 'Quem commitou', value: `**${autor}**`, inline: true },
                    { name: 'Mensagem', value: `\`\`\`${mensagemCommit}\`\`\`` },
                    { name: 'Data', value: `${dataFormatada} às ${horaFormatada}`, inline: false }
                ],
                footer: { text: 'Status Commit DS - Desenvolvido por Jottax' },
                timestamp: new Date()
            }]
        };

        try {
            if (!DISCORD_WEBHOOK_URL) {
                fastify.log.error('DISCORD_WEBHOOK nao configurada. Nao foi possivel enviar notificacao.');
                return reply.status(500).send({ received: false, error: 'discord webhook not configured' });
            }

            const response = await fetch(DISCORD_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(discordPayload)
            });

            if (!response.ok) {
                const responseText = await response.text();
                fastify.log.error({
                    statusCode: response.status,
                    statusText: response.statusText,
                    responseBody: responseText
                }, 'Erro ao enviar para o Discord');
            }
        } catch (err) {
            fastify.log.error(err);
        }
    }

    return reply.status(200).send({ received: true });
});

const port = process.env.PORT || 3000;

fastify.listen({ port: port, host: '0.0.0.0' }, (err) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    console.log(`Bot escutando na porta ${port}`);
});