# Implementation Plan: ArthaMind AI Banking Simulator

## Overview

This implementation plan breaks down the ArthaMind AI Banking Simulator into 14 phases, providing a systematic approach to building the comprehensive AI-powered banking platform. Each task includes complexity estimates, acceptance criteria, and testing requirements to ensure quality delivery.

## Tasks

### Phase 1: Project Foundation

- [ ] 1.1 Set up project repository structure
  - Create monorepo structure with backend, frontend, and shared directories
  - Initialize TypeScript configuration for both backend and frontend
  - Set up ESLint, Prettier, and Husky for code quality
  - Create package.json files with required dependencies
  - _Requirements: System foundation for all components_
  - _Complexity: Medium_

- [ ] 1.2 Configure Docker containerization
  - Create Dockerfile for Node.js backend service
  - Create Dockerfile for React frontend application
  - Set up docker-compose.yml with PostgreSQL, Redis, and ChromaDB
  - Configure development and production Docker environments
  - _Requirements: Containerized deployment strategy_
  - _Complexity: Medium_

- [ ] 1.3 Set up environment configuration
  - Create environment variable templates for all services
  - Configure development, staging, and production environments
  - Set up environment validation and error handling
  - Document environment setup process
  - _Requirements: Secure configuration management_
  - _Complexity: Small_

- [ ] 1.4 Initialize CI/CD pipeline
  - Set up GitHub Actions workflows for automated testing
  - Configure build pipelines for backend and frontend
  - Set up code quality checks and security scanning
  - Create deployment automation scripts
  - _Requirements: Automated deployment and quality assurance_
  - _Complexity: Large_

- [ ] 1.5 Create backend service scaffolding
  - Initialize Express.js application with TypeScript
  - Set up basic routing structure with middleware
  - Configure CORS, helmet, and security middleware
  - Create health check endpoints
  - _Requirements: 4.1, 14.1 (API Foundation and Security)_
  - _Complexity: Medium_

- [ ] 1.6 Create frontend application scaffolding
  - Initialize React application with TypeScript and Vite
  - Set up Tailwind CSS and component library structure
  - Configure React Query for state management
  - Create basic routing with React Router
  - _Requirements: Customer Portal foundation_
  - _Complexity: Medium_

- [ ]* 1.7 Write foundation integration tests
  - Test Docker container orchestration
  - Verify environment configuration loading
  - Test CI/CD pipeline functionality
  - _Requirements: System reliability_

### Phase 2: Authentication & Database

- [ ] 2.1 Set up PostgreSQL database and models
  - Create database schema with all required tables
  - Set up Prisma ORM with type-safe database models
  - Implement database migrations and seeding
  - Add database indexes for performance optimization
  - _Requirements: 1.1, 3.1, 14.2 (Authentication, Account Management, Data Security)_
  - _Complexity: Large_

- [ ] 2.2 Implement JWT authentication system
  - Create JWT token generation and validation services
  - Implement refresh token rotation mechanism
  - Set up authentication middleware for protected routes
  - Add password hashing with bcrypt
  - _Requirements: 1.1, 1.3, 14.1 (Customer Authentication, Session Management, Security)_
  - _Complexity: Large_

- [ ] 2.3 Create demo login functionality
  - Implement pre-configured demo customer accounts
  - Create demo login endpoint with validation
  - Set up demo data seeding for realistic banking scenarios
  - Add demo account session management
  - _Requirements: 1.5 (Demo Login Support)_
  - _Complexity: Medium_

- [ ] 2.4 Seed simulated banking data
  - Generate realistic customer profiles and account data
  - Create transaction history with varied patterns
  - Set up loan, card, and investment simulation data
  - Implement fraud scenario data for testing
  - _Requirements: All banking operations require simulated data_
  - _Complexity: Large_

- [ ]* 2.5 Write authentication and database tests
  - Test JWT token lifecycle and security
  - Verify database model relationships and constraints
  - Test demo login functionality
  - Validate data seeding accuracy
  - _Requirements: 1.1, 14.1_

