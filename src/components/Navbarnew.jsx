import { Container, Nav, NavDropdown, Navbar } from 'react-bootstrap';

function Navbarnew() {
  return (
    <>
      <Navbar expand="sm" className="bg-body-tertiary shadow navbar mb-5">
        <Container>
          <Navbar.Brand href="#home">SMA Negeri 1 Banjarangkan</Navbar.Brand>
          <Navbar.Toggle
            aria-controls="basic-navbar-nav"
            type="button"
            data-bs-toggle="collapse"
          />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="#home">Home</Nav.Link>
              <Nav.Link href="#link">Link</Nav.Link>
              <NavDropdown title="Dropdown" id="basic-nav-dropdown">
                <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                <NavDropdown.Item href="#action/3.2">
                  Another action
                </NavDropdown.Item>
                <NavDropdown.Item href="#action/3.3">
                  Something
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item href="#action/3.4">
                  Separated link
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default Navbarnew;
