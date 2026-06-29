export const DEMO_USERS = {
  customer: {
    id: 'c1',
    name: 'Priya Sharma',
    email: 'priya@demo.com',
    role: 'customer' as const,
    accountId: 'a1',
  },
  agent: {
    id: 'ag1',
    name: 'Ravi Kumar',
    email: 'ravi@sbi.com',
    role: 'agent' as const,
    accountId: '',
  },
  manager: {
    id: 'm1',
    name: 'Anita Verma',
    email: 'anita@sbi.com',
    role: 'manager' as const,
    accountId: '',
  },
};

export const ACCOUNTS = [
  {
    accountId: 'a1',
    accountNumber: 'XXXX XXXX 4521',
    type: 'Savings',
    balance: 142850.75,
    currency: 'INR',
    status: 'Active',
  },
  {
    accountId: 'a2',
    accountNumber: 'XXXX XXXX 8834',
    type: 'Current',
    balance: 58320.0,
    currency: 'INR',
    status: 'Active',
  },
];

export const TRANSACTIONS = [
  {
    id: 't1',
    type: 'debit',
    amount: 2500,
    desc: 'Amazon Shopping',
    date: '2026-06-27',
    cat: 'Shopping',
    balance: 142850,
  },
  {
    id: 't2',
    type: 'credit',
    amount: 85000,
    desc: 'Salary Credit',
    date: '2026-06-25',
    cat: 'Salary',
    balance: 145350,
  },
  {
    id: 't3',
    type: 'debit',
    amount: 1200,
    desc: 'Swiggy Food Order',
    date: '2026-06-24',
    cat: 'Food',
    balance: 60350,
  },
  {
    id: 't4',
    type: 'debit',
    amount: 15000,
    desc: 'EMI - Home Loan',
    date: '2026-06-20',
    cat: 'Loan',
    balance: 61550,
  },
  {
    id: 't5',
    type: 'credit',
    amount: 5000,
    desc: 'UPI Received - Arjun',
    date: '2026-06-19',
    cat: 'Transfer',
    balance: 76550,
  },
  {
    id: 't6',
    type: 'debit',
    amount: 3400,
    desc: 'Electricity Bill',
    date: '2026-06-18',
    cat: 'Utilities',
    balance: 71550,
  },
  {
    id: 't7',
    type: 'debit',
    amount: 800,
    desc: 'Netflix Subscription',
    date: '2026-06-15',
    cat: 'Entertainment',
    balance: 74950,
  },
  {
    id: 't8',
    type: 'credit',
    amount: 12000,
    desc: 'Freelance Payment',
    date: '2026-06-12',
    cat: 'Income',
    balance: 75750,
  },
  {
    id: 't9',
    type: 'debit',
    amount: 22000,
    desc: 'LIC Premium',
    date: '2026-06-10',
    cat: 'Insurance',
    balance: 63750,
  },
  {
    id: 't10',
    type: 'debit',
    amount: 600,
    desc: 'Zomato Order',
    date: '2026-06-08',
    cat: 'Food',
    balance: 85750,
  },
];

export const CARDS = [
  {
    cardId: 'card1',
    number: '**** **** **** 4521',
    type: 'Debit',
    status: 'Active',
    network: 'Visa',
    limit: null,
    expiryDate: '09/27',
  },
  {
    cardId: 'card2',
    number: '**** **** **** 7832',
    type: 'Credit',
    status: 'Active',
    network: 'Mastercard',
    limit: 150000,
    expiryDate: '12/26',
  },
];

export const LOANS = [
  {
    loanId: 'l1',
    type: 'Home Loan',
    principal: 3500000,
    outstanding: 2840000,
    emi: 28500,
    rate: 8.5,
    tenure: 240,
    paid: 48,
    nextDue: '2026-07-05',
  },
  {
    loanId: 'l2',
    type: 'Personal Loan',
    principal: 200000,
    outstanding: 95000,
    emi: 6200,
    rate: 12.5,
    tenure: 36,
    paid: 17,
    nextDue: '2026-07-10',
  },
];

