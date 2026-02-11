import React, { useState, useEffect } from 'react';
import "../../css/PrescriptionHistoryModal.css";

const PrescriptionHistoryModal = ({ patientId, patientName, onClose }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);
  const [error, setError] = useState(null);

  // Fetch all prescription versions when modal opens
  useEffect(() => {
    fetchPrescriptionHistory();
  }, [patientId]);

  /* const fetchPrescriptionHistory = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/prescriptions/${patientId}/versions`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch prescription history');
      }

      const data = await response.json();
      setVersions(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError('Failed to load prescription history. Please try again.');
    } finally {
      setLoading(false);
    }
  }; */

  const fetchPrescriptionHistory = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/prescriptions/${patientId}/versions`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch prescription history');
      }

      const data = await response.json();

      // Filter out prescriptions with NULL or invalid created_at
      const validVersions = data.filter(version => {
        // Check if createdAt exists and is valid
        if (!version.createdAt) return false;

        const date = new Date(version.createdAt);
        // Check if date is valid (not NaN) and not epoch (1970)
        return !isNaN(date.getTime()) && date.getFullYear() > 1970;
      });

      setVersions(validVersions);
      setError(null);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError('Failed to load prescription history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Download specific version PDF
  const handleDownload = async (timestamp) => {
    setDownloading(timestamp);
    try {
      const encodedTimestamp = encodeURIComponent(timestamp);
      const response = await fetch(
        `http://localhost:8080/api/prescriptions/${patientId}/pdf/timestamp?timestamp=${encodedTimestamp}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to download prescription');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `prescription_${patientName}_${formatDateForFilename(timestamp)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading:', err);
      alert('Failed to download prescription. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDateForFilename = (dateString) => {
    return new Date(dateString).toISOString().replace(/[:.]/g, '-').slice(0, -5);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📋 Prescription History - {patientName}</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading prescription history...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <p>{error}</p>
              <button className="retry-btn" onClick={fetchPrescriptionHistory}>
                Retry
              </button>
            </div>
          ) : versions.length === 0 ? (
            <div className="no-data">
              <span className="no-data-icon">📋</span>
              <p>No prescription history found</p>
            </div>
          ) : (
            <div className="versions-list">
              {versions.map((version, index) => (
                <div
                  key={version.createdAt}
                  className={`version-card ${index === 0 ? 'latest' : ''}`}
                >
                  <div className="version-info">
                    <div className="version-header">
                      <h3>
                        Prescription {versions.length - index}
                        {index === 0 && <span className="badge-latest">LATEST</span>}
                      </h3>
                      <span className="version-date">
                        {formatDate(version.createdAt)}
                      </span>
                    </div>

                    <div className="version-details">
                      <span className="detail-item">
                        <span className="icon">💊</span>
                        {version.medicineCount} Medicine{version.medicineCount !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {version.notes && (
                      <p className="version-notes">
                        <span className="notes-icon">📝</span>
                        {version.notes}
                      </p>
                    )}
                  </div>

                  <button
                    className="btn-download"
                    onClick={() => handleDownload(version.createdAt)}
                    disabled={downloading === version.createdAt}
                  >
                    {downloading === version.createdAt ? (
                      <>
                        <span className="btn-spinner"></span>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <span className="download-icon">📥</span>
                        Download PDF
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrescriptionHistoryModal;