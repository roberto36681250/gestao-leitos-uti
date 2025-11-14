# 🛠️ MELHORIAS PRÁTICAS - GUIA DE IMPLEMENTAÇÃO
## Sistema de Gestão de Leitos Hospitalares - Melhorias Concretas e Implementáveis

**Data**: $(Get-Date -Format "dd/MM/yyyy HH:mm:ss")  
**Objetivo**: Melhorias práticas e implementáveis imediatamente  
**Organização**: Por prioridade e esforço

---

## 📊 MATRIZ DE PRIORIZAÇÃO

| Prioridade | Esforço | Impacto | ROI |
|------------|---------|---------|-----|
| 🔴 Alta    | Baixo   | Alto    | ⭐⭐⭐⭐⭐ |
| 🟠 Média   | Médio   | Alto    | ⭐⭐⭐⭐ |
| 🟡 Baixa   | Alto    | Alto    | ⭐⭐⭐ |
| 🟢 Futuro  | Variado | Variado | ⭐⭐ |

---

## 🔴 PARTE 1: MELHORIAS DE ALTA PRIORIDADE (Implementação Imediata)

### 1.1 Identificação de Usuários e Auditoria

#### ✅ Implementar Login Simplificado
**Esforço**: 🟢 Baixo (2-3 dias)  
**Impacto**: ⭐⭐⭐⭐⭐ Alto  
**Descrição**: Sistema de autenticação opcional para identificar quem fez cada ação

**Implementação**:
```typescript
// hooks/useAuth.ts
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const login = async (credentials: LoginCredentials) => {
    // Implementar login simples (email/senha ou PIN)
    const { data, error } = await supabase.auth.signInWithPassword(credentials);
    if (data.user) setUser(data.user);
  };
  
  const loginWithPin = async (pin: string) => {
    // Login rápido por PIN (4-6 dígitos)
    const { data } = await supabase.from('user_pins').select('user_id').eq('pin', pin).single();
    if (data) {
      const user = await fetchUser(data.user_id);
      setUser(user);
    }
  };
  
  return { user, isAuthenticated, login, loginWithPin };
}
```

**Mudanças no Banco**:
```sql
-- Adicionar tabela de usuários
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  role TEXT NOT NULL, -- 'medico', 'enfermeira', 'admin', 'gestor', 'visitante'
  pin VARCHAR(6), -- PIN opcional para login rápido
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Adicionar user_id nas ações
ALTER TABLE action_log ADD COLUMN user_id UUID REFERENCES users(id);
ALTER TABLE action_log ADD COLUMN user_name TEXT;
ALTER TABLE action_log ADD COLUMN user_role TEXT;
```

**Vantagens**:
- ✅ Rastreabilidade completa de ações
- ✅ Auditoria para compliance
- ✅ Responsabilização
- ✅ Análise de padrões de uso

---

### 1.2 Sistema de Notificações Push

**Esforço**: 🟡 Médio (3-5 dias)  
**Impacto**: ⭐⭐⭐⭐⭐ Alto  
**Descrição**: Notificações push em tempo real para ações críticas

**Implementação**:
```typescript
// hooks/useNotifications.ts
export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  
  useEffect(() => {
    // Solicitar permissão ao carregar
    if ('Notification' in window) {
      Notification.requestPermission().then(setPermission);
    }
  }, []);
  
  const notify = useCallback((title: string, options?: NotificationOptions) => {
    if (permission === 'granted') {
      new Notification(title, {
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        ...options
      });
    }
  }, [permission]);
  
  return { notify, permission };
}

// No useBedsRealtime, adicionar notificações
useEffect(() => {
  beds.forEach((bed) => {
    const prevBed = prevBedsRef.current.find((b) => b.id === bed.id);
    if (prevBed && prevBed.state !== bed.state) {
      // Notificar mudanças críticas
      if (bed.state === 'Vago') {
        notify('Leito Vago', {
          body: `Leito ${bed.number} está disponível`,
          tag: `bed-${bed.id}`,
        });
      } else if (bed.state === 'Alta Sinalizada') {
        notify('Alta Sinalizada', {
          body: `Leito ${bed.number} precisa de higienização`,
          tag: `bed-${bed.id}`,
        });
      }
    }
  });
}, [beds, notify]);
```

**Vantagens**:
- ✅ Alertas imediatos para ações críticas
- ✅ Não precisa ficar olhando a tela
- ✅ Redução de tempo de resposta
- ✅ Melhor coordenação da equipe

---

### 1.3 Histórico Persistente Completo

**Esforço**: 🟡 Médio (2-3 dias)  
**Impacto**: ⭐⭐⭐⭐ Alto  
**Descrição**: Histórico completo de todas as ações no banco de dados

