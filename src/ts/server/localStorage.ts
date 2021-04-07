// const chalk = require('chalk');
import { v4 as uuid } from "uuid";
import {gameStatus} from '../app'

let myStorage:Storage;

const saveToLocalStorage = () => {
    try{
      //get the local storage object
      myStorage = window.localStorage;
      const clientID = gameStatus.clientID;
      const player = gameStatus.records.player;
      const score = gameStatus.records.score;
      const value2Bstored = `${player},${score}`
      //check if client already exist in the storage list
      const keyID = myStorage.getItem(clientID);

      //is there is a register within the list of keys in storage
      if(keyID !== null){
        //get the values of the key (name and score)
        const newID = uuid()
        myStorage.setItem(newID, value2Bstored);
        // console.log(`Same connection, new record: player:${player}, score:${score}`)        
      }else{
        //is not in the list, then its a new record or list is empty
        if(myStorage.length < 1){
          // first record
          myStorage.setItem(clientID, value2Bstored);
          // console.log(`First record saved: player:${player}, score:${score}`)
          // return 0;      
        }        
        
        myStorage.setItem(clientID, value2Bstored);
        // console.log(`Record saved: player:${player}, score:${score}`)
      }
      return 1
    
    }catch(error){
      console.log('could save data OR denied permissions')
      return -1;
    }
    
  }
  
const compareScores = () => {
    console.log('comparing...')
    let storage = Object.entries(window.localStorage);
    let arr:any[] = [];

    for(let i=0; i < storage.length; i++){
      arr.push(storage[i])
    }
    // check if there's only one value on the array
    if ( arr.length <= 1 ) return arr;

    //get the score value and compare it 
    for (let x = 0; x < arr.length; x++) {
      let min = x;
      // de aqui en adelante hay que darle.
      for (let y = x; y < arr.length; y++) {
        let currScore: any = Array.from(arr[min][1].split(","))[1];
        currScore = parseInt(currScore);
        // console.log(currScore);
        let nextScore: any = Array.from(arr[y][1].split(","))[1];
        nextScore = parseInt(nextScore);

        if (currScore < nextScore) {
          min = y;
        }
      }
      //swap values
      // console.log('swap')
      let temp = arr[x];
        arr[x] = arr[min];
      arr[min] = temp;
      

    }
    // console.log('completed')
    return arr;
  }

  
  const updateScoreTable = (scoreTable:any[])=> {
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
  
  export {
      saveToLocalStorage,
      compareScores,    
      updateScoreTable  
  }