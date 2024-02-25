"use client"
import React from 'react';

import './App.css';
import Header from './components/Header'
import {Container} from 'react-bootstrap';
import Login from './pages/auth/Login';
import Join from './pages/auth/Join';
import Debug from './pages/debug/debug'
import GameDebug from './pages/game/Debug'
import ActiveGame from './pages/game/GameHandler'
import SetupGame from './pages/game/SetupGame'
import GameJoin from './pages/auth/GameJoin'
import WaitingRoom from './pages/WaitingRoom'
import Game from './pages/Game'
import {Route, BrowserRouter, Routes} from 'react-router-dom'
import AuthService from './services/AuthService';

import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });


function Authenticated() {
  return <>
  <Routes>
     {AuthService.isGameAuth() &&
         <>
           <Route path="/game/debug" element={<GameDebug />}/>
           <Route path="/game/active" element={<ActiveGame />}/>
         </>
     }
     {(!AuthService.isLoggedIn() &&
         <>
           <Route path="/join" element={<Join />}/>
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