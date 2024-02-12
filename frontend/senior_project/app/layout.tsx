"use client"
import React from 'react';

import './App.css';
import Header from './components/Header'
import {Container} from 'react-bootstrap';
import Login from './pages/auth/Login';
import Join from './pages/auth/Join';
import Debug from './pages/debug/debug'
import {Route, BrowserRouter, Routes} from 'react-router-dom'
import AuthService from './services/AuthService';

import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });


function Authenticated() {
  if(!AuthService.isLoggedIn()) {
    return <>
      <Routes>
        <Route path="/join" element={<Join />}/>
        <Route path="*"  element={<Login />}/>
      </Routes>
    </>
  }
  else {
   return <>
   <Routes>
      <Route path="*"  element={<Debug />}/>
   </Routes>
    </>
  }
}

export default function App() {
  return (
    <html lang="en">
      <head>
        <title>Senior Project App, Paper game</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.4.1/dist/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossOrigin="anonymous"></link>
      </head>
      <body className={inter.className}>
        <div style={{height: "100vh", display: "flex", flexDirection: "column"}}>
          <BrowserRouter>
            <Header/>
            <Container style={{flex: 1}}>
              <Authenticated/>
            </Container>    
          </BrowserRouter>
        </div>
        </body>
    </html>
  );
}

