// src/account/components/Admin/AdminDashboard.tsx
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import AdminLayout from "../layout/AdminLayout";
import ConfirmModal from "../common/ConfirmModal";
//@ts-ignore
import './AdminDashboard.css';

interface PendingEmployee {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  createdAt: string;
  status: string;
}

interface SecretCode {
  id: string;
  code: string;
  expiresAt: string;
  isUsed: boolean;
  createdAt: string;
  createdBy?: string;
  assignedEmail: string;
  isExpiringSoon?: boolean;
}

interface ActiveEmployee {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  createdAt: string;
  lastLogin: string | null;
}

const AdminDashboard: React.FC = () => {
  const { getToken } = useAuth();
  const [newEmployeeEmail, setNewEmployeeEmail] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [generatedCodeExpiry, setGeneratedCodeExpiry] = useState('');
  const [pendingApprovals, setPendingApprovals] = useState<PendingEmployee[]>([]);
  const [activeInvites, setActiveInvites] = useState<SecretCode[]>([]);
  const [expiringSoon, setExpiringSoon] = useState<SecretCode[]>([]);
  const [activeEmployees, setActiveEmployees] = useState<ActiveEmployee[]>([]);
  const [loading, setLoading] = useState({
    pending: true,
    invites: true,
    employees: true
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Add state for confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [codeToDelete, setCodeToDelete] = useState<string | null>(null);

  const API_BASE = import.meta.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

  // Fetch all data
  useEffect(() => {
    fetchPendingApprovals();
    fetchActiveInvites();
    fetchActiveEmployees();
  }, []);

  const fetchPendingApprovals = async () => {
    setLoading(prev => ({ ...prev, pending: true }));
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/admin/pending-employees`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        setPendingApprovals(data.data || []);
      } else {
        console.error('Failed to fetch pending approvals:', data);
      }
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
    } finally {
      setLoading(prev => ({ ...prev, pending: false }));
    }
  };

  const fetchActiveInvites = async () => {
    setLoading(prev => ({ ...prev, invites: true }));
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/admin/secret-codes?status=active`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        const codes = data.data?.codes || data.codes || [];
        setActiveInvites(codes);
        setExpiringSoon(codes.filter((code: SecretCode) => code.isExpiringSoon));
      } else {
        console.error('Failed to fetch active invites:', data);
      }
    } catch (error) {
      console.error('Error fetching active invites:', error);
    } finally {
      setLoading(prev => ({ ...prev, invites: false }));
    }
  };

  const fetchActiveEmployees = async () => {
    setLoading(prev => ({ ...prev, employees: true }));
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/admin/active-employees`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        setActiveEmployees(data.data || []);
      } else {
        console.error('Failed to fetch active employees:', data);
      }
    } catch (error) {
      console.error('Error fetching active employees:', error);
    } finally {
      setLoading(prev => ({ ...prev, employees: false }));
    }
  };

  const generateSecretCode = async () => {
    if (!newEmployeeEmail) {
      setError('Please enter an email address');
      return;
    }

    setError('');
    setSuccess('');
    setIsGenerating(true);

    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/admin/generate-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          expiresInHours: 168,
          employeeEmail: newEmployeeEmail
        }) // 7 days
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        const codeData = data.data;
        setGeneratedCode(codeData.code);
        setGeneratedCodeExpiry(new Date(codeData.expiresAt).toLocaleString());
        setSuccess(`Invite code generated for ${newEmployeeEmail}`);
        setNewEmployeeEmail('');
        fetchActiveInvites(); // Refresh the list
      } else {
        setError(data.message || data.error?.message || 'Failed to generate code');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const approveEmployee = async (userId: string) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/admin/approve-employee`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, approve: true })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSuccess('Employee approved successfully!');
        fetchPendingApprovals();
        fetchActiveEmployees();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || data.error?.message || 'Failed to approve employee');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred');
    }
  };

  const rejectEmployee = async (userId: string) => {
    const reason = prompt('Please enter the reason for rejection:');
    if (!reason) return;

    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/admin/approve-employee`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, approve: false, reason })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSuccess('Employee rejected successfully.');
        fetchPendingApprovals();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || data.error?.message || 'Failed to reject employee');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred');
    }
  };

  const deleteSecretCode = async (codeId: string) => {
    setCodeToDelete(codeId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!codeToDelete) return;

    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/admin/secret-codes/${codeToDelete}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSuccess('Invite code deleted successfully.');
        fetchActiveInvites();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || data.error?.message || 'Failed to delete code');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred');
    } finally {
      setShowDeleteModal(false);
      setCodeToDelete(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('Code copied to clipboard!');
    setTimeout(() => setSuccess(''), 2000);
  };

  const getFullName = (firstName: string, lastName: string, email: string) => {
    if (firstName && lastName) return `${firstName} ${lastName}`;
    if (firstName) return firstName;
    return email.split('@')[0];
  };

  // Calculate stats for the stats row
  const stats = {
    pendingApprovals: pendingApprovals.length,
    activeInviteCodes: activeInvites.length,
    expiringSoon: expiringSoon.length,
    activeEmployees: activeEmployees.length
  };

  if (loading.pending && loading.invites && loading.employees) {
    return (
      <AdminLayout>
        <div className="admin-dashboard loading-state">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-dashboard">
        <div className="dashboard-header">
          <h1>Employee Management</h1>
          <p>Manage employee registrations, invite codes, and active staff members</p>
        </div>

        {/* Stats Row */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <h3>{stats.pendingApprovals}</h3>
              <p>Pending Approvals</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔑</div>
            <div className="stat-info">
              <h3>{stats.activeInviteCodes}</h3>
              <p>Active Invite Codes</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⚠️</div>
            <div className="stat-info">
              <h3>{stats.expiringSoon}</h3>
              <p>Expiring Soon</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👔</div>
            <div className="stat-info">
              <h3>{stats.activeEmployees}</h3>
              <p>Active Employees</p>
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="error-message">
            <span>⚠️</span>
            <span>{error}</span>
            <button onClick={() => setError('')}>×</button>
          </div>
        )}

        {success && (
          <div className="success-message">
            <span>✅</span>
            <span>{success}</span>
            <button onClick={() => setSuccess('')}>×</button>
          </div>
        )}

        {/* Generate Employee Codes Section */}
        <div className="cards-section">
          <h2>Generate Invite Code</h2>
          <div className="cards-grid">
            <div className="form-group" style={{ width: '100%' }}>
              <label>Employee Email</label>
              <div className="invite-form">
                <input
                  type="email"
                  value={newEmployeeEmail}
                  onChange={(e) => setNewEmployeeEmail(e.target.value)}
                  placeholder="employee@company.com"
                  disabled={isGenerating}
                />
                <button 
                  onClick={generateSecretCode} 
                  disabled={isGenerating || !newEmployeeEmail}
                >
                  {isGenerating ? 'Generating...' : 'Generate Invite Code'}
                </button>
              </div>
            </div>
          </div>

          {generatedCode && (
            <div className="generated-code">
              <h3>✨ Secret Code Generated:</h3>
              <div className="code-display">
                <code>{generatedCode}</code>
                <button onClick={() => copyToClipboard(generatedCode)}>📋 Copy Code</button>
              </div>
              <p className="hint">
                Share this code with the employee. They'll need it to register.
                <br />
                <strong>Expires:</strong> {generatedCodeExpiry}
              </p>
            </div>
          )}
        </div>

        {/* Pending Approvals Section */}
        <div className="cards-section">
          <h2>Pending Employee Approvals ({pendingApprovals.length})</h2>
          {loading.pending ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading pending approvals...</p>
            </div>
          ) : pendingApprovals.length === 0 ? (
            <div className="empty-state">
              <p>✅ No pending approvals</p>
              <small>All employees have been reviewed</small>
            </div>
          ) : (
            <div className="approvals-list">
              {pendingApprovals.map((applicant) => (
                <div key={applicant.id} className="approval-item">
                  <div className="applicant-info">
                    <strong>{getFullName(applicant.firstName, applicant.lastName, applicant.email)}</strong>
                    <p>📧 {applicant.email}</p>
                    {applicant.phone && <p>📞 {applicant.phone}</p>}
                    <p className="registered-date">
                      Registered: {new Date(applicant.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="approval-actions">
                    <button 
                      className="approve"
                      onClick={() => approveEmployee(applicant.id)}
                    >
                      ✓ Approve
                    </button>
                    <button 
                      className="reject"
                      onClick={() => rejectEmployee(applicant.id)}
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Employees Section */}
        <div className="cards-section">
          <h2>Active Employees ({activeEmployees.length})</h2>
          {loading.employees ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading employees...</p>
            </div>
          ) : activeEmployees.length === 0 ? (
            <div className="empty-state">
              <p>👔 No active employees yet</p>
              <small>Employees will appear here once approved</small>
            </div>
          ) : (
            <div className="employees-table-wrapper">
              <table className="employees-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Joined</th>
                    <th>Last Login</th>
                  </tr>
                </thead>
                <tbody>
                  {activeEmployees.map((employee) => (
                    <tr key={employee.id}>
                      <td>{getFullName(employee.firstName, employee.lastName, employee.email)}</td>
                      <td>{employee.email}</td>
                      <td>{employee.phone || '-'}</td>
                      <td>{new Date(employee.createdAt).toLocaleDateString()}</td>
                      <td>{employee.lastLogin ? new Date(employee.lastLogin).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Active Invite Codes Section */}
        <div className="cards-section">
          <h2>Active Invite Codes ({activeInvites.length})</h2>
          
          {expiringSoon.length > 0 && (
            <div className="warning-banner">
              ⚠️ {expiringSoon.length} code(s) expiring within 24 hours!
            </div>
          )}
          
          {loading.invites ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading invite codes...</p>
            </div>
          ) : activeInvites.length === 0 ? (
            <div className="empty-state">
              <p>🔑 No active invite codes</p>
              <small>Generate invite codes to onboard new employees</small>
            </div>
          ) : (
            <div className="invites-table-wrapper">
              <table className="invites-table">
                <thead>
                  <tr>
                    <th>Assigned To</th>
                    <th>Code</th>
                    <th>Expires</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeInvites.map((invite) => (
                    <tr key={invite.id} className={invite.isExpiringSoon ? 'expiring' : ''}>
                      <td>{invite.assignedEmail}</td>
                      <td><code>{invite.code}</code></td>
                      <td>{new Date(invite.expiresAt).toLocaleString()}</td>
                      <td>
                        {invite.isUsed ? (
                          <span className="status-used">✓ Used</span>
                        ) : new Date(invite.expiresAt) < new Date() ? (
                          <span className="status-expired">✗ Expired</span>
                        ) : (
                          <span className="status-active">● Active</span>
                        )}
                      </td>
                      <td>
                        <button 
                          onClick={() => copyToClipboard(invite.code)}
                          className="copy-code-btn"
                        >
                          Copy
                        </button>
                        <button 
                          onClick={() => deleteSecretCode(invite.id)}
                          className="delete-code-btn"
                          disabled={invite.isUsed}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Confirmation Modal for Delete */}
        <ConfirmModal
          isOpen={showDeleteModal}
          title="Delete Invite Code"
          message="Are you sure you want to delete this invite code? This action cannot be undone."
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setCodeToDelete(null);
          }}
          confirmText="Delete"
          cancelText="Cancel"
          confirmVariant="danger"
        />
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;