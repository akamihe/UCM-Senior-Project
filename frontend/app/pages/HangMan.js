import React, { Component } from 'react';

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
    this.words = ['hangman', 'senior', 'project', 'elephant', 'penguin'];
  }

  componentDidMount() {
    this.initializeGame();
  }

  initializeGame = () => {
    const randomWord = this.selectRandomWord();
    this.setState({
      word: randomWord,
      displayedWord: randomWord.replace(/[a-zA-Z]/g, '_'),
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
            .map((char) => (this.state.guessedLetters.has(char) ? char : '_'))
            .join('');
          this.setState({ displayedWord: newDisplayedWord }, () => {
            if (!newDisplayedWord.includes('_')) {
              this.setState({ winner: 'You' }, () => {
                this.props.onComplete(); // Call onComplete function from props
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
      <div style={{ width: '400px', margin: 'auto' }}>
        <h1>Hangman</h1>
        <p>Word: {displayedWord}</p>
        <p>Remaining attempts: {remainingAttempts}</p>
        <p>Guessed letters: {Array.from(guessedLetters).join(', ')}</p>
        <form onSubmit={this.handleGuess}>
          <label>
            Enter a letter:
            <input type="text" value={guess} onChange={this.handleGuessChange} maxLength={1} style={{ width: '40px', marginRight: '10px' }} />
          </label>
          <button type="submit">Guess</button>
        </form>
        {winner && <p>Congratulations! You guessed the word!</p>}
        {!winner && remainingAttempts === 0 && <p>Game over! The word was: {this.state.word}</p>}
      </div>
    );
  }
}

export default HangMan;