### Phase 3: Banking Simulator

- [ ] 3.1 Implement customer account management
  - Create customer profile service with CRUD operations
  - Implement account balance tracking and updates
  - Add account linking and management functionality
  - Set up customer preference management
  - _Requirements: 3.1, 3.2, 3.4 (Account Overview, Transaction Management, Security)_
  - _Complexity: Large_

- [ ] 3.2 Build transaction processing system
  - Create transaction service with type validation
  - Implement transaction history with filtering capabilities
  - Add transaction categorization and analytics
  - Set up real-time balance updates
  - _Requirements: 3.1, 3.2, 3.5 (Account Management, Transaction History, Data Retrieval)_
  - _Complexity: Large_

- [ ] 3.3 Develop card management services
  - Implement card creation, blocking, and replacement
  - Create card usage analytics and reporting
  - Add card transaction monitoring
  - Set up card security features and validation
  - _Requirements: 4.1, 4.2, 4.3, 4.4 (Card Display, Blocking, Lost Reporting, Analytics)_
  - _Complexity: Large_

- [ ] 3.4 Create loan and EMI management
  - Build loan eligibility calculation engine
  - Implement loan application processing workflow
  - Create EMI calculator with amortization schedules
  - Set up loan monitoring and notifications
  - _Requirements: 5.1, 5.2, 5.3, 5.4 (Loan Eligibility, Applications, EMI Calculator, Management)_
  - _Complexity: Large_

- [ ] 3.5 Build fixed deposit and investment services
  - Create fixed deposit calculation and creation
  - Implement investment recommendation engine
  - Add maturity tracking and renewal options
  - Set up investment portfolio management
  - _Requirements: 6.1, 6.2, 6.3, 6.4 (Fixed Deposits, Investment Advice, Portfolio Management)_
  - _Complexity: Large_

- [ ] 3.6 Implement complaint and notification system
  - Create complaint ticket management system
  - Build multi-channel notification service
  - Implement notification preferences and tracking
  - Add complaint resolution workflow
  - _Requirements: 12.1, 12.2, 12.3, 12.4 (Notification System)_
  - _Complexity: Medium_

- [ ]* 3.7 Write banking simulator integration tests
  - Test account management operations
  - Verify transaction processing accuracy
  - Test card and loan services
  - Validate notification delivery
  - _Requirements: All banking services_

### Phase 4: Backend APIs

- [ ] 4.1 Create authentication API endpoints
  - Implement login, logout, and token refresh endpoints
  - Add demo login and session management APIs
  - Create password reset and profile update endpoints
  - Set up API rate limiting and security headers
  - _Requirements: 1.1, 1.2, 1.3, 1.4 (Authentication and Session Management)_
  - _Complexity: Medium_

- [ ] 4.2 Build customer service REST APIs
  - Create account management API endpoints
  - Implement transaction history and filtering APIs
  - Add card management operation endpoints
  - Set up customer profile and preference APIs
  - _Requirements: 3.1, 3.2, 4.1, 4.2, 4.3 (Account and Card Management)_
  - _Complexity: Large_

- [ ] 4.3 Develop loan and investment APIs
  - Create loan eligibility and application endpoints
  - Implement EMI calculator and schedule APIs
  - Add fixed deposit creation and management endpoints
  - Set up investment recommendation APIs
  - _Requirements: 5.1, 5.2, 5.3, 6.1, 6.2 (Loan and Investment Services)_
  - _Complexity: Large_

- [ ] 4.4 Implement validation and error handling
  - Add comprehensive input validation middleware
  - Create standardized error response formats
  - Implement request logging and audit trails
  - Set up API documentation with OpenAPI/Swagger
  - _Requirements: 14.1, 14.3 (Security and Data Protection)_
  - _Complexity: Medium_

