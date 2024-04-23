"use client";
import { motion } from "framer-motion";
import styles from "./AboutTheGameStyles.module.css";
import { Link } from "react-router-dom";

export default function AboutTheGame() {
  return (
    <div className={styles.AbooutGameMainDiv}>
      <div className={styles.AbooutGameInnerDiv}>
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 75 },
            visible: { opacity: 1, y: 0 },
          }}
          initial="hidden"
          whileInView="visible"
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <p className={styles.AboutGameHeading}>About the Paper Game</p>
        </motion.div>
        <div className={styles.hr}>
          <hr />
        </div>
        <p className={styles.AbooutTheGame1stP}>
          Welcome to Paper Game, your gateway to an extraordinary gaming
          universe! As part of our senior project, we've crafted a
          groundbreaking gaming experience that combines classic favorites like
          Battleship, Pictionary, and Sudoku into one seamless
          adventure. <br /> <br /> Designed with innovation in mind, paper game
          offers a unique multiplayer platform where players can log in, create
          a personalized game room, and generate a unique room code to share
          with friends. Invite your pals to join your gaming realm and embark on
          thrilling challenges together!
        </p>
        <br />
        <p className={styles.AbooutTheGame2ndP}>
          Whether you're strategizing in Battleship, challenging your friends in Pictionary
          or solving puzzles in
          Sudoku, paper game promises endless excitement and camaraderie. Join
          us on this epic gaming journey and be a part of the Paper game
          community. Ready to level up your gaming experience?
        </p>
        <Link to={"/game/join"}>
          {" "}
          <p className={styles.AbooutTheGame3rdP}>Let the game begin!</p>{" "}
        </Link>
      </div>
    </div>
  );
}
