// import React from "react";
"use client";
import sytles from "./HeroSection.module.css";
import { IoIosArrowDown } from "react-icons/io";
import { useEffect, useRef } from "react";
import { motion, useInView, useAnimation } from "framer-motion";
import { Link } from "react-router-dom";

export default function HeroSection() {
  const go = () => {
    let a = document.getElementById("TeamSectionScroll");
    // a.windows.scrollTo({behavior:'smooth', offset})
    if (a) {
      window.scrollTo({ behavior: "smooth", top: a.offsetTop });
    }
  };

  return (
    <div className={sytles.HeroMainSection} id="HeroSectionID">
      <div style={{ width: "100%" }} className={sytles.navbardiv}>
        <div className={sytles.Navbar}>
          <div className={sytles.Nav1}>
            <img className={sytles.LogoPic} src="2.png" />
          </div>
          {/* <div className={sytles.Nav2}></div> */}
          <div className={sytles.Nav3}>
            <Link to={"/game/join"}>
              <button className={sytles.JointheGameBtn}>Join the Game</button>
            </Link>
            <Link to={"/login"}>
              <button className={sytles.LoginBtn}>Login</button>{" "}
            </Link>
            <Link to={"/join"}>
              <button className={sytles.SignUpBtn}>Sign Up</button>{" "}
            </Link>
          </div>
        </div>
      </div>
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 75 },
          visible: { opacity: 1, y: 0 },
        }}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5 }}
      >
        <div className={sytles.HeroData}>
          <div className={sytles.HeroDataInner}>
            <p className={sytles.HeroDataP}>Welcome to Paper Game</p>
            <h1 className={sytles.HeroDataH1}>
              <span style={{ color: "#39B54A" }}> Dive </span> into a world
              filled with games and challenges!
            </h1>
          </div>
        </div>
        <div className={sytles.FooterBtnDiv}>
          <div className={sytles.FooterBtnInner}>
            <Link to={"/Login"}>
              <button className={sytles.FooterBtn1}>Start a Game</button>{" "}
            </Link>
          </div>

          <span className={sytles.ScrollDown} onClick={go}>
            <IoIosArrowDown></IoIosArrowDown>
            <span style={{ color: "white" }}>Scroll Down</span>
          </span>
        </div>
      </motion.div>
    </div>
  );
}