- [ ]* 4.5 Write API endpoint tests
  - Test all authentication endpoints
  - Verify customer service API responses
  - Test loan and investment API functionality
  - Validate error handling and edge cases
  - _Requirements: All API endpoints_

### Phase 5: AI Framework

- [ ] 5.1 Set up LangGraph multi-agent architecture
  - Initialize LangGraph workflow engine
  - Create base agent interface and state management
  - Set up agent communication and coordination
  - Implement workflow monitoring and logging
  - _Requirements: 13.1, 13.2, 13.4 (Multi-Agent Architecture)_
  - _Complexity: Large_

- [ ] 5.2 Integrate Gemini 2.5 Flash LLM
  - Set up Gemini API integration and authentication
  - Create LLM service wrapper with error handling
  - Implement prompt templates and response parsing
  - Add rate limiting and retry mechanisms
  - _Requirements: 2.2 (AI Banking Assistant Integration)_
  - _Complexity: Large_

- [ ] 5.3 Implement Router Agent
  - Create intent classification service
  - Build confidence scoring and routing logic
  - Set up fallback mechanisms for low confidence
  - Add intent classification model training data
  - _Requirements: 2.2, 13.1 (Intent Analysis and Routing)_
  - _Complexity: Large_

- [ ] 5.4 Build Memory Agent
  - Implement conversation context management
  - Create customer preference learning system
  - Set up session state persistence
  - Add context retrieval and injection
  - _Requirements: 2.3, 13.3 (Context Management)_
  - _Complexity: Large_

- [ ]* 5.5 Write AI framework integration tests
  - Test LangGraph workflow execution
  - Verify Gemini LLM integration
  - Test Router Agent intent classification
  - Validate Memory Agent context management
  - _Requirements: 2.2, 13.1_

### Phase 6: Specialized AI Agents

- [ ] 6.1 Implement FAQ Agent
  - Create knowledge base query system
  - Build FAQ response generation
  - Add fallback to knowledge search
  - Implement response confidence scoring
  - _Requirements: 2.2, 15.3 (General Inquiries and Knowledge Retrieval)_
  - _Complexity: Large_

- [ ] 6.2 Build Card Agent
  - Implement card operation request processing
  - Create card analytics generation
  - Add card security validation logic
  - Set up card transaction monitoring
  - _Requirements: 4.1, 4.2, 4.3, 4.4 (Card Services)_
  - _Complexity: Large_

- [ ] 6.3 Develop Loan Agent
  - Create loan eligibility assessment logic
  - Implement EMI calculation with explanations
  - Build loan application guidance system
  - Add loan status monitoring and alerts
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5 (Loan Services)_
  - _Complexity: Large_

- [ ] 6.4 Implement Fraud Agent
  - Build transaction anomaly detection
  - Create fraud alert generation system
  - Implement risk scoring algorithms
  - Add automated response triggers
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5 (Fraud Detection)_
  - _Complexity: Large_

- [ ] 6.5 Create Investment Agent
  - Implement investment recommendation logic
  - Build fixed deposit advisory system
  - Create portfolio analysis capabilities
  - Add investment education responses
  - _Requirements: 6.1, 6.2, 6.3, 6.5 (Investment Services)_
  - _Complexity: Large_

- [ ] 6.6 Build Human Handoff Agent
  - Create escalation decision logic
  - Implement context transfer to human agents
  - Set up ticket creation and routing
  - Add escalation tracking and analytics
  - _Requirements: 2.4, 9.1 (Human Escalation)_
  - _Complexity: Medium_

- [ ]* 6.7 Write specialized agent tests
  - Test FAQ Agent knowledge retrieval
  - Verify Card Agent operation handling
  - Test Loan Agent calculations and advice
  - Validate Fraud Agent detection accuracy
  - Test Investment Agent recommendations
  - Test Human Handoff Agent escalation
  - _Requirements: All specialized agent functions_

### Phase 7: RAG (Retrieval-Augmented Generation)

