import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../store/api';
import { useAppDispatch } from '../hooks/redux';
import { setCredentials } from '../store/slices/authSlice';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const result = await login(formData).unwrap();
      dispatch(setCredentials({ user: result.user, token: result.token }));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.data?.error || 'Login failed');
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card>
            <Card.Header>
              <h4>Login</h4>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                </Form.Group>
                <Button type="submit" variant="primary" disabled={isLoading} className="w-100">
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </Form>
              <div className="text-center mt-3">
                <Link to="/register">Don't have an account? Register</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;