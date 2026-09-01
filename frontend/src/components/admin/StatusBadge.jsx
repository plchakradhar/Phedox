import React from 'react';
import "./StatusBadge.css";
import { CheckCircle2, Clock, AlertTriangle, XCircle, PlayCircle } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  if (!status) return null;
  const s = String(status).toUpperCase();

  if (s === 'ACTIVE' || s === 'PROCESSED' || s === 'SUCCESS') {
    return (
      <span className="badge badge-success">
        <CheckCircle2 size={12} />
        <span>{s}</span>
      </span>
    );
  }

  if (s === 'PROCESSING') {
    return (
      <span className="badge badge-warning">
        <PlayCircle size={12} />
        <span>{s}</span>
      </span>
    );
  }

  if (s === 'RECEIVED' || s === 'PENDING') {
    return (
      <span className="badge badge-info">
        <Clock size={12} />
        <span>{s}</span>
      </span>
    );
  }

  if (s === 'INACTIVE' || s === 'FAILED' || s === 'DELETED') {
    return (
      <span className="badge badge-danger">
        <XCircle size={12} />
        <span>{s}</span>
      </span>
    );
  }

  return (
    <span className="badge badge-neutral">
      <span>{s}</span>
    </span>
  );
};

export default StatusBadge;
