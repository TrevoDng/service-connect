// src/pages/RequestRegistration.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registrationService } from '../services/registration.service';
import { authService } from '../services/auth.service'; // <-- Import authService
import { processImageBatch } from '../utils/imageUpload';
import { v4 as uuidv4 } from 'uuid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCheckCircle, faFileUpload, faSpinner, faKey } from '@fortawesome/free-solid-svg-icons';
import styles from './RequestRegistration.module.scss';

export const RequestRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    role: '' as 'EMPLOYEE' | 'PROVIDER' | '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const [documents, setDocuments] = useState<string[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [tempId] = useState(() => uuidv4());

  // Code Verification State
  const [secretCode, setSecretCode] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingDoc(true);
    try {
      const { urls, rejected } = await processImageBatch(files, {
        entityType: 'registrations',
        entityId: tempId,
        category: 'documents',
      });

      if (rejected.length > 0) {
        setError(`Some files failed: ${rejected.join(', ')}`);
      }
      setDocuments((prev) => [...prev, ...urls]);
    } catch (err) {
      setError('Failed to upload documents.');
    } finally {
      setUploadingDoc(false);
      e.target.value = ''; // reset input
    }
  };

  const handleSubmit = async () => {
    if (documents.length === 0) {
      setError('Please upload at least one document (ID or certificate).');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await registrationService.submitRequest({
        ...formData,
        role: formData.role as 'EMPLOYEE' | 'PROVIDER', // <-- ADD THIS CAST
        documents,
      });
      setStep(4); // Success step
    } catch (err: any) {
      setError(err.message || 'Failed to submit registration request.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
  if (!secretCode.trim()) return setError('Please enter your registration code.');
  if (!formData.role) return setError('Please go back and select your registration type.'); // Added check
  
  setLoading(true);
  setError('');

  try {
    await authService.validateSecretCode(secretCode.trim());
    
    // Redirect based on the selected role
    if (formData.role === 'PROVIDER') {
      navigate(`/service-provider-register?code=${secretCode.trim()}`);
    } else {
      navigate(`/register/employee?code=${secretCode.trim()}`);
    }
  } catch (err: any) {
    setError(err.message || 'Invalid or expired registration code.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Back Button */}
        {step > 1 && step !== 4 && step !== 5 && (
          <button type="button" className={styles.backBtn} onClick={() => setStep(step - 1)}>
            <FontAwesomeIcon icon={faArrowLeft} /> Back
          </button>
        )}
        {step === 5 && (
          <button type="button" className={styles.backBtn} onClick={() => setStep(1)}>
            <FontAwesomeIcon icon={faArrowLeft} /> Back
          </button>
        )}

        {/** 2. Update the Step 1 JSX to look like this: */}
        {step === 1 && (
          <div className={styles.step}>
            <h2>Apply to Join</h2>
            
            {/* 1. ROLE SELECTION FIRST */}
            <div className={styles.field}>
              <label>I am applying as a:</label>
              <select 
                name="role" 
                value={formData.role} 
                onChange={handleChange} 
                className={styles.select}
                required
              >
                <option value="" disabled>-- Select your registration type --</option>
                <option value="EMPLOYEE">Employee</option>
                <option value="PROVIDER">Service Provider</option>
              </select>
            </div>

            {/* 2. ENTER CODE BUTTON (Only shows if role is selected) */}
            {formData.role && (
              <div style={{ padding: '1rem', background: 'rgba(102, 126, 234, 0.08)', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(102, 126, 234, 0.2)' }}>
                <p style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                  Already received a registration code from an admin?
                </p>
                <button 
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() => { setError(''); setStep(5); }}
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                >
                  <FontAwesomeIcon icon={faKey} /> Enter Code for {formData.role === 'EMPLOYEE' ? 'Employee' : 'Provider'}
                </button>
              </div>
            )}

            <p style={{ marginTop: '1rem' }}>Or apply from scratch by entering your details below.</p>

            {/* 3. REST OF THE FORM */}
            <div className={styles.row}>
              <div className={styles.field}>
                <label>First Name</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className={styles.input} />
              </div>
              <div className={styles.field}>
                <label>Last Name</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required className={styles.input} />
              </div>
            </div>

            <div className={styles.field}>
              <label>Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required className={styles.input} />
            </div>

            <div className={styles.field}>
              <label>Phone Number</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={styles.input} />
            </div>

            <button 
              className={styles.primaryBtn} 
              onClick={() => {
                if (!formData.role) return setError('Please select if you are applying as an Employee or Provider.');
                if (!formData.firstName || !formData.email) return setError('Name and Email are required.');
                setError('');
                setStep(2);
              }}
            >
              Continue to Documents
            </button>
          </div>
        )}

        {/* STEP 5: Enter Code */}
        {step === 5 && (
          <div className={styles.step}>
            <h2>Enter Registration Code</h2>
            <p>Enter the security code that was sent to your email.</p>

            <div className={styles.field}>
              <label>Registration Code</label>
              <input 
                type="text" 
                value={secretCode} 
                onChange={(e) => setSecretCode(e.target.value)} 
                placeholder="e.g. A1B2C3D4"
                className={styles.input} 
                style={{ textTransform: 'uppercase', letterSpacing: '2px', fontFamily: 'monospace' }}
              />
            </div>

            <button className={styles.primaryBtn} onClick={handleVerifyCode} disabled={loading}>
              {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Verify & Proceed'}
            </button>
          </div>
        )}

        {/* STEP 2: Document Upload */}
        {step === 2 && (
          <div className={styles.step}>
            <h2>Upload Documents</h2>
            <p>
              {formData.role === 'PROVIDER' 
                ? 'Please upload your ID, Business Certificate, and Proof of Business Address.'
                : 'Please upload your ID and Proof of Address.'}
            </p>

            <div className={styles.uploadArea}>
              <FontAwesomeIcon icon={faFileUpload} className={styles.uploadIcon} />
              <p>Upload PDF or Image files</p>
              <input 
                type="file" 
                multiple 
                accept="image/*,application/pdf" 
                onChange={handleFileUpload} 
                disabled={uploadingDoc}
                className={styles.fileInput}
              />
              {uploadingDoc && <p><FontAwesomeIcon icon={faSpinner} spin /> Uploading...</p>}
            </div>

            {documents.length > 0 && (
              <div className={styles.docList}>
                <h4>Uploaded Documents ({documents.length})</h4>
                {documents.map((url, i) => (
                  <div key={i} className={styles.docItem}>
                    <span>Document {i + 1}</span>
                    <a href={url} target="_blank" rel="noreferrer">View</a>
                  </div>
                ))}
              </div>
            )}

            <button 
              className={styles.primaryBtn} 
              onClick={() => {
                if (documents.length === 0) return setError('Please upload at least one document.');
                setError('');
                setStep(3);
              }}
            >
              Review Application
            </button>
          </div>
        )}

        {/* STEP 3: Review */}
        {step === 3 && (
          <div className={styles.step}>
            <h2>Review & Submit</h2>
            <div className={styles.reviewBox}>
              <p><strong>Role:</strong> {formData.role}</p>
              <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
              <p><strong>Email:</strong> {formData.email}</p>
              <p><strong>Phone:</strong> {formData.phone || 'N/A'}</p>
              <p><strong>Documents:</strong> {documents.length} attached</p>
            </div>

            <button 
              className={styles.primaryBtn} 
              onClick={handleSubmit} 
              disabled={loading}
            >
              {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Submit Application'}
            </button>
          </div>
        )}

        {/* STEP 4: Success */}
        {step === 4 && (
          <div className={styles.stepSuccess}>
            <FontAwesomeIcon icon={faCheckCircle} className={styles.successIcon} />
            <h2>Application Submitted!</h2>
            <p>Your request is pending admin review. You will receive an email with a registration code if approved.</p>
            <button className={styles.primaryBtn} onClick={() => navigate('/login')}>
              Return to Login
            </button>
          </div>
        )}

        {error && <div className={styles.error}>{error}</div>}
      </div>
    </div>
  );
};

export default RequestRegistration;