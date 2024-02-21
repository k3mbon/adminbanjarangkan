import PrestasiForm from '../components/PrestasiForm';
import Sidebar from '../components/Sidebar';
import ListPrestasi from '../components/ListPrestasi';
import { Col, Container, Row } from 'react-bootstrap';

const Prestasi = () => {
  return (
    <>
      {' '}
      <Container fluid className="bg-light min-vh-100">
        <Row>
          <Col md="3" className="bg-white min-vh-100">
            <Sidebar />
          </Col>
          <Col className="py-5" md="9">
            <PrestasiForm />
            <ListPrestasi />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Prestasi;
