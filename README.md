# Sistema de Controle de Ferramentas

Aplicação web completa em Next.js 14 para gerenciamento de ferramentas com autenticação, QR codes e **scanner de câmera em tempo real** otimizado para uso em armazém.

## 🚀 Funcionalidades

### Autenticação
- **Admin** (usuário: `admin`, senha: `admin123`) - Acesso completo
- **Chefe de Armazém** (usuário: `armazem`, senha: `armazem123`) - Interface otimizada para operações diárias

### Gerenciamento de Ferramentas
- CRUD completo de ferramentas com fotos e códigos de barras
- Status em tempo real (disponível/atribuída)
- Geração automática de QR codes para cada ferramenta

### Gerenciamento de Usuários
- CRUD de usuários com cargos
- Geração automática de QR codes únicos para cada usuário
- Download individual ou em lote (ZIP) dos QR codes
- Visualização de ferramentas atribuídas por usuário

### Sistema de Atribuições
- Atribuição múltipla de ferramentas por usuário
- Agrupamento inteligente por usuário no dashboard
- Devolução seletiva ou total de ferramentas
- Histórico completo de atribuições e devoluções
- Indicadores visuais de status (pendente, atrasada >7 dias, devolvida)

### 📸 Leitura Rápida QR com Câmera (Chefe de Armazém)
**NOVO: Scanner de câmera em tempo real!**

- **Ativação de câmera real** com `html5-qrcode`
- **Suporte a dispositivos móveis** (câmera traseira automática)
- **Suporte a pistola de leitura QR** (via input de teclado)
- **Modal full-screen** com fluxo linear único
- **Ações rápidas pós-scan**:
  - Atribuir ferramentas (multi-select)
  - Devolver ferramentas (seletivo)
  - Ver detalhes do usuário
- **Bloqueio de navegação** durante sessão de scan
- **Fallback manual** se câmera não disponível
- **Toasts informativos** para cada ação

#### Como Usar o Scanner:
1. No dashboard, clique em **"Ativar Câmera e Escanear QR"**
2. Permita acesso à câmera quando solicitado
3. Aponte para o QR code do usuário (USER-001, USER-002, USER-003)
4. Modal de ações abre automaticamente após scan
5. Escolha: Atribuir, Devolver ou Ver Detalhes
6. Finalize a sessão quando concluir

#### Suporte a Pistola QR:
- Use o input manual para pistolas USB que emulam teclado
- Digite ou escaneie o código e pressione Enter
- Processamento automático igual ao scanner de câmera

### Interface
- Tema claro/escuro com toggle
- Design 100% mobile-first e responsivo
- Tabelas com accordion para detalhes expandíveis
- Cards com métricas em tempo real
- Toasts para feedback de ações
- Touch targets mínimos de 44px para mobile

## 🛠️ Tecnologias

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS v4** + shadcn/ui
- **Zustand** (gerenciamento de estado)
- **qrcode.react** (geração de QR codes)
- **html5-qrcode** (scanner de câmera em tempo real)
- **JSZip** (download em lote)
- **Lucide React** (ícones)
- **Sonner** (toasts)

## 📦 Instalação

