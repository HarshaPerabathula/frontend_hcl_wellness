import React from 'react';
import { Card } from 'react-bootstrap';

interface StatCardProps {
  title: string;
  value: string | number;
  variant: 'primary' | 'success' | 'warning' | 'info' | 'danger';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, variant }) => {
  return (
    <Card className="text-center">
      <Card.Body>
        <h3 className={`text-${variant}`}>{value}</h3>
        <p>{title}</p>
      </Card.Body>
    </Card>
  );
};

export default StatCard;