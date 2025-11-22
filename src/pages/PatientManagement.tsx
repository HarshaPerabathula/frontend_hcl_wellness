import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Alert, Table, Badge } from 'react-bootstrap';
import { useGetAllPatientsQuery, useAssignPatientMutation, useGetPatientsQuery, useAssignGoalMutation } from '../store/api';
import { User } from '../types';

const PatientManagement: React.FC = () => {
  const { data: allPatients = [], isLoading: loadingAll } = useGetAllPatientsQuery();
  const { data: assignedPatients = [], refetch } = useGetPatientsQuery();
  const [assignPatient] = useAssignPatientMutation();
  const [assignGoal] = useAssignGoalMutation();

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [goalForm, setGoalForm] = useState({
    goalType: 'steps',
    dailyTarget: '',
    unit: 'steps',
    startDate: '',
    endDate: '',
    notes: ''
  });

  const handleAssignPatient = async (patientId: string) => {
    try {
      console.log('Assigning patient with ID:', patientId);
      await assignPatient({ patientId }).unwrap();
      setSuccess('Patient assigned successfully');
      refetch();
    } catch (err: any) {
      console.error('Assignment error:', err);
      setError(err.data?.error || 'Failed to assign patient');
    }
  };

  const handleAssignGoal = async () => {
    if (!selectedPatient) return;

    const patientId = selectedPatient._id || selectedPatient.id;
    console.log('Selected patient:', selectedPatient);
    console.log('Patient ID for goal:', patientId);

    if (!patientId) {
      setError('Patient ID is missing');
      return;
    }

    try {
      const goalData = {
        patientId: patientId,
        goalType: goalForm.goalType,
        targets: { daily: parseInt(goalForm.dailyTarget) },
        unit: goalForm.unit,
        duration: {
          startDate: new Date(goalForm.startDate).toISOString(),
          endDate: new Date(goalForm.endDate).toISOString(),
          periodType: 'custom'
        },
        notes: goalForm.notes
      };

      console.log('Goal data being sent:', goalData);
      
      await assignGoal(goalData).unwrap();

      setSuccess('Goal assigned successfully');
      setShowGoalModal(false);
      setGoalForm({
        goalType: 'steps',
        dailyTarget: '',
        unit: 'steps',
        startDate: '',
        endDate: '',
        notes: ''
      });
    } catch (err: any) {
      console.error('Goal assignment error:', err);
      setError(err.data?.error || 'Failed to assign goal');
    }
  };

  const openGoalModal = (patient: User) => {
    console.log('Opening goal modal for patient:', patient);
    setSelectedPatient(patient);
    setShowGoalModal(true);
  };

  const goalTypes = [
    { value: 'steps', label: 'Steps', unit: 'steps' },
    { value: 'water_intake', label: 'Water Intake', unit: 'liters' },
    { value: 'sleep_hours', label: 'Sleep Hours', unit: 'hours' },
    { value: 'exercise_minutes', label: 'Exercise Minutes', unit: 'minutes' },
    { value: 'weight_loss', label: 'Weight Loss', unit: 'kg' }
  ];

  const handleGoalTypeChange = (type: string) => {
    const goalType = goalTypes.find(g => g.value === type);
    setGoalForm({
      ...goalForm,
      goalType: type,
      unit: goalType?.unit || 'steps'
    });
  };

  if (loadingAll) return <Container className="mt-5"><Alert variant="info">Loading...</Alert></Container>;

  return (
    <Container className="mt-4">
      <h2>Patient Management</h2>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

      <Row>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5>Available Patients</h5>
            </Card.Header>
            <Card.Body>
              {allPatients.length > 0 ? (
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allPatients.map((patient) => {
                      const patientId = patient._id || patient.id;
                      return (
                        <tr key={patientId}>
                          <td>{patient.profile.firstName} {patient.profile.lastName}</td>
                          <td>
                            {patient.patientInfo?.assignedProvider ? (
                              <Badge bg="success">Assigned</Badge>
                            ) : (
                              <Badge bg="secondary">Unassigned</Badge>
                            )}
                          </td>
                          <td>
                            {!patient.patientInfo?.assignedProvider && (
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => handleAssignPatient(patientId)}
                              >
                                Assign to Me
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              ) : (
                <Alert variant="info">No patients available</Alert>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Header>
              <h5>My Assigned Patients</h5>
            </Card.Header>
            <Card.Body>
              {assignedPatients.length > 0 ? (
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignedPatients.map((patient) => {
                      const patientId = patient._id || patient.id;
                      return (
                        <tr key={patientId}>
                          <td>{patient.profile.firstName} {patient.profile.lastName}</td>
                          <td>
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => openGoalModal(patient)}
                            >
                              Assign Goal
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              ) : (
                <Alert variant="info">No patients assigned yet</Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Assign Goal Modal */}
      <Modal show={showGoalModal} onHide={() => setShowGoalModal(false)}>
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
                onChange={(e) => handleGoalTypeChange(e.target.value)}
              >
                {goalTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Daily Target ({goalForm.unit})</Form.Label>
              <Form.Control
                type="number"
                value={goalForm.dailyTarget}
                onChange={(e) => setGoalForm({...goalForm, dailyTarget: e.target.value})}
                placeholder={Enter daily target in ${goalForm.unit}}
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
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                value={goalForm.endDate}
                onChange={(e) => setGoalForm({...goalForm, endDate: e.target.value})}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={goalForm.notes}
                onChange={(e) => setGoalForm({...goalForm, notes: e.target.value})}
                placeholder="Add any notes or instructions"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowGoalModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAssignGoal}
            disabled={!goalForm.dailyTarget || !goalForm.startDate || !goalForm.endDate}
          >
            Assign Goal
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PatientManagement;