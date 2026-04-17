import { Boot } from './scenes/Boot.js';
//import { Game_1st_grade_addition }  from './scenes/Game_1st_grade_addition.js';
//import { Game_1st_grade_subtraction }  from './scenes/Game_1st_grade_subtraction.js';

//import { Game_2nd_grade_addition } from './scenes/Game_2nd_grade_addition.js';
//import { Game_2nd_grade_subtraction }  from './scenes/Game_2nd_grade_subtraction.js';
//import { Game_2nd_grade_multiplication }  from './scenes/Game_2nd_grade_multiplication.js';
//import { Game_2nd_grade_placevalues } from './scenes/Game_2nd_grade_placevalues.js';
//import { Game_2nd_grade_fillInTheBlank } from './scenes/Game_2nd_grade_fillInTheBlank.js'

import {assetsTest} from './scenes/assetsTest.js'

import { Preloader } from './scenes/Preloader.js';


const config = {
    type: Phaser.AUTO,
    width: 1536,
    height: 793,
    parent: 'game-container',
    backgroundColor: '#028af8',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 500 }
        }
    },

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },//PUT COMMONS BEFORE THE NEXT STATEMENT

    scene: [
        Boot,
        Preloader,
        //Game_1st_grade_addition,
        //Game_1st_grade_subtraction,
        //Game_2nd_grade_addition,
        //Game_2nd_grade_multiplication,
        //Game_2nd_grade_placevalues,
        //Game_2nd_grade_fillInTheBlank,
        assetsTest,
    ],

    physics: {
    default: 'arcade',
    arcade: {
        debug:true 
    }
    } 
};

new Phaser.Game(config);