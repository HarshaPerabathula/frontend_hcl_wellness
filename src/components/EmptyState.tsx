import React from 'react';
import { Alert } from 'react-bootstrap';

interface EmptyStateProps {
  message: string;
  variant?: 'info' | 'warning' | 'danger' | 'success';
  showAlert?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  message, 
  variant = 'info', 
  showAlert = false 
}) => {
  if (showAlert) {
    return <Alert variant={variant}>{message}</Alert>;
  }
  
  return <p>{message}</p>;
};

export default EmptyState;