- [ ] 7.1 Set up ChromaDB vector database
  - Initialize ChromaDB instance and collections
  - Configure vector embedding models
  - Set up database persistence and backup
  - Implement collection management APIs
  - _Requirements: 15.1, 15.2 (Knowledge Management)_
  - _Complexity: Large_

- [ ] 7.2 Implement document ingestion pipeline
  - Create document parsing and chunking system
  - Build vector embedding generation service
  - Implement document metadata extraction
  - Set up batch processing for knowledge updates
  - _Requirements: 15.4 (Knowledge Base Updates)_
  - _Complexity: Large_

- [ ] 7.3 Build retrieval and ranking system
  - Create similarity search with ChromaDB
  - Implement result ranking and filtering
  - Add context-aware retrieval logic
  - Set up retrieval performance optimization
  - _Requirements: 15.1, 15.3 (Knowledge Retrieval)_
  - _Complexity: Large_

- [ ] 7.4 Integrate RAG with AI agents
  - Connect FAQ Agent with knowledge retrieval
  - Add source attribution to responses
  - Implement relevance scoring for retrieved content
  - Set up real-time knowledge updates
  - _Requirements: 15.5 (Source Attribution)_
  - _Complexity: Medium_

- [ ]* 7.5 Write RAG system tests
  - Test document ingestion accuracy
  - Verify vector similarity search results
  - Test knowledge retrieval integration
  - Validate source attribution functionality
  - _Requirements: 15.1, 15.3, 15.5_

### Phase 8: Customer Portal

- [ ] 8.1 Build authentication UI components
  - Create login and demo login forms
  - Implement session management UI
  - Add password reset functionality
  - Build authentication state management
  - _Requirements: 1.1, 1.2, 1.5 (Customer Authentication)_
  - _Complexity: Medium_

- [ ] 8.2 Create dashboard and account overview
  - Build account balance and summary dashboard
  - Implement account switching and navigation
  - Create quick action buttons and shortcuts
  - Add responsive design for mobile devices
  - _Requirements: 3.1, 3.4 (Account Overview)_
  - _Complexity: Large_

- [ ] 8.3 Implement AI chat interface
  - Create conversational chat UI components
  - Build message history and context display
  - Add typing indicators and response animations
  - Implement chat session management
  - _Requirements: 2.1, 2.2, 2.3 (AI Banking Assistant)_
  - _Complexity: Large_

- [ ] 8.4 Build banking operation pages
  - Create transaction history with filtering
  - Implement card management interface
  - Build loan and investment dashboards
  - Add operation confirmation dialogs
  - _Requirements: 3.2, 4.1, 5.4, 6.4 (Banking Operations)_
  - _Complexity: Large_

- [ ] 8.5 Create notification and alert system
  - Build notification center and preferences
  - Implement real-time notification display
  - Add notification history and management
  - Create alert prioritization and styling
  - _Requirements: 12.1, 12.3 (Notification System)_
  - _Complexity: Medium_

- [ ]* 8.6 Write customer portal UI tests
  - Test authentication flow and security
  - Verify dashboard functionality
  - Test chat interface interactions
  - Validate banking operation workflows
  - Test notification system
  - _Requirements: All customer portal features_

### Phase 9: Human Agent Dashboard

- [ ] 9.1 Create agent authentication and routing
  - Build agent login and role management
  - Implement agent availability tracking
  - Create case assignment and routing logic
  - Add agent performance tracking
  - _Requirements: 9.2, 9.5 (Human Agent Portal)_
  - _Complexity: Medium_

- [ ] 9.2 Build escalated case management
  - Create ticket queue and prioritization
  - Implement case details and history view
  - Build case assignment and transfer system
  - Add case resolution tracking
  - _Requirements: 9.1, 9.3 (Escalated Cases)_
  - _Complexity: Large_

