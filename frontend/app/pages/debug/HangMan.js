import { relative } from 'path';
import React, { Component } from 'react';
import HangMan0 from "./HangMan0.png";
import HangMan1 from "./HangMan1.png";
import HangMan2 from "./HangMan2.png";
import HangMan3 from "./HangMan3.png";
import HangMan4 from "./HangMan4.png";
import HangMan5 from "./HangMan5.png";
import HangMan6 from "./HangMan6.png";

class HangMan extends Component {
  constructor(props) {
    super(props);
    this.state = {
      word: '',
      displayedWord: '',
      guessedLetters: new Set(),
      remainingAttempts: 6,
      winner: null,
      guess: ''
    };
    this.words = ['hangman', 'senior', 'project', 'elephant', 'penguin', 'mules', 'jennies', 'wifi', 'innovation', 'campus', 'software', 'engineering'];
  }

  componentDidMount() {
    this.initializeGame();
  }

  initializeGame = () => {
    const randomWord = this.selectRandomWord();
    this.setState({
      word: randomWord,
      displayedWord: randomWord.replace(/[a-zA-Z]/g, '-'),
      guessedLetters: new Set(),
      remainingAttempts: 6,
      winner: null,
      guess: ''
    });
  };

  selectRandomWord = () => {
    const randomIndex = Math.floor(Math.random() * this.words.length);
    return this.words[randomIndex];
  };

  handleGuessChange = (event) => {
    this.setState({ guess: event.target.value });
  };

  handleGuess = (event) => {
    event.preventDefault();
    const { remainingAttempts, guessedLetters, word, guess } = this.state;
    if (remainingAttempts > 0 && !guessedLetters.has(guess)) {
      const updatedGuessedLetters = new Set(guessedLetters);
      updatedGuessedLetters.add(guess);
      this.setState({ guessedLetters: updatedGuessedLetters, guess: '' }, () => {
        if (word.includes(guess)) {
          const newDisplayedWord = word
            .split('')
            .map((char) => (this.state.guessedLetters.has(char) ? char : '-'))
            .join('');
          this.setState({ displayedWord: newDisplayedWord }, () => {
            if (!newDisplayedWord.includes('-')) {
              this.setState({ winner: 'You' }, () => {
                this.props.onComplete();
              });
            }
          });
        } else {
          this.setState((prevState) => ({ remainingAttempts: prevState.remainingAttempts - 1 }));
        }
      });
    }
  };

  render() {
    const { displayedWord, guessedLetters, remainingAttempts, winner, guess } = this.state;

    return (
    <div style={{ width: '500px'}}>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h1>Hangman</h1>
        <p>Word: {displayedWord}</p>
        <p>Remaining attempts: {remainingAttempts}</p>
        <p>Guessed letters: {Array.from(guessedLetters).join(', ')}</p>
        <form onSubmit={this.handleGuess}>
          <label>
            Enter a letter:
            <input type="text" value={guess} onChange={this.handleGuessChange} maxLength={1} style={{ border: "solid", borderColor: "gray", width: '50px', marginRight: '5px', marginLeft: '5px' }} />
          </label>
          <button type="submit" style={{ border: "solid", borderRadius: '15%', borderColor: '#a6a6a6', width: '55px', backgroundColor: '#d9d9d9'}}>Guess</button>
        </form>
        {winner && <p style={{ color: '#00cc00', fontWeight: "bold" }}>Congratulations! You guessed the word!</p>}
        {!winner && remainingAttempts === 0 && <p style={{ color: '#cc0000', fontWeight: "bold" }}>Game over! The word was: {this.state.word}</p>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'row-reverse', alignContent: "right", justifyContent: "right"}}>
        {remainingAttempts === 0 && <img src={HangMan0} width={15} height={25} />}
        {remainingAttempts === 1 && <img src={HangMan1} style={{ width: '10px', height: '20px'}} />}
        {remainingAttempts === 2 && <img src={HangMan2} style={{ width: '10px', height: '20px'}} />}
        {remainingAttempts === 3 && <img src={HangMan3} style={{ width: '10px', height: '20px'}} />}
        {remainingAttempts === 4 && <img src={HangMan4} style={{ width: '10px', height: '20px'}} />}
        {remainingAttempts === 5 && <img src={HangMan5} style={{ width: '10px', height: '20px'}} />}
        {remainingAttempts === 6 && <img src={HangMan6} width={20} height={30} />}
        </div>

      </div>
    );
  }
}

export default HangMan;