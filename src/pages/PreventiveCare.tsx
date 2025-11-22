import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Alert, Table, Badge } from 'react-bootstrap';
import { preventiveCareAPI } from '../services/api';
import { PreventiveCare } from '../types';

const PreventiveCarePage: React.FC = () => {
  const [appointments, setAppointments] = useState<PreventiveCare[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [appointmentForm, setAppointmentForm] = useState({
    careType: 'annual_checkup',
    scheduledDate: '',
    priority: 'medium',
    notes: ''
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await preventiveCareAPI.getSchedule();
      setAppointments(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async () => {
    try {
      await preventiveCareAPI.bookCheckup({
        ...appointmentForm,
        scheduledDate: new Date(appointmentForm.scheduledDate).toISOString()
      });
      
      setShowModal(false);
      fetchAppointments();
      
      // Reset form
      setAppointmentForm({
        careType: 'annual_checkup',
        scheduledDate: '',
        priority: 'medium',
        notes: ''
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to book appointment');
    }
  };

  const handleMarkCompleted = async (appointmentId: string) => {
    try {
      await preventiveCareAPI.markCompleted(appointmentId, {
        completedDate: new Date().toISOString(),
        notes: 'Completed successfully'
      });
      fetchAppointments();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to mark as completed');
    }
  };

  const getCareTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      annual_checkup: 'Annual Checkup',
      blood_test: 'Blood Test',
      vaccination: 'Vaccination',
      mammogram: 'Mammogram',
      colonoscopy: 'Colonoscopy'
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: string } = {
      scheduled: 'primary',
      completed: 'success',
      missed: 'danger',
      overdue: 'warning'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const variants: { [key: string]: string } = {
      high: 'danger',
      medium: 'warning',
      low: 'success'
    };
    return <Badge bg={variants[priority] || 'secondary'}>{priority}</Badge>;
  };

  if (loading) return <Container className="mt-5"><Alert variant="info">Loading appointments...</Alert></Container>;

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Preventive Care</h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          Book New Checkup
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-primary">
                {appointments.filter(a => a.status === 'scheduled').length}
              </h4>
              <p>Scheduled</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-success">
                {appointments.filter(a => a.status === 'completed').length}
              </h4>
              <p>Completed</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-warning">
                {appointments.filter(a => a.status === 'overdue').length}
              </h4>
              <p>Overdue</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-danger">
                {appointments.filter(a => a.status === 'missed').length}
              </h4>
              <p>Missed</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card>
        <Card.Header>
          <h5>My Appointments</h5>
        </Card.Header>
        <Card.Body>
          {appointments.length > 0 ? (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Care Type</th>
                  <th>Scheduled Date</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment._id}>
                    <td>{getCareTypeLabel(appointment.careType)}</td>
                    <td>{new Date(appointment.scheduledDate).toLocaleDateString()}</td>
                    <td>{getStatusBadge(appointment.status)}</td>
                    <td>{getPriorityBadge(appointment.priority)}</td>
                    <td>{appointment.notes || '-'}</td>
                    <td>
                      {appointment.status === 'scheduled' && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleMarkCompleted(appointment._id)}
                        >
                          Mark Completed
                        </Button>
                      )}
                      {appointment.status === 'completed' && appointment.completedDate && (
                        <small className="text-muted">
                          Completed: {new Date(appointment.completedDate).toLocaleDateString()}
                        </small>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <Alert variant="info">
              No appointments scheduled. Book your first checkup to get started!
            </Alert>
          )}
        </Card.Body>
      </Card>

      {/* Book Appointment Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Book New Checkup</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Care Type</Form.Label>
              <Form.Select
                value={appointmentForm.careType}
                onChange={(e) => setAppointmentForm({...appointmentForm, careType: e.target.value})}
              >
                <option value="annual_checkup">Annual Checkup</option>
                <option value="blood_test">Blood Test</option>
                <option value="vaccination">Vaccination</option>
                <option value="mammogram">Mammogram</option>
                <option value="colonoscopy">Colonoscopy</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Scheduled Date</Form.Label>
              <Form.Control
                type="datetime-local"
                value={appointmentForm.scheduledDate}
                onChange={(e) => setAppointmentForm({...appointmentForm, scheduledDate: e.target.value})}
                min={new Date().toISOString().slice(0, 16)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Priority</Form.Label>
              <Form.Select
                value={appointmentForm.priority}
                onChange={(e) => setAppointmentForm({...appointmentForm, priority: e.target.value})}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Notes (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={appointmentForm.notes}
                onChange={(e) => setAppointmentForm({...appointmentForm, notes: e.target.value})}
                placeholder="Add any special instructions or notes"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleBookAppointment}
            disabled={!appointmentForm.scheduledDate}
          >
            Book Appointment
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PreventiveCarePage;