\`\`\`bash
# Clone o repositório
git clone <seu-repo>

# Instale as dependências
npm install

# Execute em desenvolvimento
npm run dev

# Build para produção
npm run build
npm start
\`\`\`

## 🎯 Como Usar

### Login
1. Acesse `/login`
2. Use as credenciais:
   - Admin: `admin` / `admin123`
   - Armazém: `armazem` / `armazem123`

### Fluxo Chefe de Armazém
1. **Dashboard**: Visualize métricas e atribuições pendentes agrupadas por usuário
2. **Leitura Rápida QR**: 
   - Clique no botão verde pulsante "Ativar Câmera e Escanear QR"
   - Permita acesso à câmera (necessário HTTPS em produção)
   - Aponte para o QR code do usuário
   - Modal de ações abre automaticamente
   - Atribua ou devolva ferramentas com multi-select
   - Finalize a sessão quando concluir
3. **Atribuições**: Crie novas atribuições selecionando múltiplas ferramentas
4. **Ferramentas**: Visualize todas as ferramentas e seus status

### Fluxo Admin
- Todas as funcionalidades do Chefe de Armazém
- Gerenciar usuários (criar, editar, deletar)
- Gerenciar ferramentas (criar, editar, deletar)
- Baixar QR codes em lote
- Visualizar histórico completo

## 🔧 Estrutura de Dados

### Usuários
- ID único
- Nome e cargo
- QR Code único (USER-XXX)
- Ferramentas atribuídas
- Data da última atribuição

### Ferramentas
- ID único
- Nome e código de barras
- Foto
- Status (disponível/atribuída)
- Usuário atribuído

### Atribuições
- Usuário
- Lista de ferramentas
- Data de atribuição
- Obra/Projeto
- Status (pendente/devolvida)
- Data de devolução

## 🎨 Recursos Visuais

- **Verde**: Ferramentas disponíveis / Botão scanner
- **Amarelo**: Atribuições pendentes
- **Vermelho**: Atribuições atrasadas (>7 dias) / Finalizar sessão
- **Accordion**: Expandir lista de ferramentas por usuário
- **Badges**: Status visual com cores semânticas
- **Animação pulse**: Botão de scanner para chamar atenção

## 🚀 Deploy

### Vercel (Recomendado)
\`\`\`bash
# Conecte seu repositório GitHub
# Deploy automático em cada push
\`\`\`

**⚠️ IMPORTANTE para Scanner de Câmera:**
- O acesso à câmera requer **HTTPS** em produção
- Vercel fornece HTTPS automaticamente
- Em desenvolvimento local, use `http://localhost` (permitido pelos navegadores)

### Outras Plataformas
\`\`\`bash
npm run build
# Deploy da pasta .next
# Certifique-se de ter HTTPS configurado
\`\`\`

## 📱 Scanner de Câmera - Detalhes Técnicos

### Implementação
O scanner usa `html5-qrcode` com as seguintes configurações:

\`\`\`typescript
// Solicita permissões explicitamente
const stream = await navigator.mediaDevices.getUserMedia({
  video: { facingMode: "environment" } // Câmera traseira em mobile
})

// Inicializa scanner
const scanner = new Html5QrcodeScanner("qr-reader", {
  fps: 10,
  qrbox: { width: 300, height: 300 },
  aspectRatio: 1.0,
  videoConstraints: { facingMode: "environment" }
})

// Processa scan
scanner.render(
  (decodedText) => {
    // Decodifica USER-001 ou JSON {id: 1, nome: 'João'}
    const user = findUserByQRCode(decodedText)
    // Abre modal de ações
  }
)
\`\`\`

### Compatibilidade
- ✅ Chrome/Edge (desktop e mobile)
- ✅ Safari (iOS 11+)
- ✅ Firefox (desktop e mobile)
- ✅ Pistolas QR USB (emulação de teclado)

### Troubleshooting
- **Câmera não abre**: Verifique permissões do navegador
- **Erro HTTPS**: Use HTTPS em produção (Vercel fornece automaticamente)
- **Mobile não funciona**: Certifique-se de permitir acesso à câmera
- **Pistola QR**: Use o input manual, funciona como teclado

## 📝 Dados Demo

A aplicação vem com dados iniciais:
- 3 usuários com QR codes (USER-001, USER-002, USER-003)
- 5 ferramentas
- 2 atribuições pendentes agrupadas

Os dados são persistidos no localStorage via Zustand.

## 🔒 Segurança

- Autenticação baseada em sessão (localStorage)
- Validação de permissões por role
- Proteção de rotas sensíveis
- Bloqueio de navegação durante sessão de scan

## 🎯 Roadmap

- [ ] Integração com banco de dados real (Supabase/Neon)
- [ ] Relatórios avançados com gráficos
- [ ] Notificações push para devoluções atrasadas
- [ ] Exportação de dados (CSV/PDF)
- [ ] Multi-tenancy para múltiplas empresas

## 📄 Licença

MIT
