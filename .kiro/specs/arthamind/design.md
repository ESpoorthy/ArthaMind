# ArthaMind AI Banking Simulator - Technical Design

## System Overview

ArthaMind is a comprehensive AI-powered banking simulator built using modern cloud-native architecture. The system demonstrates advanced AI banking capabilities through a multi-agent architecture powered by LangGraph and Gemini 2.5 Flash, providing realistic banking experiences without real financial integrations.

### Core Architecture Principles

- **Microservices Architecture**: Loosely coupled services with clear boundaries
- **AI-First Design**: Multi-agent system handling specialized banking domains  
- **Event-Driven Communication**: Asynchronous messaging between components
- **Cloud-Native**: Containerized services with horizontal scalability
- **Security by Design**: End-to-end encryption and zero-trust security model
- **Simulation-Based**: Safe testing environment with synthetic banking data

### Technology Stack

- **Frontend**: React 18 with TypeScript, Tailwind CSS, React Query
- **Backend**: Node.js with Express, TypeScript, Prisma ORM
- **AI Platform**: LangGraph for multi-agent orchestration, Gemini 2.5 Flash LLM
- **Database**: PostgreSQL for transactional data, ChromaDB for vector storage
- **Authentication**: JWT with refresh tokens, bcrypt for password hashing  
- **Communication**: WebSocket for real-time updates, Redis for caching
- **Infrastructure**: Docker containers, NGINX reverse proxy
- **Voice Processing**: Web Speech API, Azure Speech Services
- **Document Processing**: Tesseract OCR, PDF.js for document handling

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Customer       │  │  Human Agent    │  │  Manager        │
│  Portal         │  │  Portal         │  │  Dashboard      │
└─────────────────┘  └─────────────────┘  └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
              ┌──────────────────────────────────────┐
              │         API Gateway                  │
              │      (Authentication & Routing)      │
              └──────────────────────────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Customer       │  │  Agent          │  │  Analytics      │
│  Service        │  │  Orchestration  │  │  Service        │
│                 │  │  (LangGraph)    │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
              ┌──────────────────────────────────────┐
              │           Data Layer                 │
              │  PostgreSQL | ChromaDB | Redis      │
              └──────────────────────────────────────┘
