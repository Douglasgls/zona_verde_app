# Zona Verde App

Frontend web do ecossistema **Zona Verde**, responsável por exibir o estado das vagas em tempo real, gerenciar reservas e apoiar o fluxo operacional de estacionamento inteligente.

> Este repositório funciona em conjunto com:
>
> - **`zona_verde_api`**: API REST + servidor WebSocket com regras de negócio e persistência.
> - **`zona_verde_esp`**: firmware embarcado (ESP32/ESP-CAM) para leitura/telemetria de vagas e placas.

---

## Arquitetura do ecossistema

```text
zona_verde_esp (ESP32/ESP-CAM + sensores/câmera)
        │
        │ envia eventos/leitura de placa
        ▼
zona_verde_api (REST + WebSocket)
        │                 │
        │ REST            │ WS /plate/ws
        ▼                 ▼
  zona_verde_app (React + Vite + Tailwind)
```

### Papel de cada repositório

- **`zona_verde_esp`**
  - Coleta dados físicos (ocupação, OCR, sinalização de alerta).
  - Publica leituras para a API consolidar.
- **`zona_verde_api`**
  - Disponibiliza dados estruturados em endpoints REST (`/client`, `/spots`, `/reservations`).
  - Transmite atualizações instantâneas via WebSocket (`/plate/ws`).
- **`zona_verde_app`** (este repo)
  - Busca estado base pela API REST.
  - Escuta eventos em tempo real no WebSocket.
  - Mescla os dados e renderiza o painel de operações.

---

## Destaque: fluxo em tempo real via WebSocket

O painel usa `react-use-websocket` para conexão contínua com o endpoint:

- **URL base**: `VITE_BASE_URL_WS`
- **Canal usado**: `/plate/ws`
- **Reconexão automática**: habilitada (`reconnectInterval: 3000`)

### Payload esperado (exemplo)

```json
{
  "id": "3",
  "status": "RESERVADO",
  "is_alert": false,
  "plate_ocr": "ABC1D23",
  "plate_db": "ABC1D23",
  "similarity": "97.3",
  "current_status": "OCUPADO",
  "last_time": "2026-01-14T10:23:54"
}
```

### Como o app trata o evento

1. Recebe mensagem WS e converte JSON.
2. Persiste em store local (`zustand + persist`).
3. Combina dados de:
   - vagas (`/spots`),
   - reservas (`/reservations`),
   - clientes (`/client`),
   - e leitura ao vivo (WS).
4. Atualiza o card de vaga sem recarregar a tela.

---

## Requisitos

- Node.js 18+
- npm 9+

---

## Configuração do ambiente

Copie `.envExample` para `.env` e ajuste conforme seu ambiente:

```bash
cp .envExample .env
```

Exemplo de variáveis:

```env
VITE_BASE_URL_API=http://localhost:8000
VITE_BASE_URL_WS=ws://localhost:8000
```

> Dica: a API e o WebSocket precisam apontar para o mesmo backend do `zona_verde_api`.

---

## Como rodar

```bash
npm install
npm run dev
```

Aplicação padrão: `http://localhost:5173`

---

## Scripts disponíveis

- `npm run dev` — ambiente de desenvolvimento.
- `npm run build` — build de produção (TypeScript + Vite).
- `npm run preview` — preview local do build.

---

## Principais tecnologias

- React + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- Zustand (com persistência local)
- react-use-websocket
- Sonner (notificações)

---

## Guia rápido de integração entre repositórios

### 1) Suba o `zona_verde_api`

- Garanta endpoints REST ativos.
- Garanta o WebSocket `/plate/ws` disponível.

### 2) Suba o `zona_verde_esp`

- Configure envio de leituras para o backend.
- Valide que eventos novos chegam no WS.

### 3) Rode o `zona_verde_app`

- Configure `.env` com URLs corretas.
- Abra o dashboard e acompanhe os cards atualizando em tempo real.

---

## Troubleshooting

### Painel não atualiza em tempo real

- Verifique `VITE_BASE_URL_WS`.
- Confirme se o backend expõe `/plate/ws`.
- Veja se o status de conexão no cabeçalho do dashboard está **online**.

### Dados de cliente/placa incompletos

- Verifique retorno de `/client` e `/reservations` na API.
- Confirme se a associação `client_id` ↔ `spot_id` existe no backend.

### Sem dados no dashboard

- Verifique `VITE_BASE_URL_API`.
- Confirme CORS e disponibilidade da API.

---

## Licença

MIT.
