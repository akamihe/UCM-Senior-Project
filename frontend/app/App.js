"use client"

import {Container} from 'react-bootstrap';
import {Route, BrowserRouter, Routes} from 'react-router-dom'
import Header from './components/Header'
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';
import ActiveGame from './pages/GameHandler'
import SetupGame from './pages/SetupGame'
import GameJoin from './pages/GameJoin'
import WaitingRoom from './pages/debug/WaitingRoom'
import Game from './pages/debug/Game'
import AuthService from './services/AuthService';
import './App.css';

import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

function Authenticated() {
  return <>
  <Routes>
     {AuthService.isGameAuth() && <Route path="/game/active" element={<ActiveGame />}/>}
     {(!AuthService.isLoggedIn() &&
         <>
           <Route path="/join" element={<SignUp />}/>
           <Route path="/game/join" element={<GameJoin />}/>
           <Route path="/waiting-room" element={<WaitingRoom />} />
           <Route path="/game" element={<Game />} />
           <Route path="*"  element={<Login />}/>
         </>
     ) ||
         <>
           <Route path="/game/setup" element={<SetupGame />}/>
         </>
     }
   </Routes>
 </>
}

export default function App() {
  return (
    <div style={{height: "100vh", display: "flex", flexDirection: "column"}}>
      <BrowserRouter>
        <Header/>
        <Container className={inter.className} style={{ padding: 0, flex: 1, maxWidth: "none", overflow: "hidden" }}>
          <Authenticated/>
        </Container>    
      </BrowserRouter>
    </div>
  );
}