- [ ] 9.3 Implement customer context panel
  - Create comprehensive customer profile view
  - Build conversation history display
  - Add account and transaction summaries
  - Implement complaint history tracking
  - _Requirements: 9.1, 9.4 (Customer Context)_
  - _Complexity: Large_

- [ ] 9.4 Create AI-assisted response system
  - Build suggested response generation
  - Implement response templates and shortcuts
  - Add knowledge base integration for agents
  - Create response quality scoring
  - _Requirements: 9.2 (AI Suggestions)_
  - _Complexity: Large_

- [ ]* 9.5 Write human agent dashboard tests
  - Test agent authentication and routing
  - Verify case management functionality
  - Test customer context accuracy
  - Validate AI assistance features
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

### Phase 10: Manager Dashboard

- [ ] 10.1 Build analytics data pipeline
  - Create real-time metrics collection system
  - Implement data aggregation and processing
  - Build analytics database with time-series data
  - Set up automated report generation
  - _Requirements: 11.1, 11.2 (Analytics and Reporting)_
  - _Complexity: Large_

- [ ] 10.2 Create performance monitoring dashboard
  - Build AI resolution rate tracking
  - Implement customer satisfaction metrics
  - Create agent performance analytics
  - Add system health monitoring
  - _Requirements: 11.1, 11.4 (Performance Monitoring)_
  - _Complexity: Large_

- [ ] 10.3 Implement real-time alert system
  - Create alert generation and routing
  - Build alert prioritization and escalation
  - Implement alert acknowledgment tracking
  - Add automated alert responses
  - _Requirements: 11.5 (Alert System)_
  - _Complexity: Medium_

- [ ] 10.4 Build business intelligence reports
  - Create customer behavior analytics
  - Implement fraud detection reporting
  - Build operational efficiency metrics
  - Add customizable dashboard widgets
  - _Requirements: 11.3 (Drill-down Analytics)_
  - _Complexity: Large_

- [ ]* 10.5 Write manager dashboard tests
  - Test analytics data accuracy
  - Verify real-time monitoring functionality
  - Test alert system reliability
  - Validate business intelligence reports
  - _Requirements: 11.1, 11.2, 11.4, 11.5_

### Phase 11: OCR & Voice Banking

- [ ] 11.1 Implement document upload system
  - Create file upload with validation
  - Build document type classification
  - Implement file processing queue
  - Add upload progress tracking
  - _Requirements: 8.1, 8.2 (Document Upload)_
  - _Complexity: Medium_

- [ ] 11.2 Build OCR processing engine
  - Integrate Tesseract OCR for text extraction
  - Create document layout analysis
  - Implement confidence scoring for extractions
  - Add structured data extraction templates
  - _Requirements: 8.2, 8.3 (OCR Processing)_
  - _Complexity: Large_

- [ ] 11.3 Create voice banking interface
  - Implement Web Speech API integration
  - Build voice command recognition
  - Create audio response generation
  - Add voice session management
  - _Requirements: 7.1, 7.2, 7.3, 7.4 (Voice Banking)_
  - _Complexity: Large_

- [ ] 11.4 Build document validation system
  - Create document authenticity checking
  - Implement data validation rules
  - Build approval workflow for extracted data
  - Add error handling for poor quality documents
  - _Requirements: 8.3, 8.5 (Document Validation)_
  - _Complexity: Medium_

- [ ]* 11.5 Write OCR and voice banking tests
  - Test document upload and processing
  - Verify OCR accuracy and validation
  - Test voice command recognition
  - Validate audio response generation
  - _Requirements: 7.1, 7.2, 8.1, 8.2, 8.3_

### Phase 12: Analytics & Monitoring

- [ ] 12.1 Implement system health monitoring
  - Create service health check endpoints
  - Build system performance metrics collection
  - Implement error tracking and alerting
  - Add resource utilization monitoring
  - _Requirements: System reliability and performance_
  - _Complexity: Medium_

