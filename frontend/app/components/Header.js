import { Container, Nav, Navbar } from 'react-bootstrap';
import {Link} from 'react-router-dom';

import AuthService from '/app/services/AuthService';

function Options() {
  if(AuthService.isLoggedIn() || AuthService.isGameAuth()) {
    return <>
      <Nav className="flex col-12">
        <Link 
          to ="/debug" onClick={() => window.location.href = "/debug"}
          className="navbar-brand"
        >
          TODO, ADD LINK HERE
        </Link>
        <Link 
          to="#" 
          onClick={() => AuthService.logout()} 
          className="nav-link" 
          style={{ marginLeft: "auto" }}
        >
          Logout
        </Link>
      </Nav>
   </>
  }
  else {
    return <>
      <Nav className="me-auto">
        <Link to ="/join" className = "navbar-brand">Sign-up</Link>
        <Link to ="/login"  className = "navbar-brand">Login</Link>
        <Link to ="/game/join"  className = "navbar-brand">Join Game</Link>
        <Link to ="/waiting-room"  className = "navbar-brand">Waiting Room</Link>
      </Nav>
    </>
  }
}
function App() {
     //*!-- FIXME -- to attribute not working, using onclick, please change back to the attribute of to only with proper refresh, #ASK TEACHER!!
  return <>
      <Navbar bg="success" variant="dark" id="main-navbar">
        <Container>
          <Options />
        </Container>
      </Navbar>
    </>
}

export default App;