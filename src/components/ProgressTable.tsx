import React from 'react';
import { Table, ProgressBar, Badge } from 'react-bootstrap';
import { DailyProgress } from '../types';

interface ProgressTableProps {
  progress: DailyProgress[];
  getGoalTypeLabel: (type: string) => string;
}

const ProgressTable: React.FC<ProgressTableProps> = ({ progress, getGoalTypeLabel }) => {
  return (
    <Table striped className="mt-3">
      <thead>
        <tr>
          <th>Goal</th>
          <th>Target</th>
          <th>Actual</th>
          <th>Progress</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {progress.map((item) => (
          <tr key={item._id}>
            <td>{getGoalTypeLabel(item.goalId?.goalType || '')}</td>
            <td>{item.targetValue} {item.goalId?.unit}</td>
            <td>{item.actualValue} {item.goalId?.unit}</td>
            <td>
              <ProgressBar 
                now={item.completionPercentage} 
                label={`${Math.round(item.completionPercentage)}%`}
                variant={item.achieved ? 'success' : 'warning'}
              />
            </td>
            <td>
              <Badge bg={item.achieved ? 'success' : 'warning'}>
                {item.achieved ? 'Achieved' : 'In Progress'}
              </Badge>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default ProgressTable;