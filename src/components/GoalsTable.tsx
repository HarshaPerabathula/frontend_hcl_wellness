import React from 'react';
import { Table, Badge, ProgressBar } from 'react-bootstrap';
import { WellnessGoal } from '../types';

interface GoalsTableProps {
  goals: WellnessGoal[];
  getGoalTypeLabel: (type: string) => string;
}

const GoalsTable: React.FC<GoalsTableProps> = ({ goals, getGoalTypeLabel }) => {
  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>Goal Type</th>
          <th>Daily Target</th>
          <th>Current Streak</th>
          <th>Longest Streak</th>
          <th>Overall Progress</th>
          <th>Today's Status</th>
        </tr>
      </thead>
      <tbody>
        {goals.map((goal) => (
          <tr key={goal._id}>
            <td>{getGoalTypeLabel(goal.goalType)}</td>
            <td>{goal.targets.daily} {goal.unit}</td>
            <td>
              <Badge bg="info">{goal.currentStreak || 0} days</Badge>
            </td>
            <td>
              <Badge bg="success">{goal.longestStreak || 0} days</Badge>
            </td>
            <td>
              <ProgressBar 
                now={goal.progress?.completionRate || 0} 
                label={`${Math.round(goal.progress?.completionRate || 0)}%`}
              />
            </td>
            <td>
              {goal.todayProgress ? (
                <Badge bg={goal.todayProgress.achieved ? 'success' : 'warning'}>
                  {goal.todayProgress.achieved ? 'Completed' : 'In Progress'}
                </Badge>
              ) : (
                <Badge bg="secondary">Not Started</Badge>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default GoalsTable;