export const FIXED_DEPOSITS = [
  {
    fdId: 'fd1',
    amount: 500000,
    rate: 7.1,
    tenure: 12,
    maturity: 535500,
    start: '2025-07-01',
    end: '2026-07-01',
    status: 'Active',
  },
  {
    fdId: 'fd2',
    amount: 200000,
    rate: 7.5,
    tenure: 24,
    maturity: 232500,
    start: '2024-06-15',
    end: '2026-06-15',
    status: 'Active',
  },
];

export const NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'EMI Due Reminder',
    msg: 'Home Loan EMI of ₹28,500 due on 5 Jul 2026',
    priority: 'high',
    read: false,
    time: '2h ago',
  },
  {
    id: 'n2',
    title: 'Transaction Alert',
    msg: '₹2,500 debited from account ending 4521',
    priority: 'medium',
    read: false,
    time: '5h ago',
  },
  {
    id: 'n3',
    title: 'FD Maturity Alert',
    msg: 'Your FD of ₹5,00,000 matures in 3 days',
    priority: 'high',
    read: false,
    time: '1d ago',
  },
  {
    id: 'n4',
    title: 'Salary Credited',
    msg: '₹85,000 credited to your savings account',
    priority: 'low',
    read: true,
    time: '2d ago',
  },
  {
    id: 'n5',
    title: 'Security Update',
    msg: 'Your account password was changed successfully',
    priority: 'medium',
    read: true,
    time: '3d ago',
  },
];

export const SUPPORT_TICKETS = [
  {
    id: 'tk1',
    customer: 'Arjun Patel',
    issue: 'Card not working at ATM',
    priority: 'urgent',
    status: 'open',
    cat: 'Card',
    time: '10 min ago',
    aiReply:
      'I understand your card is not working at the ATM. I have verified your card status and it appears active. Please try a different ATM or contact our 24/7 helpline at 1800-XXX-XXXX.',
  },
  {
    id: 'tk2',
    customer: 'Sneha Reddy',
    issue: 'Wrong EMI amount deducted',
    priority: 'high',
    status: 'open',
    cat: 'Loan',
    time: '25 min ago',
    aiReply:
      'I apologize for the inconvenience. After reviewing your loan account, I can see the EMI deduction. This will be rectified within 2 business days and the excess amount refunded.',
  },
  {
    id: 'tk3',
    customer: 'Rahul Singh',
    issue: 'FD premature closure request',
    priority: 'medium',
    status: 'in_progress',
    cat: 'FD',
    time: '1h ago',
    aiReply:
      'Your FD premature closure request has been noted. As per policy, a 1% penalty applies. The net amount of ₹X will be credited to your account within 24 hours.',
  },
  {
    id: 'tk4',
    customer: 'Meera Joshi',
    issue: 'Suspicious transaction on account',
    priority: 'urgent',
    status: 'open',
    cat: 'Fraud',
    time: '2h ago',
    aiReply:
      'We take fraud seriously. I have temporarily blocked the suspicious transactions and initiated a chargeback. Please confirm if transaction ID TXN8823 was authorized by you.',
  },
  {
    id: 'tk5',
    customer: 'Vikram Nair',
    issue: 'Home loan statement request',
    priority: 'low',
    status: 'resolved',
    cat: 'Loan',
    time: '1d ago',
    aiReply:
      'Your home loan statement for FY 2025-26 has been emailed to your registered email address. You can also download it from the ArthaMind app.',
  },
];

export const ANALYTICS = {
  totalCustomers: 24856,
  aiResolutionRate: 87,
  avgResponseTime: 1.8,
  fraudAlerts: 3,
  satisfaction: 4.6,
  agentPerformance: [
    { agent: 'FAQ Agent', resolved: 1240, rate: 94 },
    { agent: 'Card Agent', resolved: 890, rate: 88 },
    { agent: 'Loan Agent', resolved: 640, rate: 82 },
    { agent: 'Fraud Agent', resolved: 210, rate: 91 },
    { agent: 'Investment Agent', resolved: 430, rate: 85 },
  ],
  weeklyVolume: [
    { day: 'Mon', txns: 1240 },
    { day: 'Tue', txns: 1850 },
    { day: 'Wed', txns: 1620 },
    { day: 'Thu', txns: 2100 },
    { day: 'Fri', txns: 2840 },
    { day: 'Sat', txns: 1950 },
    { day: 'Sun', txns: 980 },
  ],
  fraudAlertsList: [
    {
      id: 'f1',
      customer: 'Unknown User',
      amount: '₹45,000',
      risk: 92,
      type: 'Unusual Location',
      time: '10 min ago',
      status: 'Active',
    },
    {
      id: 'f2',
      customer: 'Kiran B.',
      amount: '₹1,20,000',
      risk: 85,
      type: 'High Frequency',
      time: '1h ago',
      status: 'Active',
    },
    {
      id: 'f3',
      customer: 'Pooja M.',
      amount: '₹8,500',
      risk: 71,
      type: 'Odd Hours Purchase',
      time: '3h ago',
      status: 'Resolved',
    },
  ],
};