**Implementação**:
```sql
-- Tabela de histórico de ações
CREATE TABLE action_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bed_id UUID NOT NULL REFERENCES beds(id),
  bed_number INTEGER NOT NULL,
  action TEXT NOT NULL, -- 'Alta Sinalizada', 'Iniciar Higienização', etc.
  previous_state TEXT,
  new_state TEXT,
  user_id UUID REFERENCES users(id),
  user_name TEXT,
  user_role TEXT,
  details JSONB, -- Dados adicionais (motivo, observação, etc.)
  timestamp TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_action_history_bed_id ON action_history(bed_id);
CREATE INDEX idx_action_history_timestamp ON action_history(timestamp DESC);
CREATE INDEX idx_action_history_user_id ON action_history(user_id);
CREATE INDEX idx_action_history_action ON action_history(action);

-- Trigger para registrar automaticamente mudanças de estado
CREATE OR REPLACE FUNCTION log_state_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.state != NEW.state THEN
    INSERT INTO action_history (
      bed_id, bed_number, action, previous_state, new_state, timestamp
    ) VALUES (
      NEW.id, NEW.number, 
      CASE 
        WHEN NEW.state = 'Alta Sinalizada' THEN 'Alta Sinalizada'
        WHEN NEW.state = 'Alta Efetivada' THEN 'Alta Efetivada'
        WHEN NEW.state = 'Higienização' THEN 'Iniciar Higienização'
        WHEN NEW.state = 'Vago' THEN 'Finalizar Higienização'
        ELSE NEW.state
      END,
      OLD.state, NEW.state, now()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER beds_log_state_change
AFTER UPDATE ON beds
FOR EACH ROW
WHEN (OLD.state IS DISTINCT FROM NEW.state)
EXECUTE FUNCTION log_state_change();
```

**Vantagens**:
- ✅ Histórico completo e persistente
- ✅ Auditoria para compliance
- ✅ Análise de padrões históricos
- ✅ Recuperação de informações

---

### 1.4 Sistema de Comentários por Leito

**Esforço**: 🟡 Médio (3-4 dias)  
**Impacto**: ⭐⭐⭐⭐ Alto  
**Descrição**: Comentários temporários ou permanentes por leito

**Implementação**:
```sql
-- Tabela de comentários
CREATE TABLE bed_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bed_id UUID NOT NULL REFERENCES beds(id),
  user_id UUID REFERENCES users(id),
  user_name TEXT NOT NULL,
  comment TEXT NOT NULL,
  is_temporary BOOLEAN DEFAULT false, -- Se true, expira em 24h
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX idx_bed_comments_bed_id ON bed_comments(bed_id);
CREATE INDEX idx_bed_comments_expires_at ON bed_comments(expires_at);

-- Função para limpar comentários temporários expirados
CREATE OR REPLACE FUNCTION cleanup_expired_comments()
RETURNS void AS $$
BEGIN
  DELETE FROM bed_comments 
  WHERE is_temporary = true 
    AND expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Agendar limpeza diária (via pg_cron ou job externo)
```

