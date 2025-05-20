import React, { useState, ChangeEvent, FormEvent } from 'react';
import { FaWallet, FaCreditCard, FaCog, FaQuestionCircle, FaPlus, FaArrowDown, FaCheck } from 'react-icons/fa';
import { MdNotifications } from 'react-icons/md';
import './paymentflow.css';


export interface Transaction {
  date: string;
  id: string;
  description: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'subscription';
  status: 'Completed' | 'Pending';
}

const initialTransactions: Transaction[] = [
  { date: 'May 18, 2025', id: 'TRX123456789', description: 'Deposit via Credit Card', amount: 500, type: 'deposit', status: 'Completed' },
  { date: 'May 15, 2025', id: 'TRX123456788', description: 'Monthly Subscription - Pro Plan', amount: -49.99, type: 'subscription', status: 'Completed' },
  { date: 'May 10, 2025', id: 'TRX123456787', description: 'Withdrawal to Bank Account', amount: -1000, type: 'withdrawal', status: 'Pending' },
  { date: 'May 5, 2025', id: 'TRX123456786', description: 'Deposit via PayPal', amount: 2000, type: 'deposit', status: 'Completed' },
  { date: 'Apr 30, 2025', id: 'TRX123456785', description: 'Withdrawal to Bank Account', amount: -500, type: 'withdrawal', status: 'Completed' },
];

