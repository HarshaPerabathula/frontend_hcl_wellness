import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Alert, Table, Badge } from 'react-bootstrap';
import { providerAPI } from '../services/api';
import { User, WellnessGoal } from '../types';

const Patients: React.FC = () => {
  const [patients, setPatients] = useState<User[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<User | null>(null);
  const [patientGoals, setPatientGoals] = useState<WellnessGoal[]>([]);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [goalForm, setGoalForm] = useState({
    goalType: 'steps',
    dailyTarget: 0,
    unit: 'steps',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    periodType: '1_month',
    notes: ''
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await providerAPI.getPatients();
      setPatients(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientGoals = async (patientId: string) => {
    try {
      const response = await providerAPI.getPatientGoals(patientId);
      setPatientGoals(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load patient goals');
    }
  };

  const handleViewGoals = async (patient: User) => {
    setSelectedPatient(patient);
    const patientId = patient._id || patient.id;
    await fetchPatientGoals(patientId);
    setShowGoalsModal(true);
  };

  const handleAssignGoal = async () => {
    if (!selectedPatient) return;

    try {
      const patientId = selectedPatient._id || selectedPatient.id;
      const endDate = new Date(goalForm.startDate);
      endDate.setMonth(endDate.getMonth() + (goalForm.periodType === '1_month' ? 1 : 3));

      await providerAPI.assignGoal({
        patientId: patientId,
        goalType: goalForm.goalType,
        targets: { daily: goalForm.dailyTarget },
        unit: goalForm.unit,
        duration: {
          startDate: new Date(goalForm.startDate).toISOString(),
          endDate: endDate.toISOString(),
          periodType: goalForm.periodType
        },
        notes: goalForm.notes
      });

      setShowAssignModal(false);
      if (showGoalsModal) {
        await fetchPatientGoals(patientId);
      }
      
      // Reset form
      setGoalForm({
        goalType: 'steps',
        dailyTarget: 0,
        unit: 'steps',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        periodType: '1_month',
        notes: ''
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to assign goal');
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

  if (loading) return <Container className="mt-5"><Alert variant="info">Loading patients...</Alert></Container>;

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Patients</h2>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        {patients.map((patient) => {
          const patientId = patient._id || patient.id;
          return (
            <Col md={6} lg={4} key={patientId} className="mb-4">
              <Card>
                <Card.Header>
                  <strong>{patient.profile.firstName} {patient.profile.lastName}</strong>
                </Card.Header>
                <Card.Body>
                  <p><strong>Email:</strong> {patient.email}</p>
                  <p><strong>Phone:</strong> {patient.profile.phone}</p>
                  
                  {patient.patientInfo?.allergies && patient.patientInfo.allergies.length > 0 && (
                    <div className="mb-2">
                      <strong>Allergies:</strong>
                      <div>
                        {patient.patientInfo.allergies.map((allergy, index) => (
                          <Badge key={index} bg="warning" className="me-1">
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {patient.patientInfo?.medications && patient.patientInfo.medications.length > 0 && (
                    <div className="mb-3">
                      <strong>Medications:</strong>
                      <div>
                        {patient.patientInfo.medications.map((medication, index) => (
                          <Badge key={index} bg="info" className="me-1">
                            {medication}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="d-grid gap-2">
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => handleViewGoals(patient)}
                    >
                      View Goals & Progress
                    </Button>
                    <Button 
                      variant="success" 
                      size="sm"
                      onClick={() => {
                        setSelectedPatient(patient);
                        setShowAssignModal(true);
                      }}
                    >
                      Assign New Goal
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      {patients.length === 0 && !loading && (
        <Alert variant="info">
          No patients assigned to you yet.
        </Alert>
      )}

      {/* Patient Goals Modal */}
      <Modal show={showGoalsModal} onHide={() => setShowGoalsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Goals for {selectedPatient?.profile.firstName} {selectedPatient?.profile.lastName}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {patientGoals.length > 0 ? (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Goal Type</th>
                  <th>Target</th>
                  <th>Progress</th>
                  <th>Status</th>
                  <th>Streak</th>
                </tr>
              </thead>
              <tbody>
                {patientGoals.map((goal) => (
                  <tr key={goal._id}>
                    <td>{getGoalTypeLabel(goal.goalType)}</td>
                    <td>{goal.targets.daily} {goal.unit}</td>
                    <td>{Math.round(goal.progress.completionRate)}%</td>
                    <td>
                      <Badge bg={goal.status === 'active' ? 'success' : 'secondary'}>
                        {goal.status}
                      </Badge>
                    </td>
                    <td>{goal.progress.currentStreak} days</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <Alert variant="info">No goals assigned to this patient yet.</Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="success" 
            onClick={() => {
              setShowGoalsModal(false);
              setShowAssignModal(true);
            }}
          >
            Assign New Goal
          </Button>
          <Button variant="secondary" onClick={() => setShowGoalsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Assign Goal Modal */}
      <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            Assign Goal to {selectedPatient?.profile.firstName} {selectedPatient?.profile.lastName}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Goal Type</Form.Label>
              <Form.Select
                value={goalForm.goalType}
                onChange={(e) => {
                  const type = e.target.value;
                  const unitMap: { [key: string]: string } = {
                    steps: 'steps',
                    water_intake: 'liters',
                    sleep_hours: 'hours',
                    exercise_minutes: 'minutes',
                    weight_loss: 'kg'
                  };
                  setGoalForm({...goalForm, goalType: type, unit: unitMap[type] || 'units'});
                }}
              >
                <option value="steps">Steps</option>
                <option value="water_intake">Water Intake</option>
                <option value="sleep_hours">Sleep Hours</option>
                <option value="exercise_minutes">Exercise Minutes</option>
                <option value="weight_loss">Weight Loss</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Daily Target ({goalForm.unit})</Form.Label>
              <Form.Control
                type="number"
                value={goalForm.dailyTarget}
                onChange={(e) => setGoalForm({...goalForm, dailyTarget: Number(e.target.value)})}
                placeholder="Enter daily target"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                value={goalForm.startDate}
                onChange={(e) => setGoalForm({...goalForm, startDate: e.target.value})}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Duration</Form.Label>
              <Form.Select
                value={goalForm.periodType}
                onChange={(e) => setGoalForm({...goalForm, periodType: e.target.value})}
              >
                <option value="1_month">1 Month</option>
                <option value="3_months">3 Months</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Notes (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={goalForm.notes}
                onChange={(e) => setGoalForm({...goalForm, notes: e.target.value})}
                placeholder="Add any instructions or notes for the patient"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAssignModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAssignGoal}>
            Assign Goal
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Patients;