- [ ] 12.2 Build fraud detection analytics
  - Create fraud pattern analysis system
  - Implement risk score tracking and trending
  - Build fraud alert investigation tools
  - Add fraud prevention effectiveness metrics
  - _Requirements: 10.1, 10.3, 10.4 (Fraud Detection Analytics)_
  - _Complexity: Large_

- [ ] 12.3 Create customer behavior analytics
  - Build user journey tracking and analysis
  - Implement feature usage statistics
  - Create customer satisfaction correlation analysis
  - Add predictive analytics for customer needs
  - _Requirements: 11.2, 11.3 (Customer Analytics)_
  - _Complexity: Large_

- [ ] 12.4 Implement AI performance monitoring
  - Create agent response time tracking
  - Build accuracy and confidence metrics
  - Implement conversation success rate analysis
  - Add A/B testing framework for AI improvements
  - _Requirements: 13.5 (Agent Performance Monitoring)_
  - _Complexity: Medium_

- [ ]* 12.5 Write analytics and monitoring tests
  - Test system health monitoring accuracy
  - Verify fraud detection analytics
  - Test customer behavior tracking
  - Validate AI performance metrics
  - _Requirements: All monitoring and analytics features_

### Phase 13: Testing

- [ ] 13.1 Create comprehensive unit test suite
  - Write unit tests for all service functions
  - Test database models and relationships
  - Create AI agent unit tests with mocked dependencies
  - Add authentication and security tests
  - _Requirements: Code quality and reliability_
  - _Complexity: Large_

- [ ] 13.2 Build integration test framework
  - Create API integration tests
  - Test multi-agent workflow integration
  - Build database integration tests
  - Add third-party service integration tests
  - _Requirements: System integration reliability_
  - _Complexity: Large_

- [ ] 13.3 Implement end-to-end testing
  - Create customer journey automated tests
  - Build agent dashboard functionality tests
  - Test manager dashboard and analytics
  - Add cross-browser and mobile testing
  - _Requirements: Complete system functionality_
  - _Complexity: Large_

- [ ] 13.4 Create performance and load testing
  - Build API load testing scenarios
  - Test AI agent performance under load
  - Create database performance benchmarks
  - Add system scalability testing
  - _Requirements: System performance and scalability_
  - _Complexity: Medium_

- [ ]* 13.5 Write security and penetration tests
  - Test authentication and authorization security
  - Verify data encryption and protection
  - Test for common security vulnerabilities
  - Add fraud detection system testing
  - _Requirements: 14.1, 14.2, 14.3 (Security)_

### Phase 14: Docker & Deployment

- [ ] 14.1 Optimize Docker configuration
  - Create multi-stage Docker builds for efficiency
  - Optimize container images for production
  - Set up health checks and restart policies
  - Configure container resource limits
  - _Requirements: Production deployment readiness_
  - _Complexity: Medium_

- [ ] 14.2 Create production deployment scripts
  - Build automated deployment pipelines
  - Create database migration scripts
  - Set up environment-specific configurations
  - Add rollback and recovery procedures
  - _Requirements: Reliable production deployment_
  - _Complexity: Large_

- [ ] 14.3 Configure monitoring and logging
  - Set up centralized logging system
  - Create application performance monitoring
  - Implement alerting for production issues
  - Add log retention and archival policies
  - _Requirements: Production monitoring and troubleshooting_
  - _Complexity: Medium_

- [ ] 14.4 Create backup and disaster recovery
  - Implement database backup automation
  - Create data recovery procedures
  - Set up service redundancy and failover
  - Add disaster recovery testing protocols
  - _Requirements: Data protection and business continuity_
  - _Complexity: Large_

- [ ] 14.5 Final system validation and documentation
  - Perform comprehensive system testing
  - Create deployment and operations documentation
  - Build troubleshooting guides
  - Add performance tuning documentation
  - _Requirements: Production readiness and maintainability_
  - _Complexity: Medium_