const subscriptionPlans = [
  {
    title: 'Basic Plan',
    price: '$9.99/month',
    features: ['Access to basic features', 'Email support', 'Single device login'],
  },
  {
    title: 'Pro Plan',
    price: '$49.99/month',
    features: ['All basic features', 'Priority support', 'Multi-device login', 'Analytics dashboard'],
  },
  {
    title: 'Enterprise Plan',
    price: '$199.99/month',
    features: ['Everything in Pro', 'Dedicated manager', 'Custom integrations', '24/7 Support'],
  },
];

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'payment-management' | 'subscription'>('payment-management');
  const [historyFilter, setHistoryFilter] = useState<'all-transactions' | 'deposits' | 'withdrawals' | 'subscription-payments'>('all-transactions');

  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const balance = transactions.reduce((sum, tx) => sum + tx.amount, 0);

  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isWithdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const [addAmount, setAddAmount] = useState<number>(0);
  const [addMethod, setAddMethod] = useState<string>('credit-card');

  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [withdrawMethod, setWithdrawMethod] = useState<string>('bank-account');

  const filteredTransactions = transactions.filter(tx => {
    if (historyFilter === 'all-transactions') return true;
    if (historyFilter === 'deposits') return tx.type === 'deposit';
    if (historyFilter === 'withdrawals') return tx.type === 'withdrawal';
    if (historyFilter === 'subscription-payments') return tx.type === 'subscription';
    return true;
  });

  const openAddModal = () => setAddModalOpen(true);
  const closeAddModal = () => setAddModalOpen(false);
  const openWithdrawModal = () => setWithdrawModalOpen(true);
  const closeWithdrawModal = () => setWithdrawModalOpen(false);
  const closeSuccess = () => setShowSuccess(false);

  const handleAddFunds = (e: FormEvent) => {
    e.preventDefault();
    if (addAmount <= 0) return;
    const id = `TRX${Math.floor(Math.random() * 1e9)}`;
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const newTx: Transaction = { date: today, id, description: `Deposit via ${addMethod.replace('-', ' ')}`, amount: addAmount, type: 'deposit', status: 'Completed' };
    setTransactions([newTx, ...transactions]);
    setSuccessMessage(`${addAmount.toFixed(2)} has been added to your account successfully!`);
    setShowSuccess(true);
    setAddModalOpen(false);
    setAddAmount(0);
  };

  const handleWithdraw = (e: FormEvent) => {
    e.preventDefault();
    if (withdrawAmount <= 0 || withdrawAmount > balance) return;
    const id = `TRX${Math.floor(Math.random() * 1e9)}`;
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const newTx: Transaction = { date: today, id, description: `Withdrawal to ${withdrawMethod.replace('-', ' ')}`, amount: -withdrawAmount, type: 'withdrawal', status: 'Pending' };
    setTransactions([newTx, ...transactions]);
    setSuccessMessage(`Your withdrawal request for ${withdrawAmount.toFixed(2)} has been submitted successfully!`);
    setShowSuccess(true);
    setWithdrawModalOpen(false);
    setWithdrawAmount(0);
  };

  return (
    <div className="paymentflow-root container">
      <div className="dashboard">
        <aside className="sidebar">
          <div className="logo">
            <div className="logo-icon">L</div>
            <div className="logo-text">LabelX</div>
          </div>
          <nav>
            <ul className="nav-links">
              <li>
                <button className={`nav-link ${activeTab === 'payment-management' ? 'active' : ''}`} onClick={() => setActiveTab('payment-management')}>
                  <FaWallet /> <span>Payments</span>
                </button>
              </li>
              <li>
                <button className={`nav-link ${activeTab === 'subscription' ? 'active' : ''}`} onClick={() => setActiveTab('subscription')}>
                  <FaCreditCard /> <span>Subscription</span>
                </button>
              </li>
              <li>
                <button className="nav-link">
                  <FaCog /> <span>Settings</span>
                </button>
              </li>
              <li>
                <button className="nav-link">
                  <FaQuestionCircle /> <span>Help Center</span>
                </button>
              </li>
            </ul>
          </nav>
          <div className="user-section">
            <div className="user-info">
              <div className="user-avatar">JD</div>
              <div className="user-details">
                <div className="user-name">John Doe</div>
                <div className="user-role">Pro Account</div>
              </div>
            </div>
          </div>
        </aside>

        <main className="main-content">
          {/* Payment Management */}
          {activeTab === 'payment-management' && (
            <section id="payment-management" className="tab-content active">
              <header className="header">
                <h1 className="page-title">Payment Management</h1>
                <button className="btn btn-outline"><MdNotifications /></button>
              </header>
              <div className="balance-card">
                <div className="balance-header">
                  <div className="balance-title">Your Balance</div>
                  <div className="balance-updated">Last updated: May 18, 2025</div>
                </div>
                <div className="balance-amount">${balance.toFixed(2)}</div>
                <div className="action-buttons">
                  <button className="btn btn-primary" onClick={openAddModal}><FaPlus /> Add Funds</button>
                  <button className="btn btn-outline" onClick={openWithdrawModal}><FaArrowDown /> Withdraw</button>
                </div>
              </div>

              <div className="tabs">
                <button className={`tab ${historyFilter === 'all-transactions' ? 'active' : ''}`} onClick={() => setHistoryFilter('all-transactions')}>All Transactions</button>
                <button className={`tab ${historyFilter === 'deposits' ? 'active' : ''}`} onClick={() => setHistoryFilter('deposits')}>Deposits</button>
                <button className={`tab ${historyFilter === 'withdrawals' ? 'active' : ''}`} onClick={() => setHistoryFilter('withdrawals')}>Withdrawals</button>
                <button className={`tab ${historyFilter === 'subscription-payments' ? 'active' : ''}`} onClick={() => setHistoryFilter('subscription-payments')}>Subscription Payments</button>
              </div>

              <div className="table-container">
                <table>
                  <thead>
                    <tr><th>Date</th><th>Transaction ID</th><th>Description</th><th>Amount</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map(tx => (
                      <tr key={tx.id}>
                        <td>{tx.date}</td>
                        <td>{tx.id}</td>
                        <td>{tx.description}</td>
                        <td className={tx.amount >= 0 ? 'text-success' : 'text-danger'}>
                          {tx.amount >= 0 ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                        </td>
                        <td><span className={`status ${tx.status === 'Completed' ? 'status-success' : 'status-pending'}`}>{tx.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Subscription Section */}
          {activeTab === 'subscription' && (
            <section
  id="subscription"
  className={`tab-content ${activeTab === 'subscription' ? 'active' : ''}`}
>
              <header className="header">
                <h1 className="page-title">Subscription</h1>
              </header>
              <div className="subscription-section">
                <h2 className="subscription-title">Choose Your Plan</h2>
                <div className="subscription-cards">
                  {subscriptionPlans.map((plan, index) => (
                    <div className="subscription-card" key={index}>
                      <h3 className="plan-title">{plan.title}</h3>
                      <p className="plan-price">{plan.price}</p>
                      <ul className="plan-features">
                        {plan.features.map((feature, i) => (
                          <li key={i}><FaCheck className="check-icon" /> {feature}</li>
                        ))}
                      </ul>
                      <button className="btn btn-primary">Subscribe</button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* Modals */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Add Funds</h2>
              <button className="modal-close" onClick={closeAddModal}>&times;</button>
            </div>
            <form onSubmit={handleAddFunds} className="modal-body">
              <div className="form-group">
                <label>Amount</label>
                <input type="number" value={addAmount} onChange={(e) => setAddAmount(Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label>Method</label>
                <select value={addMethod} onChange={(e) => setAddMethod(e.target.value)}>
                  <option value="credit-card">Credit Card</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>
              <button className="btn btn-primary" type="submit">Add Funds</button>
            </form>
          </div>
        </div>
      )}

      {isWithdrawModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Withdraw</h2>
              <button className="modal-close" onClick={closeWithdrawModal}>&times;</button>
            </div>
            <form onSubmit={handleWithdraw} className="modal-body">
              <div className="form-group">
                <label>Amount</label>
                <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label>Method</label>
                <select value={withdrawMethod} onChange={(e) => setWithdrawMethod(e.target.value)}>
                  <option value="bank-account">Bank Account</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>
              <button className="btn btn-primary" type="submit">Withdraw</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
