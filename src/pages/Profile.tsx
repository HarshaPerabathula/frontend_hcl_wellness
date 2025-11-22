import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Badge } from 'react-bootstrap';
import { userAPI } from '../services/api';
import { getUser, setUser } from '../utils/auth';
import { User } from '../types';

const Profile: React.FC = () => {
  const [user, setUserState] = useState<User | null>(getUser());
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    allergies: [] as string[],
    medications: [] as string[],
    emergencyContact: { name: '', phone: '' }
  });
  const [newAllergy, setNewAllergy] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.profile.firstName || '',
        lastName: user.profile.lastName || '',
        phone: user.profile.phone || '',
        allergies: user.patientInfo?.allergies || [],
        medications: user.patientInfo?.medications || [],
        emergencyContact: user.patientInfo?.emergencyContact || { name: '', phone: '' }
      });
    }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      const userData = response.data;
      setUserState(userData);
      setUser(userData);
      
      setFormData({
        firstName: userData.profile.firstName || '',
        lastName: userData.profile.lastName || '',
        phone: userData.profile.phone || '',
        allergies: userData.patientInfo?.allergies || [],
        medications: userData.patientInfo?.medications || [],
        emergencyContact: userData.patientInfo?.emergencyContact || { name: '', phone: '' }
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load profile');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await userAPI.updateProfile(formData);
      setSuccess('Profile updated successfully');
      fetchProfile();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const addAllergy = () => {
    if (newAllergy.trim() && !formData.allergies.includes(newAllergy.trim())) {
      setFormData({
        ...formData,
        allergies: [...formData.allergies, newAllergy.trim()]
      });
      setNewAllergy('');
    }
  };

  const removeAllergy = (allergy: string) => {
    setFormData({
      ...formData,
      allergies: formData.allergies.filter(a => a !== allergy)
    });
  };

  const addMedication = () => {
    if (newMedication.trim() && !formData.medications.includes(newMedication.trim())) {
      setFormData({
        ...formData,
        medications: [...formData.medications, newMedication.trim()]
      });
      setNewMedication('');
    }
  };

  const removeMedication = (medication: string) => {
    setFormData({
      ...formData,
      medications: formData.medications.filter(m => m !== medication)
    });
  };

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Header>
              <h4>Profile Information</h4>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>First Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-light"
                  />
                  <Form.Text className="text-muted">
                    Email cannot be changed
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <Form.Control
                    type="text"
                    value={user?.role || ''}
                    disabled
                    className="bg-light"
                  />
                </Form.Group>

                {user?.role === 'patient' && (
                  <>
                    <hr />
                    <h5>Health Information</h5>

                    <Form.Group className="mb-3">
                      <Form.Label>Allergies</Form.Label>
                      <div className="mb-2">
                        {formData.allergies.map((allergy, index) => (
                          <Badge 
                            key={index} 
                            bg="warning" 
                            className="me-2 mb-1"
                            style={{ cursor: 'pointer' }}
                            onClick={() => removeAllergy(allergy)}
                          >
                            {allergy} ×
                          </Badge>
                        ))}
                      </div>
                      <div className="d-flex">
                        <Form.Control
                          type="text"
                          placeholder="Add new allergy"
                          value={newAllergy}
                          onChange={(e) => setNewAllergy(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
                        />
                        <Button 
                          variant="outline-primary" 
                          className="ms-2"
                          onClick={addAllergy}
                          type="button"
                        >
                          Add
                        </Button>
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Current Medications</Form.Label>
                      <div className="mb-2">
                        {formData.medications.map((medication, index) => (
                          <Badge 
                            key={index} 
                            bg="info" 
                            className="me-2 mb-1"
                            style={{ cursor: 'pointer' }}
                            onClick={() => removeMedication(medication)}
                          >
                            {medication} ×
                          </Badge>
                        ))}
                      </div>
                      <div className="d-flex">
                        <Form.Control
                          type="text"
                          placeholder="Add new medication"
                          value={newMedication}
                          onChange={(e) => setNewMedication(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMedication())}
                        />
                        <Button 
                          variant="outline-primary" 
                          className="ms-2"
                          onClick={addMedication}
                          type="button"
                        >
                          Add
                        </Button>
                      </div>
                    </Form.Group>

                    <hr />
                    <h5>Emergency Contact</h5>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Contact Name</Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.emergencyContact.name}
                            onChange={(e) => setFormData({
                              ...formData,
                              emergencyContact: {
                                ...formData.emergencyContact,
                                name: e.target.value
                              }
                            })}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Contact Phone</Form.Label>
                          <Form.Control
                            type="tel"
                            value={formData.emergencyContact.phone}
                            onChange={(e) => setFormData({
                              ...formData,
                              emergencyContact: {
                                ...formData.emergencyContact,
                                phone: e.target.value
                              }
                            })}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </>
                )}

                {user?.role === 'provider' && user.providerInfo && (
                  <>
                    <hr />
                    <h5>Provider Information</h5>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>License Number</Form.Label>
                      <Form.Control
                        type="text"
                        value={user.providerInfo.licenseNumber}
                        disabled
                        className="bg-light"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Specialization</Form.Label>
                      <Form.Control
                        type="text"
                        value={user.providerInfo.specialization}
                        disabled
                        className="bg-light"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Assigned Patients</Form.Label>
                      <Form.Control
                        type="text"
                        value={`${user.providerInfo.patients.length} patients`}
                        disabled
                        className="bg-light"
                      />
                    </Form.Group>
                  </>
                )}

                <Button type="submit" variant="primary" disabled={loading} className="w-100">
                  {loading ? 'Updating...' : 'Update Profile'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;