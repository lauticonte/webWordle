import RowCompleted from "./rowCompleted";
import RowEmpty from "./rowEmpty";
import RowCurrent from "./rowCurrent";
import { useEffect, useState } from "react";
import { GameStatus } from "./types";
import { useWindow } from "../hooks/useWindow";
import { getWordOfTheDay, isValidWord } from "../service/request";
import Modal from "./modal";

import styles from "./wordle.module.scss";

const keys = [
    "Q",
    "W",
    "E",
    "R",
    "T",
    "Y",
    "U",
    "I",
    "O",
    "P",
    "A",
    "S",
    "D",
    "F",
    "G",
    "H",
    "J",
    "K",
    "L",
    "Ñ",
    "Z",
    "X",
    "C",
    "V",
    "B",
    "N",
    "M",
  ];

export default function Wordle() {
    const [wordOfTheDay, setWordOfTheDay] = useState<string>("");
    const [turn, setTurn] = useState<number>(1);
    const [currentWord, setCurrentWord] = useState<string>("");
    const [completedWords, setCompletedWords] = useState<string[]>([]);
    const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.Playing);

    useWindow('keydown', handleKeyDown);

    useEffect(() => {
        setWordOfTheDay(getWordOfTheDay());
    }, []);

    function handleKeyDown(event: KeyboardEvent){
        const letter = event.key.toUpperCase();

        if (gameStatus !== GameStatus.Playing) {
            return;
        }

        if(event.key === 'Backspace' && currentWord.length > 0){
                onDelete();
            return;
        }
        if(event.key === 'Enter' && currentWord.length === 5 && turn <= 6){
                onEnter();
            return;
        }
        if(currentWord.length >= 5) return;
        
        //ingresar letra al estado
        if(keys.includes(letter)){
                onInput(letter);
            return;
        }
    }

    function onInput(letter: string){
        const newWord = currentWord + letter;
        setCurrentWord(newWord);
    }

    function onDelete(){
        const newWord = currentWord.slice(0, -1);
        setCurrentWord(newWord);
    }

    async function onEnter(){
        if(currentWord === wordOfTheDay){
            //gano el usuario
            setCompletedWords([...completedWords, currentWord]);
            setGameStatus(GameStatus.Won);
            return;
        }

        if(turn === 6){
            //perdio el usuario
            setCompletedWords([...completedWords, currentWord]);
            setGameStatus(GameStatus.Lost);
            return;
        }

        //validar si existe palabra
        const validWord = await isValidWord(currentWord);

        if(currentWord.length === 5 && !validWord) {
            alert("Not a valid word");
            return;
        }

        setCompletedWords([...completedWords, currentWord]);
        setTurn(turn + 1);
        setCurrentWord("");
    }

    

    return (
        <>
        {gameStatus === GameStatus.Won ? (
            <Modal
            type="won"
            completedWords={completedWords}
            solution={wordOfTheDay}
            />
      ) : gameStatus === GameStatus.Lost ? (
            <Modal
            type="lost"
            completedWords={completedWords}
            solution={wordOfTheDay}
            />
      ) : null}

    <div className={styles.mainContainer}>
        {completedWords.map((word, i) => (
            <RowCompleted word={word} solution={wordOfTheDay} />
        ))}

        {gameStatus === GameStatus.Playing ? (
            <RowCurrent word={currentWord}/> ) : null}
        
        {Array.from(Array(6 - turn)).map((_,i) => (
            <RowEmpty key={i} />
        ))}
        
    </div>
    </>
    );
}