```

### Core Services Architecture

#### 1. API Gateway Service
- **Purpose**: Single entry point for all client requests
- **Responsibilities**: Authentication, routing, rate limiting, CORS
- **Technology**: Express.js with helmet and express-rate-limit
- **Scalability**: Stateless design with horizontal scaling

#### 2. Customer Service  
- **Purpose**: Manages customer data and banking operations
- **Responsibilities**: Account management, transactions, card operations
- **Database**: PostgreSQL with optimized indexes for banking queries
- **Caching**: Redis for frequently accessed account data

#### 3. AI Agent Orchestration Service
- **Purpose**: Coordinates multi-agent AI workflows using LangGraph
- **Responsibilities**: Intent routing, agent coordination, context management  
- **Technology**: LangGraph with Gemini 2.5 Flash integration
- **Architecture**: Event-driven agent communication with state management

#### 4. Analytics Service
- **Purpose**: Real-time analytics and reporting for management dashboards
- **Responsibilities**: Performance metrics, fraud detection, business intelligence
- **Technology**: Time-series data processing with aggregation pipelines
- **Storage**: Specialized analytics tables with materialized views

#### 5. Notification Service  
- **Purpose**: Multi-channel notification delivery
- **Responsibilities**: Email, SMS, push notifications, delivery tracking
- **Technology**: Queue-based processing with retry mechanisms
- **Integrations**: SMTP, SMS gateway, WebSocket for real-time updates

## Database Design

### Core Entity Relationships

```sql
-- Customer Management
CREATE TABLE customers (
    customer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    address JSONB NOT NULL,
    kyc_status VARCHAR(20) DEFAULT 'pending',
    risk_score INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Account Management  
CREATE TABLE accounts (
    account_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(customer_id),
    account_number VARCHAR(16) UNIQUE NOT NULL,
    account_type VARCHAR(20) NOT NULL, -- savings, current, loan
    balance DECIMAL(15,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'INR',
    status VARCHAR(20) DEFAULT 'active',
    opened_date DATE DEFAULT CURRENT_DATE,
    last_transaction_date TIMESTAMP,
    overdraft_limit DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Card Management
CREATE TABLE cards (
    card_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(account_id),
    card_number VARCHAR(16) UNIQUE NOT NULL,
    card_type VARCHAR(20) NOT NULL, -- debit, credit
    expiry_date DATE NOT NULL,
    cvv_hash VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    credit_limit DECIMAL(15,2),
    available_credit DECIMAL(15,2),
    pin_hash VARCHAR(255) NOT NULL,
    issued_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Transaction Management
CREATE TABLE transactions (
    transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(account_id),
    transaction_type VARCHAR(20) NOT NULL, -- debit, credit, transfer
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    balance_after DECIMAL(15,2) NOT NULL,
    description TEXT NOT NULL,
    merchant_category VARCHAR(50),
    merchant_name VARCHAR(100),
    reference_number VARCHAR(50) UNIQUE,
    status VARCHAR(20) DEFAULT 'completed',
    transaction_date TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);
```
-- Loan Management
CREATE TABLE loans (
    loan_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(customer_id),
    loan_type VARCHAR(30) NOT NULL, -- personal, home, auto
    principal_amount DECIMAL(15,2) NOT NULL,
    interest_rate DECIMAL(5,4) NOT NULL,
    tenure_months INTEGER NOT NULL,
    emi_amount DECIMAL(15,2) NOT NULL,
    outstanding_amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    disbursement_date DATE,
    maturity_date DATE,
    next_emi_date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Fixed Deposit Management
CREATE TABLE fixed_deposits (
    fd_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(customer_id),
    principal_amount DECIMAL(15,2) NOT NULL,
    interest_rate DECIMAL(5,4) NOT NULL,
    tenure_months INTEGER NOT NULL,
    maturity_amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    start_date DATE DEFAULT CURRENT_DATE,
    maturity_date DATE NOT NULL,
    auto_renewal BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Fraud Detection
CREATE TABLE fraud_alerts (
    alert_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(customer_id),
    transaction_id UUID REFERENCES transactions(transaction_id),
    alert_type VARCHAR(30) NOT NULL,
    risk_score INTEGER NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'open',
    created_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP
);

-- Customer Support
CREATE TABLE support_tickets (
    ticket_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(customer_id),
    agent_id UUID,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'open',
    category VARCHAR(50) NOT NULL,
    conversation_history JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- AI Agent Interactions
CREATE TABLE agent_interactions (
    interaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL,
    customer_id UUID REFERENCES customers(customer_id),
    agent_type VARCHAR(30) NOT NULL,
    intent VARCHAR(50),
    user_message TEXT,
    agent_response TEXT,
    confidence_score DECIMAL(3,2),
    response_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);
```
### Database Indexes and Performance Optimization

```sql
-- Customer lookup optimization
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);

-- Account performance indexes  
CREATE INDEX idx_accounts_customer_id ON accounts(customer_id);
CREATE INDEX idx_accounts_number ON accounts(account_number);
CREATE INDEX idx_accounts_status ON accounts(status) WHERE status = 'active';

-- Transaction query optimization
CREATE INDEX idx_transactions_account_date ON transactions(account_id, transaction_date DESC);
CREATE INDEX idx_transactions_type_date ON transactions(transaction_type, transaction_date);
CREATE INDEX idx_transactions_merchant ON transactions(merchant_category, transaction_date);

-- Card management indexes
CREATE INDEX idx_cards_account_id ON cards(account_id);
CREATE INDEX idx_cards_number ON cards(card_number);
CREATE INDEX idx_cards_status ON cards(status) WHERE status IN ('active', 'blocked');

-- Fraud detection optimization
CREATE INDEX idx_fraud_alerts_customer ON fraud_alerts(customer_id, created_at DESC);
CREATE INDEX idx_fraud_alerts_status ON fraud_alerts(status) WHERE status = 'open';

-- AI interaction analytics
CREATE INDEX idx_agent_interactions_session ON agent_interactions(session_id, created_at);
CREATE INDEX idx_agent_interactions_agent_type ON agent_interactions(agent_type, created_at);
```

## API Design

### Authentication API

```typescript
interface AuthenticationAPI {
  // Customer authentication
  POST /api/auth/login
  Request: { email: string, password: string }
  Response: { token: string, refreshToken: string, customer: CustomerProfile }

  POST /api/auth/demo-login
  Request: { demoAccountId: string }
  Response: { token: string, customer: CustomerProfile }

  POST /api/auth/refresh
  Request: { refreshToken: string }
  Response: { token: string }

  POST /api/auth/logout
  Request: { refreshToken: string }
  Response: { success: boolean }
}
```

### Customer Service API

```typescript
interface CustomerServiceAPI {
  // Account management
  GET /api/customers/accounts
  Response: Account[]

  GET /api/customers/accounts/{accountId}/transactions
  Query: { limit?: number, offset?: number, startDate?: string, endDate?: string }
  Response: { transactions: Transaction[], totalCount: number }

  GET /api/customers/accounts/{accountId}/balance
  Response: { balance: number, currency: string, lastUpdated: string }

  // Card management  
  GET /api/customers/cards
  Response: Card[]

  POST /api/customers/cards/{cardId}/block
  Request: { reason: string }
  Response: { success: boolean, blockedAt: string }

  POST /api/customers/cards/{cardId}/report-lost
  Request: { reason: string, reportLocation?: string }
  Response: { success: boolean, replacementCardId: string, estimatedDelivery: string }

  GET /api/customers/cards/{cardId}/analytics
  Response: CardAnalytics
}
```
### Loan Service API

```typescript
interface LoanServiceAPI {
  // Loan eligibility and applications
  POST /api/loans/eligibility
  Request: { loanType: string, requestedAmount: number }
  Response: { eligible: boolean, maxAmount?: number, recommendedTenure?: number }

  POST /api/loans/apply
  Request: LoanApplication
  Response: { applicationId: string, status: string, estimatedApprovalTime: string }

  GET /api/loans/calculator/emi
  Query: { amount: number, rate: number, tenure: number }
  Response: { emiAmount: number, totalInterest: number, totalAmount: number }

  GET /api/customers/loans
  Response: Loan[]

  GET /api/customers/loans/{loanId}/schedule
  Response: EMISchedule[]
}

interface LoanApplication {
  loanType: string;
  amount: number;
  tenure: number;
  purpose: string;
  monthlyIncome: number;
  employmentType: string;
  documents: DocumentUpload[];
}
```

### Investment Service API  

```typescript
interface InvestmentServiceAPI {
  // Fixed Deposit management
  GET /api/investments/fd/rates
  Response: FDRate[]

  POST /api/investments/fd/create
  Request: { amount: number, tenure: number, autoRenewal: boolean }
  Response: { fdId: string, maturityAmount: number, maturityDate: string }

  GET /api/customers/investments
  Response: Investment[]

  GET /api/investments/recommendations
  Query: { riskAppetite: string, investmentGoal: string, amount?: number }
  Response: InvestmentRecommendation[]
}
```

### AI Agent API

```typescript
interface AIAgentAPI {
  // Conversation management
  POST /api/ai/chat/sessions
  Response: { sessionId: string }

  POST /api/ai/chat/sessions/{sessionId}/messages
  Request: { message: string, messageType?: 'text' | 'voice' }
  Response: { response: string, agentType: string, confidence: number, actions?: AIAction[] }

  GET /api/ai/chat/sessions/{sessionId}/history
  Response: ChatMessage[]

  // Voice banking
  POST /api/ai/voice/process
  Request: { audioData: Blob, sessionId: string }
  Response: { transcription: string, response: string, audioResponse: Blob }

  // Document processing
  POST /api/ai/documents/process
  Request: { file: File, documentType: string }
  Response: { extractedData: any, confidence: number, validationResults: ValidationResult[] }
}
```
## AI Agent Architecture

### Multi-Agent System Design

```typescript
interface AgentArchitecture {
  // Core agent types
  RouterAgent: IntentClassificationAgent;
  MemoryAgent: ConversationContextAgent;
  FAQAgent: KnowledgeRetrievalAgent;
  CardAgent: CardServiceAgent;
  LoanAgent: LoanServiceAgent;
  FraudAgent: FraudDetectionAgent;
  InvestmentAgent: InvestmentServiceAgent;
  HumanHandoffAgent: EscalationAgent;
}
```

### LangGraph Workflow Implementation

```typescript
// Agent workflow state management
interface AgentState {
  sessionId: string;
  customerId: string;
  currentAgent: string;
  conversationHistory: Message[];
  extractedEntities: Record<string, any>;
  pendingActions: Action[];
  escalationReason?: string;
}

// Router Agent implementation
class RouterAgent implements Agent {
  async processMessage(state: AgentState, message: string): Promise<AgentDecision> {
    const intent = await this.classifyIntent(message);
    const confidence = await this.calculateConfidence(message, intent);
    
    if (confidence < 0.7) {
      return { nextAgent: 'FAQ', reason: 'low_confidence' };
    }
    
    const agentMapping = {
      'balance_inquiry': 'Account',
      'card_services': 'Card', 
      'loan_services': 'Loan',
      'investment_advice': 'Investment',
      'fraud_report': 'Fraud',
      'general_inquiry': 'FAQ'
    };
    
    return { nextAgent: agentMapping[intent], confidence };
  }
  
  private async classifyIntent(message: string): Promise<string> {
    const prompt = `Classify this banking query intent: "${message}"`;
    return await this.llmClient.classify(prompt, this.intentLabels);
  }
}

// Memory Agent for context management
class MemoryAgent implements Agent {
  private contextStore: Map<string, ConversationContext> = new Map();
  
  async updateContext(sessionId: string, message: Message, agentResponse: AgentResponse): Promise<void> {
    const context = this.contextStore.get(sessionId) || { 
      messages: [], 
      extractedEntities: {},
      customerPreferences: {}
    };
    
    context.messages.push(message);
    context.extractedEntities = { ...context.extractedEntities, ...agentResponse.entities };
    this.contextStore.set(sessionId, context);
    
    // Persist to database for long-term storage
    await this.persistContext(sessionId, context);
  }
  
  async getContext(sessionId: string): Promise<ConversationContext | null> {
    return this.contextStore.get(sessionId) || await this.loadContext(sessionId);
  }
}
```
### Specialized Agent Implementations

```typescript
// Card Agent for card-related services
class CardAgent implements Agent {
  async processCardRequest(state: AgentState, request: CardRequest): Promise<CardResponse> {
    const { action, cardId, customerId } = request;
    
    switch (action) {
      case 'block_card':
        return await this.blockCard(cardId, request.reason);
      case 'report_lost':
        return await this.reportLostCard(cardId, customerId);
      case 'get_analytics':
        return await this.getCardAnalytics(cardId);
      default:
        return { success: false, error: 'Unknown card action' };
    }
  }
  
  private async blockCard(cardId: string, reason: string): Promise<CardResponse> {
    await this.cardService.updateCardStatus(cardId, 'blocked');
    await this.notificationService.sendCardBlockedNotification(cardId);
    return { success: true, message: 'Card blocked successfully' };
  }
}

// Loan Agent for loan services
class LoanAgent implements Agent {
  async calculateEligibility(customerProfile: CustomerProfile, loanRequest: LoanRequest): Promise<EligibilityResult> {
    const creditScore = await this.creditService.getScore(customerProfile.customerId);
    const monthlyIncome = customerProfile.monthlyIncome;
    const existingObligations = await this.loanService.getExistingLoans(customerProfile.customerId);
    
    const eligibilityRules = {
      minCreditScore: 650,
      maxDebtToIncomeRatio: 0.4,
      minMonthlyIncome: 25000
    };
    
    const currentDebtRatio = existingObligations.reduce((sum, loan) => sum + loan.emiAmount, 0) / monthlyIncome;
    
    const eligible = creditScore >= eligibilityRules.minCreditScore &&
                    currentDebtRatio <= eligibilityRules.maxDebtToIncomeRatio &&
                    monthlyIncome >= eligibilityRules.minMonthlyIncome;
    
    const maxEligibleAmount = eligible ? 
      (monthlyIncome * 0.4 - existingObligations.reduce((sum, loan) => sum + loan.emiAmount, 0)) * 60 : 0;
    
    return { eligible, maxAmount: maxEligibleAmount, creditScore };
  }
  
  calculateEMI(principal: number, rate: number, tenure: number): EMICalculation {
    const monthlyRate = rate / (12 * 100);
    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenure) / 
                (Math.pow(1 + monthlyRate, tenure) - 1);
    
    return {
      emiAmount: Math.round(emi * 100) / 100,
      totalInterest: Math.round((emi * tenure - principal) * 100) / 100,
      totalAmount: Math.round(emi * tenure * 100) / 100
    };
  }
}

// Fraud Agent for fraud detection
class FraudAgent implements Agent {
  async analyzeTransaction(transaction: Transaction, customerProfile: CustomerProfile): Promise<FraudAnalysis> {
    const riskFactors = await this.calculateRiskFactors(transaction, customerProfile);
    const riskScore = this.aggregateRiskScore(riskFactors);
    
    if (riskScore > 80) {
      await this.generateFraudAlert(transaction, riskScore, riskFactors);
      await this.blockSuspiciousCard(transaction.cardId);
    }
    
    return { riskScore, riskFactors, action: riskScore > 80 ? 'block' : 'allow' };
  }
  
  private async calculateRiskFactors(transaction: Transaction, profile: CustomerProfile): Promise<RiskFactor[]> {
    const factors: RiskFactor[] = [];
    
    // Amount-based risk
    if (transaction.amount > profile.averageTransactionAmount * 5) {
      factors.push({ type: 'unusual_amount', score: 30 });
    }
    
    // Location-based risk (simulated)
    if (transaction.merchantLocation !== profile.usualLocation) {
      factors.push({ type: 'unusual_location', score: 25 });
    }
    
    // Time-based risk
    const transactionHour = new Date(transaction.transactionDate).getHours();
    if (transactionHour < 6 || transactionHour > 23) {
      factors.push({ type: 'unusual_time', score: 15 });
    }
    
    // Frequency-based risk
    const recentTransactions = await this.getRecentTransactions(transaction.cardId, 24);
    if (recentTransactions.length > 10) {
      factors.push({ type: 'high_frequency', score: 40 });
    }
    
    return factors;
  }
}
```
## Frontend Architecture

### Customer Portal Architecture

```typescript
// React component structure
interface CustomerPortalStructure {
  App: MainApplication;
  Layout: {
    Header: NavigationHeader;
    Sidebar: QuickActionsSidebar;
    Main: MainContent;
    Footer: ApplicationFooter;
  };
  Pages: {
    Dashboard: AccountOverviewPage;
    Transactions: TransactionHistoryPage;
    Cards: CardManagementPage;
    Loans: LoanServicesPage;
    Investments: InvestmentPortalPage;
    Profile: CustomerProfilePage;
    Support: AIAssistantPage;
  };
}

// State management with React Query and Context
interface GlobalState {
  auth: AuthenticationState;
  customer: CustomerProfile;
  accounts: Account[];
  notifications: Notification[];
  chat: ChatSession;
}

// Authentication context
const AuthContext = createContext<AuthState>();

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  customer: CustomerProfile | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

// AI Chat component
const AIAssistant: React.FC = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  
  const sendMessage = useMutation(
    (message: string) => chatAPI.sendMessage(sessionId!, message),
    {
      onSuccess: (response) => {
        setMessages(prev => [...prev, 
          { type: 'user', content: message, timestamp: new Date() },
          { type: 'assistant', content: response.response, timestamp: new Date() }
        ]);
      }
    }
  );
  
  const handleVoiceInput = async (audioBlob: Blob) => {
    const response = await chatAPI.processVoice(audioBlob, sessionId!);
    setMessages(prev => [...prev,
      { type: 'user', content: response.transcription, timestamp: new Date() },
      { type: 'assistant', content: response.response, timestamp: new Date() }
    ]);
    
    // Play audio response
    if (response.audioResponse) {
      const audio = new Audio(URL.createObjectURL(response.audioResponse));
      audio.play();
    }
  };
  
  return (
    <div className="chat-container">
      <ChatHistory messages={messages} />
      <ChatInput onSendMessage={sendMessage.mutate} />
      <VoiceInput 
        isActive={isVoiceMode} 
        onVoiceInput={handleVoiceInput}
        onToggle={() => setIsVoiceMode(!isVoiceMode)}
      />
    </div>
  );
};
```

### Human Agent Portal Design

```typescript
// Human agent dashboard components
interface HumanAgentPortal {
  Dashboard: AgentDashboard;
  TicketQueue: EscalatedTicketsList;
  CustomerView: CustomerContextPanel;
  ChatInterface: AgentChatInterface;
  KnowledgeBase: AgentKnowledgePanel;
}

const AgentDashboard: React.FC = () => {
  const { data: tickets } = useQuery('escalated-tickets', ticketAPI.getEscalatedTickets);
  const { data: suggestions } = useQuery('ai-suggestions', aiAPI.getAgentSuggestions);
  
  return (
    <div className="agent-dashboard">
      <div className="ticket-queue">
        <h2>Escalated Cases</h2>
        {tickets?.map(ticket => (
          <TicketCard 
            key={ticket.ticketId}
            ticket={ticket}
            onAccept={() => handleAcceptTicket(ticket.ticketId)}
          />
        ))}
      </div>
      
      <div className="ai-suggestions">
        <h3>AI Suggestions</h3>
        {suggestions?.map(suggestion => (
          <SuggestionCard key={suggestion.id} suggestion={suggestion} />
        ))}
      </div>
    </div>
  );
};

const CustomerContextPanel: React.FC<{ customerId: string }> = ({ customerId }) => {
  const { data: customer } = useQuery(['customer', customerId], () => 
    customerAPI.getCustomerProfile(customerId)
  );
  const { data: history } = useQuery(['conversation-history', customerId], () =>
    chatAPI.getConversationHistory(customerId)
  );
  
  return (
    <div className="customer-context">
      <CustomerProfileSummary customer={customer} />
      <AccountsSummary accounts={customer?.accounts} />
      <ConversationHistory history={history} />
      <ComplaintHistory customerId={customerId} />
    </div>
  );
};
```
### Manager Dashboard Architecture

```typescript
// Analytics and reporting dashboard
interface ManagerDashboard {
  Overview: PerformanceOverview;
  Analytics: {
    AIPerformance: AgentPerformanceMetrics;
    CustomerSatisfaction: SatisfactionAnalytics;
    FraudDetection: FraudAnalyticsDashboard;
    BusinessMetrics: BusinessIntelligenceDashboard;
  };
  RealTime: {
    LiveActivity: RealTimeAgentActivity;
    AlertCenter: RealTimeAlerts;
    SystemHealth: SystemHealthMonitor;
  };
}

const PerformanceOverview: React.FC = () => {
  const { data: metrics } = useQuery('performance-metrics', analyticsAPI.getOverviewMetrics, {
    refetchInterval: 30000 // Update every 30 seconds
  });
  
  return (
    <div className="performance-overview">
      <MetricCard 
        title="AI Resolution Rate"
        value={metrics?.aiResolutionRate}
        trend={metrics?.resolutionTrend}
        target={85}
      />
      <MetricCard 
        title="Average Response Time"
        value={metrics?.avgResponseTime}
        unit="seconds"
        trend={metrics?.responseTrend}
      />
      <MetricCard 
        title="Customer Satisfaction"
        value={metrics?.customerSatisfaction}
        unit="score"
        trend={metrics?.satisfactionTrend}
      />
      <MetricCard 
        title="Fraud Detection Accuracy"
        value={metrics?.fraudAccuracy}
        trend={metrics?.fraudTrend}
      />
    </div>
  );
};

const RealTimeAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  
  useEffect(() => {
    const ws = new WebSocket(WS_ALERTS_URL);
    
    ws.onmessage = (event) => {
      const alert = JSON.parse(event.data);
      setAlerts(prev => [alert, ...prev.slice(0, 9)]); // Keep last 10 alerts
    };
    
    return () => ws.close();
  }, []);
  
  return (
    <div className="real-time-alerts">
      <h3>Live Alerts</h3>
      {alerts.map(alert => (
        <AlertItem 
          key={alert.id}
          alert={alert}
          onAcknowledge={() => handleAcknowledgeAlert(alert.id)}
        />
      ))}
    </div>
  );
};
```

## Security Implementation

### Authentication and Authorization

```typescript
// JWT token management
interface SecurityImplementation {
  Authentication: JWTAuthenticationService;
  Authorization: RoleBasedAccessControl;
  Encryption: DataEncryptionService;
  Audit: SecurityAuditService;
}

class JWTAuthenticationService {
  private readonly SECRET_KEY = process.env.JWT_SECRET!;
  private readonly REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
  
  generateTokens(customer: CustomerProfile): TokenPair {
    const accessToken = jwt.sign(
      { 
        customerId: customer.customerId,
        email: customer.email,
        role: 'customer'
      },
      this.SECRET_KEY,
      { expiresIn: '15m' }
    );
    
    const refreshToken = jwt.sign(
      { customerId: customer.customerId },
      this.REFRESH_SECRET,
      { expiresIn: '7d' }
    );
    
    return { accessToken, refreshToken };
  }
  
  validateToken(token: string): CustomerPayload | null {
    try {
      return jwt.verify(token, this.SECRET_KEY) as CustomerPayload;
    } catch (error) {
      return null;
    }
  }
  
  async refreshAccessToken(refreshToken: string): Promise<string | null> {
    try {
      const payload = jwt.verify(refreshToken, this.REFRESH_SECRET) as { customerId: string };
      const customer = await this.customerService.getById(payload.customerId);
      
      if (!customer) return null;
      
      return this.generateTokens(customer).accessToken;
    } catch (error) {
      return null;
    }
  }
}

// Role-based access control middleware
const authorize = (requiredRole: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { role } = req.user;
    
    if (role !== requiredRole) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

// Data masking for sensitive information
class DataMaskingService {
  maskAccountNumber(accountNumber: string): string {
    return accountNumber.slice(0, 4) + '*'.repeat(8) + accountNumber.slice(-4);
  }
  
  maskCardNumber(cardNumber: string): string {
    return cardNumber.slice(0, 4) + ' **** **** ' + cardNumber.slice(-4);
  }
  
  maskPhoneNumber(phoneNumber: string): string {
    return phoneNumber.slice(0, 2) + '*'.repeat(6) + phoneNumber.slice(-2);
  }
  
  sanitizeLogData(data: any): any {
    const sensitiveFields = ['password', 'pin', 'cvv', 'ssn', 'panNumber'];
    const sanitized = { ...data };
    
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }
}
```
### Data Encryption and Security

```typescript
// Encryption service for sensitive data
class EncryptionService {
  private readonly ALGORITHM = 'aes-256-gcm';
  private readonly KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'base64');
  
  encrypt(text: string): EncryptedData {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.ALGORITHM, this.KEY);
    cipher.setAAD(Buffer.from('ArthaMind', 'utf8'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }
  
  decrypt(encryptedData: EncryptedData): string {
    const decipher = crypto.createDecipher(this.ALGORITHM, this.KEY);
    decipher.setAAD(Buffer.from('ArthaMind', 'utf8'));
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}

// Password hashing service
class PasswordService {
  private readonly SALT_ROUNDS = 12;
  
  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.SALT_ROUNDS);
  }
  
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
  
  generateSecurePin(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }
}

// Security audit logging
class SecurityAuditService {
  async logAuthenticationAttempt(email: string, success: boolean, ipAddress: string): Promise<void> {
    await this.auditRepository.create({
      eventType: 'authentication_attempt',
      userId: email,
      success,
      metadata: { ipAddress },
      timestamp: new Date()
    });
  }
  
  async logDataAccess(customerId: string, resource: string, action: string): Promise<void> {
    await this.auditRepository.create({
      eventType: 'data_access',
      userId: customerId,
      resource,
      action,
      timestamp: new Date()
    });
  }
  
  async logFraudAlert(alertId: string, customerId: string, riskScore: number): Promise<void> {
    await this.auditRepository.create({
      eventType: 'fraud_alert',
      alertId,
      userId: customerId,
      metadata: { riskScore },
      timestamp: new Date()
    });
  }
}
```

## Integration Patterns

### RAG System Integration with ChromaDB

```typescript
// Knowledge base management with ChromaDB
class KnowledgeBaseService {
  private chromaClient: ChromaApi;
  private collection: Collection;
  
  constructor() {
    this.chromaClient = new ChromaApi();
    this.initializeCollection();
  }
  
  private async initializeCollection(): Promise<void> {
    this.collection = await this.chromaClient.getOrCreateCollection({
      name: 'banking_knowledge',
      embeddingFunction: new OpenAIEmbeddingFunction({
        openai_api_key: process.env.OPENAI_API_KEY
      })
    });
  }
  
  async indexDocument(document: BankingDocument): Promise<void> {
    const chunks = this.chunkDocument(document.content);
    
    for (const chunk of chunks) {
      await this.collection.add({
        documents: [chunk.text],
        metadatas: [{
          documentId: document.id,
          documentType: document.type,
          section: chunk.section,
          lastUpdated: document.lastUpdated
        }],
        ids: [`${document.id}_${chunk.index}`]
      });
    }
  }
  
  async queryKnowledge(question: string, context?: string): Promise<KnowledgeResult[]> {
    const results = await this.collection.query({
      queryTexts: [question],
      nResults: 5,
      whereDocument: context ? { $contains: context } : undefined
    });
    
    return results.documents[0].map((doc, index) => ({
      content: doc,
      metadata: results.metadatas[0][index],
      relevanceScore: results.distances[0][index]
    }));
  }
  
  private chunkDocument(content: string): DocumentChunk[] {
    // Implement intelligent document chunking
    const sentences = content.split(/[.!?]+/);
    const chunks: DocumentChunk[] = [];
    let currentChunk = '';
    let chunkIndex = 0;
    
    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > 1000) {
        chunks.push({
          text: currentChunk.trim(),
          index: chunkIndex++,
          section: this.extractSection(currentChunk)
        });
        currentChunk = sentence;
      } else {
        currentChunk += sentence + '.';
      }
    }
    
    if (currentChunk.length > 0) {
      chunks.push({
        text: currentChunk.trim(),
        index: chunkIndex,
        section: this.extractSection(currentChunk)
      });
    }
    
    return chunks;
  }
}
```
### Event-Driven Communication

```typescript
// Event bus for microservices communication
class EventBus {
  private redis: Redis.Redis;
  private subscribers: Map<string, EventHandler[]> = new Map();
  
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
  }
  
  async publish(eventType: string, payload: any): Promise<void> {
    const event: DomainEvent = {
      id: uuidv4(),
      type: eventType,
      payload,
      timestamp: new Date(),
      source: process.env.SERVICE_NAME
    };
    
    await this.redis.publish(eventType, JSON.stringify(event));
  }
  
  subscribe(eventType: string, handler: EventHandler): void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
      this.redis.subscribe(eventType);
    }
    
    this.subscribers.get(eventType)!.push(handler);
  }
  
  private setupEventHandlers(): void {
    this.redis.on('message', async (channel, message) => {
      const event: DomainEvent = JSON.parse(message);
      const handlers = this.subscribers.get(channel) || [];
      
      for (const handler of handlers) {
        try {
          await handler(event);
        } catch (error) {
          console.error(`Event handler failed for ${channel}:`, error);
        }
      }
    });
  }
}

// Domain events for banking operations
interface BankingEvents {
  'customer.authenticated': { customerId: string; sessionId: string };
  'transaction.created': { transactionId: string; accountId: string; amount: number };
  'card.blocked': { cardId: string; customerId: string; reason: string };
  'loan.applied': { applicationId: string; customerId: string; amount: number };
  'fraud.detected': { alertId: string; customerId: string; riskScore: number };
  'human.escalated': { ticketId: string; customerId: string; reason: string };
}

// Event handlers for different services
class NotificationEventHandler {
  constructor(private notificationService: NotificationService) {}
  
  @EventHandler('transaction.created')
  async handleTransactionCreated(event: DomainEvent<BankingEvents['transaction.created']>): Promise<void> {
    const { transactionId, accountId, amount } = event.payload;
    
    if (amount > 50000) {
      await this.notificationService.sendHighValueTransactionAlert(accountId, transactionId, amount);
    }
  }
  
  @EventHandler('fraud.detected')
  async handleFraudDetected(event: DomainEvent<BankingEvents['fraud.detected']>): Promise<void> {
    const { alertId, customerId, riskScore } = event.payload;
    
    await this.notificationService.sendFraudAlert(customerId, alertId, riskScore);
    
    if (riskScore > 90) {
      await this.notificationService.notifyRiskTeam(alertId, customerId);
    }
  }
}
```

## Voice Processing Integration

```typescript
// Voice banking service implementation
class VoiceBankingService {
  private speechToText: SpeechToTextService;
  private textToSpeech: TextToSpeechService;
  private nlpProcessor: NLPProcessor;
  
  constructor() {
    this.speechToText = new AzureSpeechToTextService();
    this.textToSpeech = new AzureTextToSpeechService();
    this.nlpProcessor = new BankingNLPProcessor();
  }
  
  async processVoiceInput(audioBlob: Buffer, sessionId: string): Promise<VoiceResponse> {
    // Convert speech to text
    const transcription = await this.speechToText.transcribe(audioBlob);
    
    // Process banking command
    const intent = await this.nlpProcessor.extractIntent(transcription);
    const entities = await this.nlpProcessor.extractEntities(transcription);
    
    // Route to appropriate agent
    const agentResponse = await this.routeToAgent(intent, entities, sessionId);
    
    // Convert response to speech
    const audioResponse = await this.textToSpeech.synthesize(agentResponse.text);
    
    return {
      transcription,
      responseText: agentResponse.text,
      audioResponse,
      confidence: agentResponse.confidence,
      intent,
      entities
    };
  }
  
  private async routeToAgent(intent: string, entities: any, sessionId: string): Promise<AgentResponse> {
    const voiceCommands = {
      'check_balance': async () => this.handleBalanceInquiry(entities, sessionId),
      'transfer_money': async () => this.handleMoneyTransfer(entities, sessionId),
      'block_card': async () => this.handleCardBlocking(entities, sessionId),
      'loan_inquiry': async () => this.handleLoanInquiry(entities, sessionId)
    };
    
    const handler = voiceCommands[intent];
    return handler ? await handler() : { text: 'I did not understand that. Could you please repeat?', confidence: 0 };
  }
  
  private async handleBalanceInquiry(entities: any, sessionId: string): Promise<AgentResponse> {
    const customer = await this.getCustomerFromSession(sessionId);
    const accounts = await this.accountService.getCustomerAccounts(customer.customerId);
    
    if (accounts.length === 1) {
      const balance = accounts[0].balance;
      return {
        text: `Your account balance is ${balance} rupees.`,
        confidence: 0.95
      };
    } else {
      return {
        text: `You have ${accounts.length} accounts. Which account balance would you like to check?`,
        confidence: 0.90
      };
    }
  }
}
```
## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Authentication Session Creation
*For any* valid demo credentials provided by a customer, the authentication service SHALL create a secure session with valid JWT tokens
**Validates: Requirements 1.1**

### Property 2: Invalid Credential Rejection
*For any* invalid credentials (wrong password, non-existent user, etc.), the authentication service SHALL reject the login attempt and maintain system security
**Validates: Requirements 1.2**

### Property 3: JWT Token State Consistency
*For any* active customer session, the JWT token SHALL maintain valid authentication state across all system requests
**Validates: Requirements 1.3**

### Property 4: Intent Classification Accuracy
*For any* customer query, the Router Agent SHALL classify the banking intent with at least 90% accuracy
**Validates: Requirements 2.2, 13.1**

### Property 5: Conversation Context Preservation
*For any* multi-turn conversation, the Memory Agent SHALL maintain conversation context across agent handoffs within the same session
**Validates: Requirements 2.3, 13.3**

### Property 6: AI Response Time Performance
*For any* customer query, the AI Banking Assistant SHALL provide responses within 3 seconds
**Validates: Requirements 2.5**

### Property 7: Account Data Completeness
*For any* customer accessing account overview, the system SHALL display current balances for all linked accounts
**Validates: Requirements 3.1**

### Property 8: Transaction Data Integrity
*For any* transaction history request, the system SHALL show transactions with all required fields (date, amount, description, balance)
**Validates: Requirements 3.2**

### Property 9: Account Number Security Masking
*For any* account number displayed, the system SHALL mask the number showing only the last 4 digits
**Validates: Requirements 3.4**

### Property 10: Data Retrieval Performance
*For any* transaction data request, the system SHALL retrieve information from simulated data within 2 seconds
**Validates: Requirements 3.5**

### Property 11: Card Display Security
*For any* customer viewing their cards, the system SHALL display all active cards with properly masked card numbers
**Validates: Requirements 4.1**

### Property 12: Card Blocking Confirmation
*For any* card blocking request, the Card Agent SHALL immediately block the card and send confirmation
**Validates: Requirements 4.2**

### Property 13: EMI Calculation Accuracy
*For any* loan parameters (amount, interest rate, tenure), the EMI calculator SHALL compute mathematically correct monthly payments
**Validates: Requirements 5.3**

### Property 14: Loan Eligibility Calculation
*For any* customer financial profile, the Loan Agent SHALL calculate eligibility based on income, credit score, and existing obligations
**Validates: Requirements 5.1**

### Property 15: Fixed Deposit Maturity Calculation
*For any* FD parameters (amount, rate, tenure), the Investment Agent SHALL calculate correct maturity amount and confirmation
**Validates: Requirements 6.2**

### Property 16: Speech Processing Pipeline
*For any* voice command input, the system SHALL convert speech to text and process the banking request correctly
**Validates: Requirements 7.2**

### Property 17: Voice Command Recognition
*For any* common banking voice commands, the system SHALL correctly recognize and process balance inquiry and transaction history requests
**Validates: Requirements 7.4**

### Property 18: Document Format Validation
*For any* document upload, the system SHALL accept PDF, JPG, and PNG formats while rejecting other formats
**Validates: Requirements 8.1**

### Property 19: OCR Text Extraction
*For any* uploaded document with text content, the OCR system SHALL extract text content accurately
**Validates: Requirements 8.2**

### Property 20: Escalation Context Transfer
*For any* escalated case, the Human Agent Portal SHALL display complete conversation history and customer context
**Validates: Requirements 9.1**

### Property 21: Fraud Alert Generation
*For any* suspicious transaction pattern detected, the Fraud Agent SHALL generate a fraud alert immediately
**Validates: Requirements 10.1**

### Property 22: Fraud Detection Analysis
*For any* transaction, the Fraud Agent SHALL analyze amounts, frequency, and merchant patterns to identify anomalies
**Validates: Requirements 10.3**

### Property 23: Multi-Channel Notification Delivery
*For any* important account event, the system SHALL send notifications through multiple channels (email, SMS, in-app)
**Validates: Requirements 12.1, 12.2**

### Property 24: Notification Preference Application
*For any* customer notification preference configuration, the system SHALL save and apply preferences correctly
**Validates: Requirements 12.3**

### Property 25: Agent Transfer Logic
*For any* query requiring specialized handling, the system SHALL seamlessly transfer to an appropriate specialized agent
**Validates: Requirements 13.4**

### Property 26: Data Encryption Compliance
*For any* customer data operation, the system SHALL encrypt all data both in transit and at rest
**Validates: Requirements 14.1**

### Property 27: Authorization Validation
*For any* customer information access request, the system SHALL validate user authorization levels correctly
**Validates: Requirements 14.2**

### Property 28: Sensitive Data Masking
*For any* logging or audit trail operation, the system SHALL mask sensitive information properly
**Validates: Requirements 14.3**

### Property 29: Knowledge Retrieval Performance
*For any* FAQ query, the system SHALL retrieve relevant information from the knowledge base within 1 second
**Validates: Requirements 15.3**

### Property 30: Document Indexing Automation
*For any* new banking document added to the system, the system SHALL automatically index it for RAG retrieval
**Validates: Requirements 15.4**

### Property 31: Source Attribution Completeness
*For any* knowledge-based response, the system SHALL provide proper source attribution
**Validates: Requirements 15.5**

## Error Handling and Edge Cases

### Graceful Degradation Strategy
- **AI Agent Failure**: Automatic fallback to simpler rule-based responses
- **Database Unavailability**: Cached data serving with staleness indicators  
- **External Service Failure**: Queue requests for retry with user notification
- **Authentication Issues**: Secure logout with session cleanup

### Input Validation Framework
- **SQL Injection Prevention**: Parameterized queries and input sanitization
- **XSS Protection**: Content Security Policy and output encoding
- **Rate Limiting**: Request throttling per user and endpoint
- **File Upload Security**: Type validation, size limits, and virus scanning

### Performance Optimization
- **Database Query Optimization**: Proper indexing and query caching
- **API Response Caching**: Redis-based caching for frequently accessed data
- **Image Optimization**: Lazy loading and WebP format conversion
- **Bundle Optimization**: Code splitting and tree shaking for frontend

## Deployment Architecture

### Containerization Strategy
```yaml
# Docker composition for microservices
version: '3.8'
services:
  api-gateway:
    image: arthamind/api-gateway:latest
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
      - REDIS_URL=${REDIS_URL}
      
  customer-service:
    image: arthamind/customer-service:latest
    environment:
      - DATABASE_URL=${POSTGRES_URL}
      - REDIS_URL=${REDIS_URL}
      
  ai-orchestration:
    image: arthamind/ai-orchestration:latest
    environment:
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - CHROMADB_URL=${CHROMADB_URL}
      
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=arthamind
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
      
  chromadb:
    image: chromadb/chroma:latest
    ports:
      - "8000:8000"
    volumes:
      - chromadb_data:/chroma/chroma
```

### Monitoring and Observability
- **Application Metrics**: Prometheus and Grafana dashboards
- **Log Aggregation**: ELK stack for centralized logging
- **Error Tracking**: Sentry for error monitoring and alerting
- **Performance Monitoring**: New Relic for APM and user experience tracking
- **Health Checks**: Kubernetes liveness and readiness probes

This comprehensive technical design provides the foundation for implementing ArthaMind as a production-ready AI banking simulator with robust security, scalability, and maintainability features.