export const AI_RESPONSES: Record<string, { text: string; agent: string }> = {
  balance: {
    text: 'Your savings account (XXXX 4521) balance is **₹1,42,850.75**. Your current account (XXXX 8834) has **₹58,320.00**. Total: **₹2,01,170.75**.',
    agent: 'Account Agent',
  },
  'block card': {
    text: 'I can help you block your card. Which card would you like to block?\n1. Visa Debit **** 4521\n2. Mastercard Credit **** 7832\n\nPlease reply with 1 or 2.',
    agent: 'Card Agent',
  },
  card: {
    text: 'You have 2 active cards:\n• **Visa Debit** **** 4521 — Active\n• **Mastercard Credit** **** 7832 — Limit: ₹1,50,000 | Available: ₹95,000\n\nWould you like to block a card, check spending, or request a new card?',
    agent: 'Card Agent',
  },
  loan: {
    text: 'Based on your profile (income ₹85,000/month, credit score 762), you are eligible for:\n• **Personal Loan** up to ₹8,00,000 @ 10.5% p.a.\n• **Home Loan** up to ₹45,00,000 @ 8.25% p.a.\n\nWould you like to apply or calculate EMI?',
    agent: 'Loan Agent',
  },
  emi: {
    text: 'For a loan of **₹5,00,000** at **10.5% p.a.** for **36 months**:\n• Monthly EMI: **₹16,260**\n• Total Interest: **₹85,360**\n• Total Amount: **₹5,85,360**\n\nShall I proceed with the application?',
    agent: 'Loan Agent',
  },
  fd: {
    text: 'Current FD interest rates:\n• 6 months: **6.5%** p.a.\n• 1 year: **7.1%** p.a.\n• 2 years: **7.5%** p.a.\n• 3 years: **7.25%** p.a.\n\nFor ₹1,00,000 for 1 year, maturity amount: **₹1,07,100**.',
    agent: 'Investment Agent',
  },
  deposit: {
    text: 'I can help you create a Fixed Deposit. We have attractive rates up to **7.5% p.a.**\n\nMinimum deposit: ₹10,000. Would you like to open a new FD?',
    agent: 'Investment Agent',
  },
  fraud: {
    text: '🚨 **Fraud Alert Detected!**\n\nI noticed unusual activity on your account. A transaction of ₹45,000 was attempted from an unrecognised location.\n\nAction taken: Transaction **blocked automatically**.\n\nYour account is safe. Please verify your recent transactions.',
    agent: 'Fraud Agent',
  },
  transaction: {
    text: 'Your last 3 transactions:\n1. Amazon Shopping — **₹2,500** debited (Jun 27)\n2. Salary Credit — **₹85,000** credited (Jun 25)\n3. Swiggy Order — **₹1,200** debited (Jun 24)\n\nWould you like to see full transaction history?',
    agent: 'Account Agent',
  },
  invest: {
    text: 'Based on your savings pattern, here are personalised recommendations:\n\n1. **SBI Mutual Fund SIP** — ₹5,000/month, expected 12% returns\n2. **Fixed Deposit** — ₹2,00,000 for 2 years @ 7.5%\n3. **Recurring Deposit** — ₹3,000/month @ 6.8%\n\nWould you like to proceed with any of these?',
    agent: 'Investment Agent',
  },
  gamification: {
    text: '🏆 **Your Rewards Summary**\n\nTier: **Silver** (2,340 pts)\nTo Gold: **2,660 more points**\n\n🥇 Badges Earned: 4\n🎯 Active Challenges: 3\n💰 Cashback Earned: **₹1,240**\n\nComplete the UPI Master challenge (7/10) to earn 200 bonus points!\n\n[View All Rewards →](/dashboard/rewards)',
    agent: 'Gamification Agent',
  },
  recommend: {
    text: '🎯 **Personalized Recommendations**\n\nBased on your recent salary credit of ₹85,000:\n\n1. **SBI Bluechip SIP** — ₹5,000/month → ₹6.9L in 5 years\n2. **Term Insurance** — ₹1Cr cover @ ₹680/month\n3. **Home Loan Pre-approval** — Up to ₹45L @ 8.25%\n\nWant details on any of these?',
    agent: 'Life Events Agent',
  },
  insights: {
    text: '📊 **Your Banking Insights**\n\nPersonalization Score: **82/100**\n\n⚠️ Smart Nudges:\n• UPI not used in 14 days — earn 2x points!\n• ₹85,000 salary credited — invest ₹10K in SIP?\n• Bill streak: 3/5 — keep going!\n\nTop spend: **Food (28%)** → **Shopping (22%)**',
    agent: 'Behavioral Intelligence Agent',
  },
  upi: {
    text: "📱 **UPI Activation Guide**\n\nYou haven't linked a UPI ID yet! Here's how:\n\n1. Go to Accounts → UPI Settings\n2. Link your mobile number\n3. Set a 4-digit UPI PIN\n\n🎁 Bonus: Earn **150 points** on your first UPI transaction! That puts you 150 pts closer to Gold tier.",
    agent: 'Behavioral Intelligence Agent',
  },
  sip: {
    text: '📈 **SIP Recommendation for You**\n\nBased on your monthly salary of ₹85,000 and spending pattern:\n\n• Investable surplus: ~₹18,000/month\n• Recommended SIP: **₹10,000/month**\n• Fund: SBI Bluechip Fund (12% avg returns)\n• In 5 years: **₹8.2 Lakhs**\n• In 10 years: **₹23.4 Lakhs**\n\nStart small — even ₹2,000/month makes a difference!',
    agent: 'Investment Agent',
  },
  rewards: {
    text: '🏆 **Your Rewards Summary**\n\nTier: **Silver** (2,340 pts)\nTo Gold: **2,660 more points**\n\n🥇 Badges Earned: 4\n🎯 Active Challenges: 3\n💰 Cashback Earned: **₹1,240**\n\nComplete the UPI Master challenge (7/10) to earn 200 bonus points!\n\n[View All Rewards →](/dashboard/rewards)',
    agent: 'Gamification Agent',
  },
  'fraud awareness': {
    text: '🛡️ **Fraud Awareness Centre**\n\nYour account is protected by AI fraud detection.\n\n🚫 1 transaction blocked this month (₹45,000)\n📚 Security quiz: Not completed yet\n🏆 Earn "Security Savvy" badge by completing the quiz!\n\nTips:\n• Never share OTP with anyone\n• Check URLs before entering credentials\n• Report suspicious calls to 1800-111-109',
    agent: 'Fraud Agent',
  },
  autopay: {
    text: '⚡ **Bill Autopay Status**\n\n📋 Bills tracked: 4\n✅ On autopay: 1 (Jio Mobile)\n⚠️ Overdue: Electricity — ₹3,400\n\nSet up autopay to:\n• Avoid late fees\n• Earn 30 pts per automated payment\n• Maintain payment streak for badges\n\nGo to Bill Autopay to manage your bills.',
    agent: 'Behavioral Intelligence Agent',
  },
  privacy: {
    text: '🔒 **Your Privacy Settings**\n\nAll 4 AI personalisation features are active.\nPrivacy Score: **78/100 — Good**\n\n✅ Transaction Analysis: ON\n✅ Investment Tracking: ON\n✅ Bill Intelligence: ON\n❌ Location Suggestions: OFF\n\nYour data is encrypted and never shared with third parties.',
    agent: 'Router Agent',
  },
};
