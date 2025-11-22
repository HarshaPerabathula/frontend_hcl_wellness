import React from 'react';
import { Container, Row, Col, Card, Alert, Badge, ListGroup } from 'react-bootstrap';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { useGetDashboardQuery } from '../store/api';
import { useAppSelector } from '../hooks/redux';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { data: dashboardData, error, isLoading } = useGetDashboardQuery(undefined, {
    skip: user?.role !== 'patient'
  });

  const progressChartData = {
    labels: dashboardData?.todayProgress.map((_, index) => `Goal ${index + 1}`) || [],
    datasets: [{
      label: 'Progress %',
      data: dashboardData?.todayProgress.map(p => p.completionPercentage) || [],
      backgroundColor: ['#28a745', '#ffc107', '#dc3545', '#17a2b8'],
    }]
  };

  const goalStatusData = {
    labels: ['Completed', 'In Progress', 'Not Started'],
    datasets: [{
      data: [
        dashboardData?.todayProgress.filter(p => p.achieved).length || 0,
        dashboardData?.todayProgress.filter(p => !p.achieved && p.actualValue > 0).length || 0,
        dashboardData?.todayProgress.filter(p => p.actualValue === 0).length || 0
      ],
      backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
    }]
  };

  if (isLoading) return <Container className="mt-5"><Alert variant="info">Loading dashboard...</Alert></Container>;
  if (error) return <Container className="mt-5"><Alert variant="danger">Failed to load dashboard</Alert></Container>;

  return (
    <Container className="mt-4">
      <h2>Dashboard</h2>
      
      {user?.role === 'patient' && (
        <>
          <Row className="mb-4">
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h3 className="text-primary">{dashboardData?.activeGoals}</h3>
                  <p>Active Goals</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h3 className="text-success">
                    {dashboardData?.todayProgress.filter(p => p.achieved).length}
                  </h3>
                  <p>Goals Achieved Today</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h3 className="text-warning">{dashboardData?.upcomingCare.length}</h3>
                  <p>Upcoming Checkups</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h3 className="text-info">
                    {Math.round((dashboardData?.todayProgress?.reduce((acc, p) => acc + p.completionPercentage, 0) || 0) / (dashboardData?.todayProgress?.length || 1))}%
                  </h3>
                  <p>Average Progress</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col md={8}>
              <Card>
                <Card.Header>Today's Progress</Card.Header>
                <Card.Body>
                  {dashboardData?.todayProgress.length ? (
                    <Bar data={progressChartData} options={{ responsive: true }} />
                  ) : (
                    <p>No progress data for today</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card>
                <Card.Header>Goal Status</Card.Header>
                <Card.Body>
                  <Doughnut data={goalStatusData} options={{ responsive: true }} />
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Card>
                <Card.Header>Upcoming Checkups</Card.Header>
                <Card.Body>
                  {dashboardData?.upcomingCare.length ? (
                    <ListGroup variant="flush">
                      {dashboardData.upcomingCare.map((care) => (
                        <ListGroup.Item key={care._id} className="d-flex justify-content-between">
                          <div>
                            <strong>{care.careType.replace('_', ' ')}</strong>
                            <br />
                            <small>{new Date(care.scheduledDate).toLocaleDateString()}</small>
                          </div>
                          <Badge bg={care.priority === 'high' ? 'danger' : care.priority === 'medium' ? 'warning' : 'success'}>
                            {care.priority}
                          </Badge>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  ) : (
                    <p>No upcoming checkups</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card>
                <Card.Header>Health Tip of the Day</Card.Header>
                <Card.Body>
                  {dashboardData?.healthTip ? (
                    <>
                      <h6>{dashboardData.healthTip.title}</h6>
                      <p>{dashboardData.healthTip.content}</p>
                      <Badge bg="info">{dashboardData.healthTip.category}</Badge>
                    </>
                  ) : (
                    <p>No health tip available</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}

      {user?.role === 'provider' && (
        <Row>
          <Col>
            <Card>
              <Card.Header>Provider Dashboard</Card.Header>
              <Card.Body>
                <p>Welcome, Dr. {user.profile.firstName}!</p>
                <p>Use the navigation to manage your patients and assign wellness goals.</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Dashboard;