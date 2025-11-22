import React from 'react';
import { Container, Row, Col, Card, Alert, Badge, ListGroup, Table, ProgressBar } from 'react-bootstrap';
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
    labels: dashboardData?.todayProgress?.map(p => p.goalId?.goalType || 'Goal') || [],
    datasets: [{
      label: 'Progress %',
      data: dashboardData?.todayProgress?.map(p => p.completionPercentage) || [],
      backgroundColor: ['#28a745', '#ffc107', '#dc3545', '#17a2b8', '#6f42c1'],
    }]
  };

  const goalStatusData = {
    labels: ['Completed', 'In Progress', 'Not Started'],
    datasets: [{
      data: [
        dashboardData?.todayProgress?.filter(p => p.achieved).length || 0,
        dashboardData?.todayProgress?.filter(p => !p.achieved && p.actualValue > 0).length || 0,
        dashboardData?.todayProgress?.filter(p => p.actualValue === 0).length || 0
      ],
      backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
    }]
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

  if (isLoading) return <Container className="mt-5"><Alert variant="info">Loading dashboard...</Alert></Container>;
  if (error) return <Container className="mt-5"><Alert variant="danger">Failed to load dashboard</Alert></Container>;

  console.log('Dashboard data:', dashboardData); // Debug log

  return (
    <Container className="mt-4">
      <h2>Dashboard</h2>
      
      {user?.role === 'patient' && (
        <>
          <Row className="mb-4">
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h3 className="text-primary">{dashboardData?.activeGoals || 0}</h3>
                  <p>Active Goals</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h3 className="text-success">
                    {dashboardData?.todayProgress?.filter(p => p.achieved).length || 0}
                  </h3>
                  <p>Goals Achieved Today</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h3 className="text-warning">{dashboardData?.upcomingCare?.length || 0}</h3>
                  <p>Upcoming Checkups</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h3 className="text-info">
                    {dashboardData?.todayProgress?.length ? 
                      Math.round((dashboardData.todayProgress.reduce((acc, p) => acc + p.completionPercentage, 0)) / dashboardData.todayProgress.length) 
                      : 0}%
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
                  {dashboardData?.todayProgress?.length ? (
                    <>
                      <Bar data={progressChartData} options={{ responsive: true }} />
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
                          {dashboardData.todayProgress.map((progress) => (
                            <tr key={progress._id}>
                              <td>{getGoalTypeLabel(progress.goalId?.goalType || '')}</td>
                              <td>{progress.targetValue} {progress.goalId?.unit}</td>
                              <td>{progress.actualValue} {progress.goalId?.unit}</td>
                              <td>
                                <ProgressBar 
                                  now={progress.completionPercentage} 
                                  label={`${Math.round(progress.completionPercentage)}%`}
                                  variant={progress.achieved ? 'success' : 'warning'}
                                />
                              </td>
                              <td>
                                <Badge bg={progress.achieved ? 'success' : 'warning'}>
                                  {progress.achieved ? 'Achieved' : 'In Progress'}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </>
                  ) : (
                    <div>
                      <p>No progress logged for today. Visit the Goals page to log your progress!</p>
                      {dashboardData?.activeGoals === 0 && (
                        <Alert variant="warning">
                          You don't have any active goals yet. Ask your healthcare provider to assign some wellness goals!
                        </Alert>
                      )}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card>
                <Card.Header>Goal Status</Card.Header>
                <Card.Body>
                  {dashboardData?.todayProgress?.length ? (
                    <Doughnut data={goalStatusData} options={{ responsive: true }} />
                  ) : (
                    <div className="text-center">
                      <p>No progress data available</p>
                      <Badge bg="secondary">Start logging your daily progress!</Badge>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col md={12}>
              <Card>
                <Card.Header>My Active Goals & Streaks</Card.Header>
                <Card.Body>
                  {dashboardData?.goalsWithStreaks?.length ? (
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
                        {dashboardData.goalsWithStreaks.map((goal) => (
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
                  ) : (
                    <Alert variant="info">
                      {dashboardData?.activeGoals === 0 ? 
                        "No active goals. Ask your healthcare provider to assign some goals!" :
                        "You have active goals but no progress logged yet. Visit the Goals page to start tracking!"
                      }
                    </Alert>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Card>
                <Card.Header>Upcoming Checkups</Card.Header>
                <Card.Body>
                  {dashboardData?.upcomingCare?.length ? (
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
                    <p>No upcoming checkups scheduled</p>
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