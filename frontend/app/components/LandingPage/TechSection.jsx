import React from "react";
import styles from "./TechSection.module.css";
import { motion } from "framer-motion";
export default function TechSection() {
  return (
    <div className={styles.TechSectionMainDiv} style={{ overflow: "hidden" }}>
      <h1
        style={{
          color: "#39B54A",
          textAlign: "center",
          fontSize: "42px",
          fontWeight: "700",
          borderBottom:"4px solid #39b54A",
          width:"fit-content",
          paddingBottom:"1rem",
          margin:'auto'
        }}
      >
        TECH STACK
      </h1>
      <div className={styles.TechSectionInnerDiv}>
        <div style={{ width: "50%" }}>
          <h4>Frontend </h4>
          <ul>
            <li> React.js</li>
            <li> Using socket to communicate game data with backend. </li>
            <li>
              Handles most of the UI for games, which is swapped based on
              backend{" "}
            </li>{" "}
          </ul>
          <br />
          <h4>Backend</h4>
          <ul>
            <li>Java Spring </li>
            <li>
              Using Socket-spring library to communicate game data with frontend{" "}
            </li>
            <li> In memory handling for Games </li>
            <li> Saved data for users, and game history </li>
          </ul>
        </div>
        {/* <div className={styles.line}></div> */}
        <motion.div
          style={{ width: "50%" }}
          variants={{
            hidden: { opacity: 0, x: 75 },
            visible: { opacity: 1, x: 0 },
          }}
          initial="hidden"
          whileInView="visible"
          transition={{ duration: 0.5, delay: 0 }}
        >
          <img src="pattern.png" className={styles.imagePattern} alt="" />
        </motion.div>
      </div>
    </div>
  );
}
