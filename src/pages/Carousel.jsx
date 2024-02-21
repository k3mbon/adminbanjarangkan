import { Col, Container, Row } from 'react-bootstrap';
import CarouselImage from '../components/CarouselImage';
import Sidebar from '../components/Sidebar';

const Carousel = () => {
  return (
    <Container fluid className="bg-light min-vh-100">
      <Row>
        <Col md="3" className="bg-white min-vh-100">
          <Sidebar />
        </Col>
        <Col className="py-5" md="auto">
          <CarouselImage />
        </Col>
      </Row>
    </Container>
  );
};

export default Carousel;
