// const chalk = require('chalk');
import { v4 as uuid } from "uuid";
import {gameStatus} from '../controller'

let myStorage:Storage;

/**
 * Save scores into the local storage
 * @returns "1" succesfully saved OR -1 if not 
 */
const saveToLocalStorage = () => {
    console.log('saveToLocalStorage')
    try{
      //get the local storage object
      myStorage = window.localStorage;
      // From the Game status get the HTML elements
      const clientID = gameStatus.clientID === undefined ? uuid() : gameStatus.clientID;
      const player = gameStatus.records.player;
      const score = gameStatus.records.score;
      const value2Bstored = `${player},${score}`
      //get user ID
      const keyID = myStorage.getItem(clientID);
      //check if client already exist in the storage list
      //is there is a register within the list of keys in storage
      if(keyID !== null){
        //get the values of the key (name and score)
        //create a new ID for the player
        const newID = uuid()
        //save the string to the local storage
        myStorage.setItem(newID, value2Bstored);
      }else{
        //is not in the list, then its a new record or list is empty
        if(myStorage.length < 1){
          // first record
          myStorage.setItem(clientID, value2Bstored);
          // return 0;      
        }        
        
        myStorage.setItem(clientID, value2Bstored);
      }
      console.log(`Record saved: player:${player}, score:${score}`)
      return 1;
    
    }catch(error){
      console.log('could save data OR denied permissions')
      return -1;
    }
    
}
  
const compareScores = () => {
    // Compare saved scores in Local storage 
    let storage = Object.entries(window.localStorage);
    //create an array so we can sort them later
    let arr:any[] = [];
    // iterate through the LS and add them to the array    
    for(let i=0; i < storage.length; i++){
      arr.push(storage[i])
    }

    // check if there's more than  one value on the array, so we have something to compare
    if ( arr.length <= 1 ) return arr;
    //get the score value and compare it 
    for (let x = 0; x < arr.length; x++) {
      // we reference the first element of the array and compare with the rest of the elements on the array
      let min = x;
      // we start the second loop to compare our reference
      for (let y = x; y < arr.length; y++) {
        //we split our string and make if an array getting only the numerical portion 
        let currScore: any = Array.from(arr[min][1].split(","))[1];
        //parse it to int as it is still a string
        currScore = parseInt(currScore);
        // console.log(currScore);
        let nextScore: any = Array.from(arr[y][1].split(","))[1];
        nextScore = parseInt(nextScore);
        // we will order from highest to lowest so,
        // we compare the current with the next values.
        if (currScore < nextScore) {
          min = y;
        }
      }
      //swap values
      let temp = arr[x];
        arr[x] = arr[min];
      arr[min] = temp;      

    }
    return arr;
}
  
const setScoreTable = (scoreTable:any[])=> {
    try {
      //get the table 
      if(scoreTable.length > 0){
        //get all the HTML elements that we are gonna edit. NAME & SCORE        
        const names = document.querySelectorAll('.ply-name')!;
        const scores = document.querySelectorAll('.top_score')!;
        
        scores.forEach((score,i) => {
          if(scoreTable[i] === null || scoreTable[i] === undefined) return;
          
          let arrScore:any = Array.from(scoreTable[i][1].split(","))[1];          
          score.textContent = arrScore;
        })
        
        names.forEach((name,i) => {
          if(scoreTable[i] === null || scoreTable[i] === undefined) return;
          let arrName:any = Array.from(scoreTable[i][1].split(","))[0];
          name.textContent = arrName.toUpperCase();
        })
        
      }  
      
    } catch (error) {
      console.log('error ' + error)
      return;
    }

      
}

const updateScoresTable = () => {
    const theScores = compareScores();
    //update UI for the records
    setScoreTable(theScores);
    //display the backdrop menu again
       
}

  
export {
  saveToLocalStorage,        
  updateScoresTable  
}