- [ ]* 14.6 Write deployment and operations tests
  - Test deployment automation scripts
  - Verify monitoring and alerting systems
  - Test backup and recovery procedures
  - Validate disaster recovery protocols
  - _Requirements: Production system reliability_

## Checkpoints

- [ ] Checkpoint 1: Complete Phase 1-2 (Foundation and Authentication)
  - Ensure all tests pass, ask the user if questions arise.

- [ ] Checkpoint 2: Complete Phase 3-4 (Banking Simulator and APIs)
  - Ensure all tests pass, ask the user if questions arise.

- [ ] Checkpoint 3: Complete Phase 5-6 (AI Framework and Agents)
  - Ensure all tests pass, ask the user if questions arise.

- [ ] Checkpoint 4: Complete Phase 7-8 (RAG and Customer Portal)
  - Ensure all tests pass, ask the user if questions arise.

- [ ] Checkpoint 5: Complete Phase 9-10 (Agent and Manager Dashboards)
  - Ensure all tests pass, ask the user if questions arise.

- [ ] Checkpoint 6: Complete Phase 11-12 (OCR, Voice Banking, Analytics)
  - Ensure all tests pass, ask the user if questions arise.

- [ ] Final Checkpoint: Complete Phase 13-14 (Testing and Deployment)
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional testing tasks that can be skipped for faster MVP development
- Each task includes complexity estimates (Small/Medium/Large) to help with planning and resource allocation
- Acceptance criteria reference specific requirements from the requirements document
- Tasks are designed to be independently testable with clear deliverables
- The implementation uses TypeScript throughout for type safety and better developer experience
- All banking operations use simulated data to ensure safe testing without real financial integrations
- The multi-agent AI architecture uses LangGraph for sophisticated workflow management
- Security and data protection measures are integrated throughout all phases
- Each phase includes comprehensive testing to ensure quality and reliability

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.3"] },
    { "id": 1, "tasks": ["1.2", "1.5", "1.6"] },
    { "id": 2, "tasks": ["1.4", "1.7", "2.1"] },
    { "id": 3, "tasks": ["2.2", "2.3", "2.4"] },
    { "id": 4, "tasks": ["2.5", "3.1", "3.6"] },
    { "id": 5, "tasks": ["3.2", "3.3", "4.1"] },
    { "id": 6, "tasks": ["3.4", "3.5", "4.2"] },
    { "id": 7, "tasks": ["3.7", "4.3", "4.4"] },
    { "id": 8, "tasks": ["4.5", "5.1"] },
    { "id": 9, "tasks": ["5.2", "5.3", "7.1"] },
    { "id": 10, "tasks": ["5.4", "5.5", "7.2"] },
    { "id": 11, "tasks": ["6.1", "6.2", "7.3"] },
    { "id": 12, "tasks": ["6.3", "6.4", "7.4"] },
    { "id": 13, "tasks": ["6.5", "6.6", "7.5"] },
    { "id": 14, "tasks": ["6.7", "8.1", "8.2"] },
    { "id": 15, "tasks": ["8.3", "8.4", "9.1"] },
    { "id": 16, "tasks": ["8.5", "8.6", "9.2"] },
    { "id": 17, "tasks": ["9.3", "9.4", "10.1"] },
    { "id": 18, "tasks": ["9.5", "10.2", "11.1"] },
    { "id": 19, "tasks": ["10.3", "10.4", "11.2"] },
    { "id": 20, "tasks": ["10.5", "11.3", "11.4"] },
    { "id": 21, "tasks": ["11.5", "12.1", "12.2"] },
    { "id": 22, "tasks": ["12.3", "12.4", "13.1"] },
    { "id": 23, "tasks": ["12.5", "13.2", "13.3"] },
    { "id": 24, "tasks": ["13.4", "13.5", "14.1"] },
    { "id": 25, "tasks": ["14.2", "14.3"] },
    { "id": 26, "tasks": ["14.4", "14.5"] },
    { "id": 27, "tasks": ["14.6"] }
  ]
}
```