```typescript
// components/BedComments.tsx
export function BedComments({ bedId }: { bedId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  
  useEffect(() => {
    // Buscar comentários do leito
    const fetchComments = async () => {
      const { data } = await supabase
        .from('bed_comments')
        .select('*')
        .eq('bed_id', bedId)
        .is('expires_at', null) // Apenas não expirados
        .order('created_at', { ascending: false });
      setComments(data || []);
    };
    fetchComments();
    
    // Subscrição para novos comentários
    const channel = supabase
      .channel(`bed-comments-${bedId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bed_comments',
        filter: `bed_id=eq.${bedId}`
      }, () => fetchComments())
      .subscribe();
    
    return () => { supabase.removeChannel(channel); };
  }, [bedId]);
  
  const addComment = async () => {
    const { user } = await supabase.auth.getUser();
    await supabase.from('bed_comments').insert({
      bed_id: bedId,
      user_id: user?.id,
      user_name: user?.email || 'Anônimo',
      comment: newComment,
      is_temporary: false,
    });
    setNewComment('');
  };
  
  return (
    <div className="space-y-2">
      {comments.map(comment => (
        <div key={comment.id} className="text-sm">
          <strong>{comment.user_name}</strong>: {comment.comment}
          <span className="text-xs text-gray-500 ml-2">
            {format(new Date(comment.created_at), 'HH:mm')}
          </span>
        </div>
      ))}
      <Input
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Adicionar comentário..."
        onKeyPress={(e) => e.key === 'Enter' && addComment()}
      />
    </div>
  );
}
```

**Vantagens**:
- ✅ Comunicação contextual por leito
- ✅ Compartilhamento de informações importantes
- ✅ Histórico de conversas
- ✅ Melhor coordenação da equipe

---

### 1.5 Dashboard de Gargalos Melhorado

**Esforço**: 🟢 Baixo (1-2 dias)  
**Impacto**: ⭐⭐⭐⭐ Alto  
**Descrição**: Dashboard visual de gargalos com alertas automáticos

**Implementação**:
```typescript
// components/BottlenecksDashboard.tsx
export function BottlenecksDashboard({ beds }: { beds: BedWithReservation[] }) {
  const bottlenecks = useBottlenecks(beds);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  
  useEffect(() => {
    const newAlerts: Alert[] = [];
    
    // Alerta se mediana de Alta Sinalizada > meta
    if (bottlenecks.altaSinalizada.median > META_ALTA_MIN) {
      newAlerts.push({
        type: 'warning',
        message: `Alta Sinalizada: mediana ${bottlenecks.altaSinalizada.median}m (meta: ${META_ALTA_MIN}m)`,
      });
    }
    
    // Alerta se mediana de Higienização > meta
    if (bottlenecks.higienizacao.median > META_HIGIENE_MIN) {
      newAlerts.push({
        type: 'error',
        message: `Higienização: mediana ${bottlenecks.higienizacao.median}m (meta: ${META_HIGIENE_MIN}m)`,
      });
    }
    
    setAlerts(newAlerts);
  }, [bottlenecks]);
  
  return (
    <div className="space-y-4">
      {/* Gráficos de tempo */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Alta Sinalizada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>Mediana: {bottlenecks.altaSinalizada.median}m</div>
              <div>P95: {bottlenecks.altaSinalizada.p95}m</div>
              <Progress value={(bottlenecks.altaSinalizada.median / META_ALTA_MIN) * 100} />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Higienização</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>Mediana: {bottlenecks.higienizacao.median}m</div>
              <div>P95: {bottlenecks.higienizacao.p95}m</div>
              <Progress value={(bottlenecks.higienizacao.median / META_HIGIENE_MIN) * 100} />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Alertas */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <Alert key={i} variant={alert.type === 'error' ? 'destructive' : 'default'}>
              <AlertTitle>{alert.message}</AlertTitle>
            </Alert>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Vantagens**:
- ✅ Visibilidade clara de gargalos
- ✅ Alertas automáticos
- ✅ Métricas visuais
- ✅ Tomada de decisão mais rápida

---

## 🟠 PARTE 2: MELHORIAS DE MÉDIA PRIORIDADE (Próximas Semanas)

### 2.1 PWA (Progressive Web App)

**Esforço**: 🟡 Médio (3-4 dias)  
**Impacto**: ⭐⭐⭐⭐ Alto  
**Descrição**: Transformar em PWA instalável com funcionamento offline completo

**Implementação**:
1. Adicionar `manifest.json` completo
2. Configurar Service Worker para cache
3. Implementar estratégia de cache offline-first
4. Adicionar ícones e splash screens

---

### 2.2 Visualização Kanban Melhorada

**Esforço**: 🟡 Médio (4-5 dias)  
**Impacto**: ⭐⭐⭐⭐ Alto  
**Descrição**: Vista Kanban com drag-and-drop real e limites de WIP visuais

---

### 2.3 Sistema de Previsões Simples

**Esforço**: 🟠 Alto (5-7 dias)  
**Impacto**: ⭐⭐⭐⭐ Alto  
**Descrição**: Previsões básicas baseadas em padrões históricos

---

### 2.4 Exportação Avançada

**Esforço**: 🟢 Baixo (2-3 dias)  
**Impacto**: ⭐⭐⭐ Médio  
**Descrição**: Exportação para Excel, PDF com gráficos e formatação

---

## 🟡 PARTE 3: MELHORIAS DE BAIXA PRIORIDADE (Próximos Meses)

### 3.1 Integração com WhatsApp Business API

**Esforço**: 🟠 Alto (5-7 dias)  
**Impacto**: ⭐⭐⭐ Médio  
**Descrição**: Notificações e consultas via WhatsApp

---

### 3.2 App Mobile Nativo

**Esforço**: 🔴 Muito Alto (4-6 semanas)  
**Impacto**: ⭐⭐⭐⭐ Alto  
**Descrição**: Apps nativos iOS e Android

---

### 3.3 Visualizações 3D

**Esforço**: 🔴 Muito Alto (6-8 semanas)  
**Impacto**: ⭐⭐⭐ Médio  
**Descrição**: Renderização 3D da unidade hospitalar

---

## 🟢 PARTE 4: MELHORIAS FUTURAS (Backlog)

### 4.1 IA e Machine Learning

- Previsões avançadas com ML
- Recomendações inteligentes
- Detecção automática de anomalias

### 4.2 Multi-tenancy

- Suporte a múltiplos hospitais
- Isolamento de dados
- Dashboard agregado

### 4.3 Integrações Complexas

- HL7/FHIR
- Sistemas de prontuário eletrônico
- Equipamentos IoT

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1: Fundação (Sprint 1-2)
- [ ] Sistema de autenticação opcional
- [ ] Histórico persistente completo
- [ ] Notificações push básicas
- [ ] Sistema de comentários

### Fase 2: Melhorias (Sprint 3-4)
- [ ] Dashboard de gargalos melhorado
- [ ] PWA funcional
- [ ] Exportação avançada
- [ ] Visualização Kanban melhorada

### Fase 3: Avançado (Sprint 5+)
- [ ] Previsões básicas
- [ ] Integração WhatsApp
- [ ] App mobile nativo
- [ ] IA e ML

---

**Fim do Documento de Melhorias Práticas**

