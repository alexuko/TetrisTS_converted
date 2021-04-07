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
        console.log(`Same connection, new record: player:${player}, score:${score}`)        
      }else{
        //is not in the list, then its a new record or list is empty
        if(myStorage.length < 1){
          // first record
          myStorage.setItem(clientID, value2Bstored);
          console.log(`First record saved: player:${player}, score:${score}`)
          return 0;      
        }        
        
        myStorage.setItem(clientID, value2Bstored);
        console.log(`Record saved: player:${player}, score:${score}`)
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
    //get the score value and compare it 
    arr.forEach((el,idx) => {
      let name:any = Array.from(el[1].split(','))[0];
      let score:any = Array.from(el[1].split(','))[1];
          score = parseInt(score);
          console.log(score);
          // de aqui en adelante hay que darle.
    
    })

  }

  
  const updateScoreTable = ()=> {
    //get the storage 
    try {
      if(window.localStorage.length >= 1){
        let storage = Object.entries(window.localStorage);
        //get the UI fields to update
        
        const names = document.querySelectorAll('.ply-name')!;
        const scores = document.querySelectorAll('.top_score')!;
        console.log(names.length)
        //names
        // debugger;
        scores.forEach((score,i) => {
          let storagePosition = storage[i];

          if(storagePosition === null || storagePosition === undefined){
            return;            
          } 
          let playerScore = JSON.parse(storagePosition[1])._score;
          console.log(playerScore)      
          score.textContent = playerScore.toString();
        })
        
        names.forEach((name,i) => {
          let storagePosition = storage[i]; 
          if(storagePosition === null || storagePosition === undefined){
            return;            
          }
          let player = JSON.parse(storagePosition[1])._player;   
          console.log(player)
          name.textContent = `${player}`;
        })
        //scores
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