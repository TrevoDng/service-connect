import React from 'react';

interface RoleSelectorProps {
  onSelectRole: (role: 'client' | 'employee' | 'admin') => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ onSelectRole }) => {
  return (
    <div className="role-selector">
      <h2>Select Your Role</h2>
      <button onClick={() => onSelectRole('client')}>Client</button>
      <button onClick={() => onSelectRole('employee')}>Employee</button>
      <button onClick={() => onSelectRole('admin')}>Administrator</button>
    </div>
  );
};
