# Status Commit DS

Bot simples para receber eventos de push do GitHub e enviar notificações formatadas no Discord via webhook.

## Visao geral

Este projeto expoe um endpoint HTTP com Fastify e processa eventos do tipo push.
Quando a branch do push for `main` ou `dev` ou qualquer outra branch definida, o servidor monta um embed e envia para um canal do Discord para facilitar no gerenciamente de commit em branchs.

## Funcionalidades

- Recebe eventos do GitHub em `POST /github-event`
- Aceita rota com ou sem barra final
- Filtra notificacoes para as branches `main` e `dev`
- Envia embed no Discord com:
  - nome do repositorio
  - branch
  - autor do commit
  - mensagem do commit
  - data e hora no fuso `America/Maceio`
- Loga erros de integracao para facilitar o diagnostico

## Tecnologias

- Node.js
- Fastify
- GitHub Webhooks
- Discord Incoming Webhook

## Estrutura

- `server.js`: servidor HTTP e logica de notificacao
- `package.json`: dependencias e metadados do projeto

## Requisitos

- Node.js 18+
- URL de webhook do Discord

## Instalacao

```bash
npm install
```

## Variaveis de ambiente

Defina as variaveis no ambiente (local, VPS, container, Easypanel etc):

```env
DISCORD_WEBHOOK=https://discord.com/api/webhooks/SEU_WEBHOOK
PORT=3000
```

- `DISCORD_WEBHOOK`: obrigatoria para enviar notificacoes
- `PORT`: opcional, padrao `3000`

## Como executar

```bash
node server.js
```

Servidor sobe em `0.0.0.0` na porta definida por `PORT`.

## Configuracao do webhook no GitHub

No seu repositorio GitHub:

1. Acesse **Settings > Webhooks > Add webhook**
2. Em **Payload URL**, informe:
   - `https://seu-dominio/github-event`
3. Em **Content type**, selecione:
   - `application/json`
4. Em **Which events would you like to trigger this webhook?**, selecione:
   - **Just the push event**
5. Deixe **Active** habilitado e salve

## Fluxo de funcionamento

1. GitHub envia o evento de push para `/github-event`
2. O servidor valida se a branch e permitida (`main` ou `dev`)
3. O payload do Discord e montado com os dados do commit
4. O bot envia o embed usando `DISCORD_WEBHOOK`

## Troubleshooting

### Erro 404 no GitHub Webhook

- Confirme se o endpoint configurado termina com `/github-event`
- Verifique se o dominio esta publico e com HTTPS valido
- Confirme se o servico esta em execucao

### Nao envia mensagem para o Discord

- Verifique se a variavel `DISCORD_WEBHOOK` foi definida
- Confira se a URL do webhook esta correta e ativa
- Inspecione os logs do servidor para ver status e resposta da API do Discord

### Push nao dispara notificacao

- Este projeto notifica apenas branches `main` e `dev`
- Push em outras branches e ignorado por design

## Melhorias recomendadas

- Validar assinatura do GitHub com `X-Hub-Signature-256`
- Adicionar endpoint de healthcheck
- Criar testes automatizados para o handler de webhook

## Licenca

ISC
