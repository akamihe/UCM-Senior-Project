"use client";
import styles from "./TeamSection.module.css";
import React, { useEffect, useState, useRef } from "react";
import { BsArrowUpSquareFill } from "react-icons/bs";
import { motion, useInView, useAnimation } from "framer-motion";

export default function TeamSection() {
  const Finding = () => {
    let a = document.getElementById("TeamSectionHR");
    a = a.offsetTop;
    // console.log(a);
  };
  const ScrollUpFunction = () => {
    let c = document.getElementById("HeroSectionID");
    if (c) {
      window.scrollTo({ behavior: "smooth", top: c.offsetTop });
    }
  };
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    // Add event listener when component mounts
    window.addEventListener("scroll", handleScroll);

    // Remove event listener when component unmounts
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []); // Run only once on component mount
  // console.log(scrollY);
  useEffect(() => {
    Finding();
    ScrollUpFunction();
  }, []);

  return (
    <div className={styles.TeamSectionMainDiv} id="TeamSectionScroll">
      <div className={styles.VerticalLine}>
        <div className={styles.WhiteBar}></div>
        <div className={styles.GreenBar}></div>
      </div>
      <div className={styles.HeadingDiv}>
        <p className={styles.OurTeam}>Our Team</p>
        <div className={styles.hr} id="TeamSectionHR">
          <hr />
        </div>
      </div>
      {scrollY > 600 && (
        <div className={styles.ScrollUpBtn} onClick={ScrollUpFunction}>
          <BsArrowUpSquareFill
            className={styles.ScrollUpBtn}
            id="UpButton"
          ></BsArrowUpSquareFill>
        </div>
      )}
      <div className={styles.TeamProfiles}>
        <div className={styles.TeamProfilesInnerFirst}>
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 75 },
              visible: { opacity: 1, y: 0 },
            }}
            initial="hidden"
            whileInView="visible"
            transition={{ duration: 0.5, delay: 0 }}
            className={styles.Profile1}
          >
            <img src="714.png" style={{ width: "100%" }} />
            <h3>James Small</h3>
          </motion.div>
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 75 },
              visible: { opacity: 1, y: 0 },
            }}
            initial="hidden"
            whileInView="visible"
            transition={{ duration: 0.5, delay: 0.5 }}
            className={styles.Profile1}
          >
            <img src="714.png" style={{ width: "100%" }} />
            <h3>Michael Akamihe</h3>
          </motion.div>
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 75 },
              visible: { opacity: 1, y: 0 },
            }}
            initial="hidden"
            whileInView="visible"
            transition={{ duration: 0.5, delay: 1 }}
            className={styles.Profile1}
          >
            <img src="girl.png" style={{ width: "100%" }} />
            <h3>Carly Matro</h3>
          </motion.div>
        </div>
        <div className={styles.TeamProfilesInnerSecond}>
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 75 },
              visible: { opacity: 1, y: 0 },
            }}
            initial="hidden"
            whileInView="visible"
            transition={{ duration: 0.5, delay: 0 }}
            className={styles.Profile1}
          >
            <img src="714.png" style={{ width: "100%" }} />
            <h3>Nicholas Schmiege</h3>
          </motion.div>
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 75 },
              visible: { opacity: 1, y: 0 },
            }}
            initial="hidden"
            whileInView="visible"
            transition={{ duration: 0.5, delay: 0.5 }}
            className={styles.Profile1}
          >
            <img src="714.png" style={{ width: "100%" }} />
            <h3> Milan Maharjan</h3>
          </motion.div>
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 75 },
              visible: { opacity: 1, y: 0 },
            }}
            initial="hidden"
            whileInView="visible"
            transition={{ duration: 0.5, delay: 0.75 }}
            className={styles.Profile1}
          >
            <img src="714.png" style={{ width: "100%" }} />
            <h3>Basheer Mohammed</h3>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
