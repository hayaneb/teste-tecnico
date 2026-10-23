# Desafio Técnico — Central de Webhooks

Bem-vindo(a)! Este desafio faz parte do processo seletivo da Parcelex.

**Você tem 1h30 a partir do momento em que recebeu o convite deste repositório.**


## Regras

- **JavaScript**. TypeScript não é necessário, utilize apenas se preferir.
- **Framework livre.** Use o que te deixa mais rápido.
- **Persistência em memória é aceitável.** Não gaste tempo com banco, migrations ou docker-compose.
- **IA com moderação**. Recomendamos utilizar apenas como consulta. Tenha domínio sobre a solução e esteja pronto para explicar qualquer linha do que entregar.


## Contexto

A Parcelex processa o tempo todo eventos de negócio: um pedido é criado, um pagamento é aprovado, uma parcela é estornada.

Vários sistemas parceiros — ERPs de lojistas, antifraude, BI interno — precisam ser avisados quando esses eventos acontecem. Cada parceiro cadastra **qual evento** quer receber e **em qual URL**. Por exemplo: o parceiro A quer receber `pagamento.aprovado` e `pagamento.parcela.estornada` no endereço X. Já o parceiro B quer receber apenas `pedido.criado` no endereço Y.

Sua missão é construir a primeira versão do serviço que centraliza isso: **recebe eventos, descobre quem deve ser notificado e entrega**.


## Eventos suportados

Nesta versão, o sistema trabalha com **apenas 3 eventos**. Quando um evento é publicado, o sistema envia um `POST` com o body correspondente para cada URL cadastrada para aquele evento.

| Evento                        | Quando acontece                                 |
| ----------------------------- | ----------------------------------------------- |
| `pedido.criado`               | Um novo pedido é registrado na plataforma       |
| `pagamento.aprovado`          | O pagamento de um pedido é aprovado             |
| `pagamento.parcela.estornada` | Uma parcela de um pagamento é estornada         |

### Formato do body entregue

Toda entrega segue o mesmo envelope. O campo `dados` muda de acordo com o evento.

```json
{
  "id": "evt_123",
  "evento": "pedido.criado",
  "criadoEm": "2026-10-23T14:00:00Z",
  "dados": { }
}
```

### Exemplos de `dados` por evento

**`pedido.criado`**

```json
{
  "pedidoId": "ped_001",
  "lojistaId": "loj_42",
  "valorTotal": 1200.00,
  "quantidadeParcelas": 6
}
```

**`pagamento.aprovado`**

```json
{
  "pagamentoId": "pag_001",
  "pedidoId": "ped_001",
  "valor": 1200.00
}
```

**`pagamento.parcela.estornada`**

```json
{
  "pagamentoId": "pag_001",
  "pedidoId": "ped_001",
  "numeroParcela": 3,
  "valorEstornado": 200.00
}
```

> Para testar as entregas, você pode usar um serviço como [webhook.site](https://webhook.site) ou subir um endpoint local que apenas registre o que recebeu.


## Requisitos

### 1. Assinaturas

O sistema deve permitir cadastrar uma assinatura informando **um evento** e **uma URL de destino**. Também deve ser possível consultar e desativar as assinaturas.

Assinaturas para eventos que não estão na lista acima (por exemplo `contrato.cancelado`, `pagamento.*` ou string vazia) devem ser **recusadas** no cadastro.

### 2. Publicação

O sistema deve permitir publicar um evento (tipo + dados). Ao receber a publicação, o sistema envia o body para **todas as assinaturas ativas daquele evento**. Assinaturas de outros eventos ou desativadas não recebem nada.

### 3. Depuração

O sistema deve permitir consultar os eventos publicados e suas entregas (para qual URL foi enviado, se deu certo ou falhou), para análise e depuração do comportamento daquele evento.


## Bônus

Uma entrega que falhou não pode simplesmente morrer na primeira tentativa. Implemente retentativas, respeitando:

- existe um **limite de tentativas**, depois do qual a entrega para de ser tentada e fica marcada de forma que ninguém precise caçar no log para achá-la;
- existe um **intervalo de espera** entre uma tentativa e a próxima;
- a **política desse intervalo é trocável por assinatura** — uma pode esperar sempre o mesmo tempo, outra pode ir aumentando a espera a cada falha, e amanhã pode aparecer uma terceira.


### Boa sorte!
