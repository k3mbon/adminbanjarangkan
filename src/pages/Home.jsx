import Sidebar from '../components/Sidebar';
import BlogPosts from './BlogPosts';
import DocumentList from '../components/DocumentList';
import { Col, Container, Row } from 'react-bootstrap';

const Home = () => {
  return (
    <>
      <Container fluid className="bg-light min-vh-100">
        <Row>
          <Col md="3" className="bg-white min-vh-100">
            <Sidebar />
          </Col>
          <Col className="py-5" md="auto">
            <BlogPosts />
            <DocumentList />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Home;
