import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Alert, ProgressBar, Badge } from 'react-bootstrap';
import { useGetActiveGoalsQuery, useLogProgressMutation } from '../store/api';

const Goals: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [progressData, setProgressData] = useState({ actualValue: 0, date: new Date().toISOString().split('T')[0] });
  const { data: goals = [], error, isLoading } = useGetActiveGoalsQuery();
  const [logProgress] = useLogProgressMutation();

  const handleLogProgress = async () => {
    if (!selectedGoal) return;

    try {
      await logProgress({
        goalId: selectedGoal._id,
        date: progressData.date,
        actualValue: progressData.actualValue
      }).unwrap();
      setShowModal(false);
      setProgressData({ actualValue: 0, date: new Date().toISOString().split('T')[0] });
    } catch (err: any) {
      console.error('Failed to log progress:', err);
    }
  };

  const getGoalTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      steps: 'Steps',
      water_intake: 'Water Intake',
      sleep_hours: 'Sleep Hours',
      exercise_minutes: 'Exercise Minutes',
      weight_loss: 'Weight Loss'
    };
    return labels[type] || type;
  };

  if (isLoading) return <Container className="mt-5"><Alert variant="info">Loading goals...</Alert></Container>;
  if (error) return <Container className="mt-5"><Alert variant="danger">Failed to load goals</Alert></Container>;

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Wellness Goals</h2>
      </div>



      <Row>
        {goals.map((goal) => (
          <Col md={6} lg={4} key={goal._id} className="mb-4">
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <strong>{getGoalTypeLabel(goal.goalType)}</strong>
                <Badge bg={goal.status === 'active' ? 'success' : 'secondary'}>
                  {goal.status}
                </Badge>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <small className="text-muted">Daily Target</small>
                  <h5>{goal.targets.daily} {goal.unit}</h5>
                </div>
                
                <div className="mb-3">
                  <small className="text-muted">Progress</small>
                  <ProgressBar 
                    now={goal.progress.completionRate} 
                    label={`${Math.round(goal.progress.completionRate)}%`}
                    variant={goal.progress.completionRate >= 80 ? 'success' : goal.progress.completionRate >= 50 ? 'warning' : 'danger'}
                  />
                </div>

                <div className="mb-3">
                  <Row>
                    <Col xs={6}>
                      <small className="text-muted">Current Streak</small>
                      <div><strong>{goal.progress.currentStreak} days</strong></div>
                    </Col>
                    <Col xs={6}>
                      <small className="text-muted">Best Streak</small>
                      <div><strong>{goal.progress.longestStreak} days</strong></div>
                    </Col>
                  </Row>
                </div>

                <div className="mb-3">
                  <small className="text-muted">Duration</small>
                  <div>
                    {new Date(goal.duration.startDate).toLocaleDateString()} - {new Date(goal.duration.endDate).toLocaleDateString()}
                  </div>
                </div>

                {goal.notes && (
                  <div className="mb-3">
                    <small className="text-muted">Notes</small>
                    <p className="small">{goal.notes}</p>
                  </div>
                )}

                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={() => {
                    setSelectedGoal(goal);
                    setShowModal(true);
                  }}
                  disabled={goal.status !== 'active'}
                >
                  Log Progress
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {goals.length === 0 && !isLoading && (
        <Alert variant="info">
          No active goals found. Your healthcare provider will assign goals for you.
        </Alert>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Log Progress - {selectedGoal && getGoalTypeLabel(selectedGoal.goalType)}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={progressData.date}
                onChange={(e) => setProgressData({...progressData, date: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                Actual Value ({selectedGoal?.unit})
              </Form.Label>
              <Form.Control
                type="number"
                value={progressData.actualValue}
                onChange={(e) => setProgressData({...progressData, actualValue: Number(e.target.value)})}
                placeholder={`Target: ${selectedGoal?.targets.daily} ${selectedGoal?.unit}`}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleLogProgress}>
            Log Progress
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Goals;