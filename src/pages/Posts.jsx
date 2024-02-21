import { Col, Container, Row } from 'react-bootstrap';
import PostsList from '../components/PostsList';
import Sidebar from '../components/Sidebar';

const Posts = () => {
  return (
    <>
      {' '}
      <Container fluid className="bg-light min-vh-100">
        <Row>
          <Col md="3" className="bg-white min-vh-100">
            <Sidebar />
          </Col>
          <Col className="py-5" md="9">
            <PostsList />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Posts;
