import React from 'react'
import Sidebar from '../components/Sidebar'
import GalleryForm from '../components/GalleryForm'
import ListAlbumFoto from '../components/ListAlbumFoto'
import { Col, Container, Row } from 'react-bootstrap';

const Galeri = () => {
  return (
    <Container fluid className="bg-light min-vh-100">
        <Row>
          <Col md="3" className="bg-white min-vh-100">
            <Sidebar />
          </Col>
          <Col className="py-5" md="auto">
            <GalleryForm />
            <ListAlbumFoto />
          </Col>
        </Row>
      </Container>
  )
}

export default Galeri