"use strict";
//configuration of the checkboard
var positions={
    "A":["A","wr","wp","","","","","bp","br"],
    "B":["B","wn","wp","","","","","bp","bn"],
    "C":["C","wb","wp","","","","","bp","bb"],
    "D":["D","wq","wp","","","","","bp","bq"],
    "E":["E","wk","wp","","","","","bp","bk"],
    "F":["F","wb","wp","","","","","bp","bb"],
    "G":["G","wn","wp","","","","","bp","bn"],
    "H":["H","wr","wp","","","","","bp","br"],
    "-1":[" ","1","2","3","4","5","6","7","8"]
};

var move_list = [];
move_list[0] = {
    "A":["A","wr","wp","","","","","bp","br"],
    "B":["B","wn","wp","","","","","bp","bn"],
    "C":["C","wb","wp","","","","","bp","bb"],
    "D":["D","wq","wp","","","","","bp","bq"],
    "E":["E","wk","wp","","","","","bp","bk"],
    "F":["F","wb","wp","","","","","bp","bb"],
    "G":["G","wn","wp","","","","","bp","bn"],
    "H":["H","wr","wp","","","","","bp","br"],
    "-1":[" ","1","2","3","4","5","6","7","8"]
};
var move_index = 0;

//say if the pawn is at its first move (so it is able to move 2 cells)
var pawnsfirstmove ={
    "w":[true,true,true,true,true,true,true,true],
    "b":[true,true,true,true,true,true,true,true],
}

//when a pawn move by 2 cells save its position to calculate en passant move
var enpassantable = "";

//save if a king can castle
var cancastle = {
    "w":[true,true],
    "b":[true,true]
}

//given a starting col and an offset calculate new col
function calculateNewCol(oldcol,offset){
    return String.fromCharCode(parseInt(oldcol.charCodeAt(0))+offset);
}

function removeCircles(legalmoves){
    legalmoves.forEach(element => {
        var newimage ="";
        var image = positions[element[0]][parseInt(element[1])];
        /*switch(image){
            case "":{newimage="/static/imgs/empty.png";break;}

            case "br":{newimage="/static/imgs/br.png";break;}
            case "wr":{newimage="/static/imgs/wr.png";break;}

            case "bn":{newimage="/static/imgs/bn.png";break;}
            case "wn":{newimage="/static/imgs/wn.png";break;}

            case "bb":{newimage="/static/imgs/bb.png";break;}
            case "wb":{newimage="/static/imgs/wb.png";break;}

            case "bq":{newimage="/static/imgs/bq.png";break;}
            case "wq":{newimage="/static/imgs/wq.png";break;}

            case "bk":{newimage="/static/imgs/bk.png";break;}
            case "wk":{newimage="imgs/wk.png";break;}

            case "bp":{newimage="/static/imgs/bp.png";break;}
            case "wp":{newimage="/static/imgs/wp.png";break;}
            default:{console.log("Errore!!"); break;}
        }*/
        if(image=="")
            newimage = "/static/imgs/empty.png";
        else
        newimage = "/static/imgs/"+image+".png";
        document.getElementById(element[0].toUpperCase()+element[1]).setAttribute("src",newimage);
    });
}

//this function was originally used to calculate all the possible moves a given piece can do
//since the introduction of the backend this is no more used, but i won't delete it since it has been an interesting exercise and it might come in handy in the future
function calculatelegalmoves(piece,cell, extendedcalculation){
    var legalmoves=[];
    var col = cell[0];
    var row = cell[1];
    switch(piece[1]){
        /**
         * Calculate the possible moves for a pawn
         * Pawn can move forward by 1 cell (2 cells if it's the first move)
         * Pawn can capture diagonally
         * Pawn can execute en passant take (french move)
         */
        case "p":{  //piece is pawn 
            legalmoves=[];
            if(pawnsfirstmove[piece[0]][parseInt(col.charCodeAt(0))-parseInt("A".charCodeAt(0))] && !extendedcalculation){//fist move can move of 2 cells
                if(!extendedcalculation)
                    pawnsfirstmove[piece[0]][parseInt(col.charCodeAt(0))-parseInt("A".charCodeAt(0))]=false;
                if(piece[0]=="b"){
                    if(positions[col][parseInt(row)-2]=="")
                        legalmoves[legalmoves.length]=col+(parseInt(row)-2);
                    
                }else{
                    if(positions[col][parseInt(row)+2]=="")
                        legalmoves[legalmoves.length]=col+(parseInt(row)+2);
                }
            }
            //1 cell move
            if(piece[0]=="b"){  
                if(positions[col][parseInt(row)-1]=="") //verify if the cell is free
                    legalmoves[legalmoves.length]=col+(parseInt(row)-1);

                var newcolpawn = calculateNewCol(col,1);    
                var newrowpawn = parseInt(row)-1;

                //verify if the pawn can capture on the right
                if(newcolpawn>="A" && newcolpawn<="H" && newrowpawn>=1 && newrowpawn<=8  && ((extendedcalculation) || (!extendedcalculation && positions[newcolpawn][newrowpawn]!="" && positions[newcolpawn][newrowpawn][0]!=piece[0])))    
                    legalmoves[legalmoves.length]=newcolpawn+newrowpawn+"";
                
                newcolpawn = calculateNewCol(col,-1);
                //verify if the pawn can capture on the left
                if(newcolpawn>="A" && newcolpawn<="H" && newrowpawn>=1 && newrowpawn<=8  && ((extendedcalculation) || (!extendedcalculation && positions[newcolpawn][newrowpawn]!="" && positions[newcolpawn][newrowpawn][0]!=piece[0])))  
                    legalmoves[legalmoves.length]=newcolpawn+newrowpawn+"";
            
                //controls for en-passant take
                if(enpassantable!=""){
                    if(row == enpassantable[1]){
                        if(enpassantable[0]==calculateNewCol(col,1))
                            legalmoves[legalmoves.length]=calculateNewCol(col,1)+(parseInt(row)-1)+"";
                        else if(enpassantable[0]== calculateNewCol(col,-1))
                            legalmoves[legalmoves.length]=calculateNewCol(col,-1)+(parseInt(row)-1)+"";
                    }
                }            
            
            }else{
                if(positions[col][parseInt(row)+1]=="")//verify if the cell is free
                    legalmoves[legalmoves.length]=col+(parseInt(row)+1);

                newcolpawn = calculateNewCol(col,1);
                newrowpawn = parseInt(row)+1;

                //verify if the pawn can capture on the right
                
                if(newcolpawn>="A" && newcolpawn<="H" && newrowpawn>=1 && newrowpawn<=8  && ((extendedcalculation) || (!extendedcalculation && positions[newcolpawn][newrowpawn]!="" && positions[newcolpawn][newrowpawn][0]!=piece[0])))  
                    legalmoves[legalmoves.length]=newcolpawn+newrowpawn+"";

                newcolpawn = calculateNewCol(col,-1);
                //verify if the pawn can capture on the left
                if(newcolpawn>="A" && newcolpawn<="H" && newrowpawn>=1 && newrowpawn<=8  && ((extendedcalculation) || (!extendedcalculation && positions[newcolpawn][newrowpawn]!="" && positions[newcolpawn][newrowpawn][0]!=piece[0])))  
                    legalmoves[legalmoves.length]=newcolpawn+newrowpawn+"";

                //controls for en-passant take
                if(enpassantable!=""){
                    if(row == enpassantable[1]){
                        if(enpassantable[0]==calculateNewCol(col,1))
                            legalmoves[legalmoves.length]=calculateNewCol(col,1)+(parseInt(row)+1)+"";
                        else if(enpassantable[0]== calculateNewCol(col,-1))
                            legalmoves[legalmoves.length]=calculateNewCol(col,-1)+(parseInt(row)+1)+"";
                    }
                }
            }
                
            break;
        }
        /**
         * Calculate the possible moves for a rook
         * Rook can move vertically or horizzontally by any number of free cells
         */
        case "r":{  //piece is rook
            legalmoves=[];
            var stop = false;
                for(i=parseInt(row)+1;i<=8;i++){    //check for movement forward
                    if(!stop){
                        if(positions[col][i]=="" || positions[col][i][0]!=piece[0])
                            legalmoves[legalmoves.length]=col+i;
                        else{
                            if(extendedcalculation)
                                legalmoves[legalmoves.length]=col+i;
                            stop = true;
                        }
                            
                        if(positions[col][i]!="" && positions[col][i][0]!=piece[0] && !((extendedcalculation && positions[col][i][1]=="k")))
                            stop=true;
                    }
                }
                stop = false;
                for(i = parseInt(row)-1;i>=1;i--){  //check for movement backward
                    if(!stop){
                        if(positions[col][i]=="" || positions[col][i][0]!=piece[0])
                            legalmoves[legalmoves.length]=col+i;
                        else{
                            if(extendedcalculation)
                                legalmoves[legalmoves.length]=col+i;
                            stop = true;
                        }
                        if(positions[col][i]!="" && positions[col][i][0]!=piece[0] && !((extendedcalculation && positions[col][i][1]=="k")))
                            stop=true;
                    }
                }
                stop = false;
                var startingpos = parseInt(col.charCodeAt(0))-parseInt("A".charCodeAt(0))+1;
                for(i = startingpos;i<8;i++){   //check for movement to the right
                    if(!stop){
                        var newcolrook = calculateNewCol("A",i);                        
                        if(positions[newcolrook][row]=="" || positions[newcolrook][row][0]!=piece[0])
                            legalmoves[legalmoves.length]=newcolrook+row+"";
                        else{
                            if(extendedcalculation)
                                legalmoves[legalmoves.length]=newcolrook+row+"";
                            stop = true;
                        }
                        
                        if(positions[newcolrook][row]!="" && positions[newcolrook][row][0]!=piece[0] && !((extendedcalculation && positions[newcolrook][row][1]=="k"))){
                            stop=true;
                        }
                            
                    }
                }
                stop = false;
                var startingpos = parseInt(col.charCodeAt(0))-parseInt("A".charCodeAt(0))-1;
                for(i = startingpos;i>=0;i--){  //check for movement to the left
                    if(!stop){
                        var newcolrook = calculateNewCol("A",i);                        
                        if(positions[newcolrook][row]=="" || positions[newcolrook][row][0]!=piece[0])
                            legalmoves[legalmoves.length]=newcolrook+row+"";
                        else{
                            if(extendedcalculation)
                                legalmoves[legalmoves.length]=newcolrook+row+"";
                            stop = true;
                        }
                        if(positions[newcolrook][row]!="" && positions[newcolrook][row][0]!=piece[0] && !((extendedcalculation && positions[newcolrook][row][1]=="k")))
                            stop=true;
                    }
                }
            break;
        }
        /**
         * Calculate the possible moves for a horse
         * Horse move in an L shape
         */
        case "n":{//piece is horse
            legalmoves=[];
            var newcolhorse=[];
            newcolhorse[0] = String.fromCharCode("A".charCodeAt(0)+(col.charCodeAt(0)-"A".charCodeAt(0)+1));
            newcolhorse[1] = String.fromCharCode("A".charCodeAt(0)+(col.charCodeAt(0)-"A".charCodeAt(0)-1));
            newcolhorse[2] = String.fromCharCode("A".charCodeAt(0)+(col.charCodeAt(0)-"A".charCodeAt(0)+2));
            newcolhorse[3] = String.fromCharCode("A".charCodeAt(0)+(col.charCodeAt(0)-"A".charCodeAt(0)-2));
            
            var newrowhorse=[];
            newrowhorse[0] = parseInt(row)+2;
            newrowhorse[1] = parseInt(row)-2;
            newrowhorse[2] = parseInt(row)+1;
            newrowhorse[3] = parseInt(row)-1;

            for(var i=0;i<2;i++){
                for(var j=0;j<2;j++)
                    if(newcolhorse[i]>="A" && newcolhorse[i]<="H" && newrowhorse[j]>=1 && newrowhorse[j]<=8 && (( !extendedcalculation && (positions[newcolhorse[i]][newrowhorse[j]]=="" || positions[newcolhorse[i]][newrowhorse[j]][0]!=piece[0])) || extendedcalculation ))
                        legalmoves[legalmoves.length]=newcolhorse[i]+newrowhorse[j]+"";
            }      
            for(var i=2;i<4;i++){
                for(var j=2;j<4;j++)
                    if(newcolhorse[i]>="A" && newcolhorse[i]<="H" && newrowhorse[j]>=1 && newrowhorse[j]<=8 && (( !extendedcalculation && (positions[newcolhorse[i]][newrowhorse[j]]=="" || positions[newcolhorse[i]][newrowhorse[j]][0]!=piece[0])) || extendedcalculation ))
                        legalmoves[legalmoves.length]=newcolhorse[i]+newrowhorse[j]+"";
            } 
            break;
        }
        /**
         * Calculate the possible moves for a bishop
         * Bishop move diagonally by any number of free cells
         */
        case "b":{  //piece is bishop
            legalmoves=[];
            var stops = [false,false,false,false];
            for(var i=1;i<=8;i++){
                var tmpcolplus = String.fromCharCode("A".charCodeAt(0)+(col.charCodeAt(0)-"A".charCodeAt(0)+i));
                var tmprowplus = parseInt(row)+i;
                var tmpcolminus = String.fromCharCode("A".charCodeAt(0)+(col.charCodeAt(0)-"A".charCodeAt(0)-i));
                var tmprowminus = parseInt(row)-i;

                if(!stops[0]){
                    if(tmpcolplus>="A" && tmpcolplus<="H" && tmprowplus>=1 && tmprowplus<=8){   //calculate move towards top right
                        if(positions[tmpcolplus][tmprowplus]=="" || positions[tmpcolplus][tmprowplus][0]!=piece[0]) //save cell if it's empty or contains an enemy piece
                            legalmoves[legalmoves.length]=tmpcolplus+tmprowplus+"";
                        else{
                            if(extendedcalculation)
                                legalmoves[legalmoves.length]=tmpcolplus+tmprowplus+"";
                            stops[0] = true;
                        }
                        if(positions[tmpcolplus][tmprowplus]!="" && positions[tmpcolplus][tmprowplus][0]!=piece[0] && !((extendedcalculation && positions[tmpcolplus][tmprowplus][1]=="k")))
                            stops[0]=true;  //the cell contains an enemy piece, therefore the cell is added but no futher cells in that direction can be added
                    }
                }
                
                if(!stops[1]){
                    if(tmpcolplus>="A" && tmpcolplus<="H" && tmprowminus>=1 && tmprowminus<=8){ //calculate move towards top left
                        if(positions[tmpcolplus][tmprowminus]=="" || positions[tmpcolplus][tmprowminus][0]!=piece[0])
                            legalmoves[legalmoves.length]=tmpcolplus+tmprowminus+"";
                        else{
                            if(extendedcalculation)
                                legalmoves[legalmoves.length]=tmpcolplus+tmprowminus+"";
                            stops[1] = true;
                        }
                        if(positions[tmpcolplus][tmprowminus]!="" && positions[tmpcolplus][tmprowminus][0]!=piece[0] && !((extendedcalculation && positions[tmpcolplus][tmprowminus][1]=="k")))
                            stops[1]=true;
                    }
                }
                if(!stops[2]){ 
                    if(tmpcolminus>="A" && tmpcolminus<="H" && tmprowplus>=1 && tmprowplus<=8){ //calculate move towards bottom right
                        if(positions[tmpcolminus][tmprowplus]=="" || positions[tmpcolminus][tmprowplus][0]!=piece[0])
                            legalmoves[legalmoves.length]=tmpcolminus+tmprowplus+"";
                        else{
                            if(extendedcalculation)
                                legalmoves[legalmoves.length]=tmpcolminus+tmprowplus+"";
                            stops[2] = true;
                        }
                        if(positions[tmpcolminus][tmprowplus]!="" && positions[tmpcolminus][tmprowplus][0]!=piece[0] && !((extendedcalculation && positions[tmpcolminus][tmprowplus][1]=="k")))
                            stops[2]=true;
                    }
                }
                
                if(!stops[3]){
                    if(tmpcolminus>="A" && tmpcolminus<="H" && tmprowminus>=1 && tmprowminus<=8){ //calculate move towards bottom left
                        if(positions[tmpcolminus][tmprowminus]=="" || positions[tmpcolminus][tmprowminus][0]!=piece[0])
                            legalmoves[legalmoves.length]=tmpcolminus+tmprowminus+"";
                        else{
                            if(extendedcalculation)
                            legalmoves[legalmoves.length]=tmpcolminus+tmprowminus+"";
                            stops[3] = true;
                        }
                        if(positions[tmpcolminus][tmprowminus]!="" && positions[tmpcolminus][tmprowminus][0]!=piece[0] && !((extendedcalculation && positions[tmpcolminus][tmprowminus][1]=="k"))) 
                            stops[3]=true;
                    }
                }
            }
            break;
        }
        /**
         * Calculate the possible moves for a queen
         * See bishop and rook movements
         */
        case "q":{  //piece is queen
            legalmoves=[];
            var stops = [false,false,false,false];
            for(var i=1;i<=8;i++){
                var tmpcolplus = String.fromCharCode("A".charCodeAt(0)+(col.charCodeAt(0)-"A".charCodeAt(0)+i));
                var tmprowplus = parseInt(row)+i;
                var tmpcolminus = String.fromCharCode("A".charCodeAt(0)+(col.charCodeAt(0)-"A".charCodeAt(0)-i));
                var tmprowminus = parseInt(row)-i;

                if(!stops[0]){
                    if(tmpcolplus>="A" && tmpcolplus<="H" && tmprowplus>=1 && tmprowplus<=8){   //calculate move towards top right
                        if(positions[tmpcolplus][tmprowplus]=="" || positions[tmpcolplus][tmprowplus][0]!=piece[0]) //save cell if it's empty or contains an enemy piece
                            legalmoves[legalmoves.length]=tmpcolplus+tmprowplus+"";
                        else{
                            if(extendedcalculation)
                                legalmoves[legalmoves.length]=tmpcolplus+tmprowplus+"";
                            stops[0] = true;
                        }
                        if(positions[tmpcolplus][tmprowplus]!="" && positions[tmpcolplus][tmprowplus][0]!=piece[0] && !((extendedcalculation && positions[tmpcolplus][tmprowplus][1]=="k")))
                            stops[0]=true;  //the cell contains an enemy piece, therefore the cell is added but no futher cells in that direction can be added
                    }
                }
                
                if(!stops[1]){
                    if(tmpcolplus>="A" && tmpcolplus<="H" && tmprowminus>=1 && tmprowminus<=8){ //calculate move towards top left
                        if(positions[tmpcolplus][tmprowminus]=="" || positions[tmpcolplus][tmprowminus][0]!=piece[0])
                            legalmoves[legalmoves.length]=tmpcolplus+tmprowminus+"";
                        else{
                            if(extendedcalculation)
                                legalmoves[legalmoves.length]=tmpcolplus+tmprowminus+"";
                            stops[1] = true;
                        }
                        if(positions[tmpcolplus][tmprowminus]!="" && positions[tmpcolplus][tmprowminus][0]!=piece[0] && !((extendedcalculation && positions[tmpcolplus][tmprowminus][1]=="k")))
                            stops[1]=true;
                    }
                }
                if(!stops[2]){ 
                    if(tmpcolminus>="A" && tmpcolminus<="H" && tmprowplus>=1 && tmprowplus<=8){ //calculate move towards bottom right
                        if(positions[tmpcolminus][tmprowplus]=="" || positions[tmpcolminus][tmprowplus][0]!=piece[0])
                            legalmoves[legalmoves.length]=tmpcolminus+tmprowplus+"";
                        else{
                            if(extendedcalculation)
                                legalmoves[legalmoves.length]=tmpcolminus+tmprowplus+"";
                            stops[2] = true;
                        }
                        if(positions[tmpcolminus][tmprowplus]!="" && positions[tmpcolminus][tmprowplus][0]!=piece[0] && !((extendedcalculation && positions[tmpcolminus][tmprowplus][1]=="k")))
                            stops[2]=true;
                    }
                }
                
                if(!stops[3]){
                    if(tmpcolminus>="A" && tmpcolminus<="H" && tmprowminus>=1 && tmprowminus<=8){ //calculate move towards bottom left
                        if(positions[tmpcolminus][tmprowminus]=="" || positions[tmpcolminus][tmprowminus][0]!=piece[0])
                            legalmoves[legalmoves.length]=tmpcolminus+tmprowminus+"";
                        else{
                            if(extendedcalculation)
                            legalmoves[legalmoves.length]=tmpcolminus+tmprowminus+"";
                            stops[3] = true;
                        }
                        if(positions[tmpcolminus][tmprowminus]!="" && positions[tmpcolminus][tmprowminus][0]!=piece[0] && !((extendedcalculation && positions[tmpcolminus][tmprowminus][1]=="k"))) 
                            stops[3]=true;
                    }
                }
            }
            
            //rook movements
            var stop = false;
            for(i=parseInt(row)+1;i<=8;i++){    //check for movement forward
                if(!stop){
                    if(positions[col][i]=="" || positions[col][i][0]!=piece[0])
                        legalmoves[legalmoves.length]=col+i;
                    else{
                        if(extendedcalculation)
                            legalmoves[legalmoves.length]=col+i;
                        stop = true;
                    }
                        
                    if(positions[col][i]!="" && positions[col][i][0]!=piece[0] && !((extendedcalculation && positions[col][i][1]=="k")))
                        stop=true;
                }
            }
            stop = false;
            for(i = parseInt(row)-1;i>=1;i--){  //check for movement backward
                if(!stop){
                    if(positions[col][i]=="" || positions[col][i][0]!=piece[0])
                        legalmoves[legalmoves.length]=col+i;
                    else{
                        if(extendedcalculation)
                            legalmoves[legalmoves.length]=col+i;
                        stop = true;
                    }
                    if(positions[col][i]!="" && positions[col][i][0]!=piece[0] && !((extendedcalculation && positions[col][i][1]=="k")))
                        stop=true;
                }
            }
            stop = false;
            var startingpos = parseInt(col.charCodeAt(0))-parseInt("A".charCodeAt(0))+1;
            for(i = startingpos;i<8;i++){   //check for movement to the right
                if(!stop){
                    var newcolrook = calculateNewCol("A",i);                        
                    if(positions[newcolrook][row]=="" || positions[newcolrook][row][0]!=piece[0])
                        legalmoves[legalmoves.length]=newcolrook+row+"";
                    else{
                        if(extendedcalculation)
                            legalmoves[legalmoves.length]=newcolrook+row+"";
                        stop = true;
                    }
                    
                    if(positions[newcolrook][row]!="" && positions[newcolrook][row][0]!=piece[0] && !((extendedcalculation && positions[newcolrook][row][1]=="k"))){
                        stop=true;
                    }
                        
                }
            }
            stop = false;
            var startingpos = parseInt(col.charCodeAt(0))-parseInt("A".charCodeAt(0))-1;
            for(i = startingpos;i>=0;i--){  //check for movement to the left
                if(!stop){
                    var newcolrook = calculateNewCol("A",i);                        
                    if(positions[newcolrook][row]=="" || positions[newcolrook][row][0]!=piece[0])
                        legalmoves[legalmoves.length]=newcolrook+row+"";
                    else{
                        if(extendedcalculation)
                            legalmoves[legalmoves.length]=newcolrook+row+"";
                        stop = true;
                    }
                    if(positions[newcolrook][row]!="" && positions[newcolrook][row][0]!=piece[0] && !((extendedcalculation && positions[newcolrook][row][1]=="k")))
                        stop=true;
                }
            }
            break;
        }
        /**
         * Calculate the possible moves for a king
         * King can move by 1 cell in any direction
         * King can't put itself under check condition by moving in a cell guarded by an enemy piece
         * King can castle
         */
        case "k":{  //piece is king
            var kinglegalmoves=[];
            var newcolking=[];
            newcolking[0] = String.fromCharCode("A".charCodeAt(0)+(col.charCodeAt(0)-"A".charCodeAt(0)+1));
            newcolking[1] = String.fromCharCode("A".charCodeAt(0)+(col.charCodeAt(0)-"A".charCodeAt(0)-1));
            newcolking[2] = col;
            
            var newrowking=[];
            newrowking[0] = parseInt(row)+1;
            newrowking[1] = parseInt(row)-1;
            newrowking[2] = row;

            for(var i=0;i<3;i++){
                for(var j=0;j<3;j++){
                    //verify if the move is inside the checkboard (and is not the starting position)
                    if(newcolking[i]>="A" && newcolking[i]<="H" && newrowking[j]>=1 && newrowking[j]<=8 && !(i==2 && j==2)){   
                            //verify if the destination is empty or contains an enemy piece
                            if(positions[newcolking[i]][newrowking[j]]=="" || positions[newcolking[i]][newrowking[j]][0]!=piece[0]){
                                //verify if the move would cause the king to be on check (illegal move)
                                var isCheckPos = verifyCheck(newcolking[i]+newrowking[j]+"",piece[0]);
                            if(!isCheckPos){
                                kinglegalmoves[kinglegalmoves.length]=newcolking[i]+newrowking[j]+"";
                            }
                        }    
                    }
                }
            }
            //castle rules
            if(piece[0]=="w"){
                //if(cancastle[piece[0]])
                    if(cancastle[piece[0]][1] && positions["F"][1]=="" && positions["G"][1]=="")//short castle
                        kinglegalmoves[kinglegalmoves.length]="G1";
                    if(cancastle[piece[0]][0] && positions["D"][1]=="" && positions["C"][1]=="" && positions["B"][1]=="") //long castle
                        kinglegalmoves[kinglegalmoves.length]="C1";
            }else if(piece[0]=="b"){
                //if(cancastle[piece[0]])
                    if(cancastle[piece[0]][1] && positions["F"][8]=="" && positions["G"][8]=="")//short castle
                        kinglegalmoves[kinglegalmoves.length]="G8";
                    if(cancastle[piece[0]][0] && positions["D"][8]=="" && positions["C"][8]=="" && positions["B"][8]=="") //long castle
                        kinglegalmoves[kinglegalmoves.length]="C8";
            }

            legalmoves = kinglegalmoves;
            break;
        }
        default:{
            console.log("An error occurred!");
            break;
        }
    }
    return legalmoves;
}

//function to verify if the king of a color can move to a cell, or if the movement would cause a check
function verifyCheck(destpos,color){
    var retval = false;
    var moves;
    for(var i=0;i<8;i++){
        for(var j=1;j<=8;j++){
            if(retval==false){
                var col = calculateNewCol("A",i);
                //for every enemy piece (except the king) verify if that piece can cause a check on some possible destination of the king
                if(positions[col][j]!="" && positions[col][j][0]!=color && positions[col][j][1]!="k"){
                    moves = calculatelegalmoves(positions[col][j],(col+j+""),true); //get all the legal moves for the enemy piece (extended version)
                    moves.forEach(element => {
                        if(element==destpos){   //verify if the set of legal moves contains the considered destination position
                            retval = true;
                        }           
                    });
                }
            }
            
        }
    }
    return retval;
}

function loadChessboard(){
    var chessboard = document.getElementById("chessboard");

    for(var i = 8;i>=1;i--){
        var row = document.createElement("tr");
        row.setAttribute("id",i);
        row.setAttribute("class","chessrow");
        for(var j = 0;j<8;j++){
            var cell = document.createElement("td");
                
            if((i%2==0 && j%2==0)||(i%2!=0 && j%2!=0))
                cell.setAttribute("class","chesscell whiteback");
            else
            cell.setAttribute("class","chesscell blackback");

            var img = document.createElement("img");
            img.setAttribute("src","/static/imgs/empty.png");
            img.setAttribute("class","imgdiv");
            img.setAttribute("draggable","true");
            img.setAttribute("id",String.fromCharCode(parseInt('A'.charCodeAt(0))+j)+i);
            cell.appendChild(img);
            row.appendChild(cell);
        }
        chessboard.appendChild(row);
        
    }
    loadPieces();  
}
function loadPieces(){ 
    //rooks
    document.querySelectorAll("#A1")[0].setAttribute("src","/static/imgs/wr.png");
    document.querySelectorAll("#H1")[0].setAttribute("src","/static/imgs/wr.png");

    document.querySelectorAll("#A8")[0].setAttribute("src","/static/imgs/br.png");
    document.querySelectorAll("#H8")[0].setAttribute("src","/static/imgs/br.png");

    //knights
    document.querySelectorAll("#B1")[0].setAttribute("src","/static/imgs/wn.png");
    document.querySelectorAll("#G1")[0].setAttribute("src","/static/imgs/wn.png");
    
    document.querySelectorAll("#B8")[0].setAttribute("src","/static/imgs/bn.png");
    document.querySelectorAll("#G8")[0].setAttribute("src","/static/imgs/bn.png");

    //bishops
    document.querySelectorAll("#C1")[0].setAttribute("src","/static/imgs/wb.png");
    document.querySelectorAll("#F1")[0].setAttribute("src","/static/imgs/wb.png");
    
    document.querySelectorAll("#C8")[0].setAttribute("src","/static/imgs/bb.png");
    document.querySelectorAll("#F8")[0].setAttribute("src","/static/imgs/bb.png");

    //queens and kings
    document.querySelectorAll("#D1")[0].setAttribute("src","/static/imgs/wq.png");
    document.querySelectorAll("#E1")[0].setAttribute("src","/static/imgs/wk.png");
    
    document.querySelectorAll("#D8")[0].setAttribute("src","/static/imgs/bq.png");
    document.querySelectorAll("#E8")[0].setAttribute("src","/static/imgs/bk.png");

    //pawns 
    for(var i=0;i<8;i++){
        document.querySelectorAll("#"+(calculateNewCol("A",i)+"2"))[0].setAttribute("src","/static/imgs/wp.png");
        document.querySelectorAll("#"+(calculateNewCol("A",i)+"7"))[0].setAttribute("src","/static/imgs/bp.png");
    }
}

document.addEventListener('DOMContentLoaded', (event) => {
    loadChessboard();
    var dragSrcEl;
    var srcpiece;
    var legalmoves=[];
    var origin_piece  = "";
    function handleDragStart(e) {
        document.getElementById(this.id).setAttribute("src","/static/imgs/"+positions[this.id[0]][this.id[1]]+".png");
        removeCircles(legalmoves);
        
        this.style.opacity = '0.4';
        dragSrcEl = this;
        srcpiece = positions[this.id[0]][parseInt(this.id[1])];

        legalmoves = calculatelegalmoves(srcpiece,this.id,false);
        legalmoves.forEach(element => {
                if(positions[element[0]][parseInt(element[1])]==""){  //add dots / circles to alle the possible destination given a starting cell (e.g. a piece)
                    document.getElementById(element).setAttribute("src","/static/imgs/circle.png");
                }else{
                    document.getElementById(element).setAttribute("src","/static/imgs/"+positions[element[0]][parseInt(element[1])]+"c.png");
                }
        });
    }

    function handleDragEnd(e) {
        this.style.opacity = '1';

        items.forEach(function (item) {
            item.classList.remove('over');
        });
    }

    function handleDragOver(e) {
        e.preventDefault();
        return false;
    }

    function handleDragEnter(e) {
        this.classList.add('over');
    }

    function handleDragLeave(e) {
        this.classList.remove('over');
    }
    function handleDrop(e) {
        var islegalmove=false;
        
        e.stopPropagation(); // stops the browser from redirecting.
        if (dragSrcEl !== this) {
            legalmoves.forEach(element => { //verify if the destination id (this.id) is contained in the array of legal moves, if yes allow the movement

                if(element[0]+element[1]==this.id){   
                    islegalmove = true;
                }
            });
            if(islegalmove){
                dragSrcEl.src = this.src;
                this.src = origin_piece;
                origin_piece = "";
                var srcid = dragSrcEl.id;
                var destid = this.id;
                positions[srcid[0]][parseInt(srcid[1])]="";
                positions[destid[0]][parseInt(destid[1])]=srcpiece;

                var piece = positions[destid[0]][parseInt(destid[1])];
                document.getElementById(destid).setAttribute("src","/static/imgs/"+srcpiece+".png");

                //en passant
                if(piece[1]=="p" && ((piece[0]=="w" && destid[1]=="4") || (piece[0]=="b" && destid[1]=="5")))
                    enpassantable = destid;
                else
                    enpassantable = "";
                
                if(piece == "wp" && (srcid[0] == calculateNewCol(destid[0],-1) || srcid[0] == calculateNewCol(destid[0],+1)) && positions[destid[0]][parseInt(destid[1])-1]=="bp" && destid[1] == 6){
                    document.getElementById(destid[0]+(parseInt(destid[1])-1)).setAttribute("src","/static/imgs/empty.png");
                    positions[destid[0]][parseInt(destid[1])-1]="";
                }else if(piece == "bp" && (srcid[0] == calculateNewCol(destid[0],-1) || srcid[0] == calculateNewCol(destid[0],+1)) && positions[destid[0]][parseInt(destid[1])+1]=="wp" && destid[1]==3){
                    document.getElementById(destid[0]+(parseInt(destid[1])+1)).setAttribute("src","/static/imgs/empty.png");
                    positions[destid[0]][parseInt(destid[1])+1]="";
                }


                //castle    (also move the rook)
                if(piece[1]=="k" && destid=="G1" && srcid=="E1"){
                    document.getElementById("F1").setAttribute("src","/static/imgs/wr.png");
                    document.getElementById("H1").setAttribute("src","/static/imgs/empty.png");
                    positions["H"][1]="";
                    positions["F"][1]="wr";
                }else if(piece[1]=="k" && destid=="C1" && srcid=="E1"){
                    document.getElementById("D1").setAttribute("src","/static/imgs/wr.png");
                    document.getElementById("A1").setAttribute("src","/static/imgs/empty.png");
                    positions["A"][1]="";
                    positions["D"][1]="wr";
                }else if(piece[1]=="k" && destid=="G8" && srcid=="E8"){
                    document.getElementById("F8").setAttribute("src","/static/imgs/br.png");
                    document.getElementById("H8").setAttribute("src","/static/imgs/empty.png");
                    positions["H"][8]="";
                    positions["F"][8]="br";
                }else if(piece[1]=="k" && destid=="C8" && srcid=="E8"){
                    document.getElementById("D8").setAttribute("src","/static/imgs/br.png");
                    document.getElementById("A8").setAttribute("src","/static/imgs/empty.png");
                    positions["A"][8]="";
                    positions["D"][8]="br";
                }

                if(piece == "wk"){  //if king is moved castle is no longer a legal move
                    cancastle["w"][0]= false;
                    cancastle["w"][1] = false;
                }else if (piece == "bk"){
                    cancastle["b"][0]= false;
                    cancastle["b"][1] = false;
                }

                if(piece == "wr" && srcid[0]=="A")  //if a rook is moved, castle on that side is no longer a legal move 
                    cancastle["w"][0]=false;
                if(piece == "wr" && srcid[0]=="H")
                    cancastle["w"][1]=false;
                if(piece == "br" && srcid[0]=="A")
                    cancastle["b"][0]=false;
                if(piece == "br" && srcid[0]=="A")
                    cancastle["b"][1]=false;
            
                

                legalmoves.forEach(element => {
                    element = element.toUpperCase();
                    if(positions[element[0]][parseInt(element[1])]==""){
                        document.getElementById(element[0]+element[1]).setAttribute("src","/static/imgs/empty.png");
                    }
                        
                });

                document.getElementById(srcid).setAttribute("src","/static/imgs/empty.png");

                if(piece == "wp" && destid[1] == "8"){
                    //console.log("White is promoting");
                    showPromotionWindow("w",srcid,destid);
                }else if(piece=="bp" && destid[1]=="1"){
                    //console.log("Black is promoting");
                    showPromotionWindow("b",srcid,destid);
                }else{  //in case of promotion updateMoveList is called after the user select the piece
                    updateMoveList();
                    for(var i= move_index+1;i<move_list.length;i++) //when a move is made remove all the future board positions
                        move_list.pop();
                }

                removeCircles(legalmoves);
            }
        }else{
            var srcid = dragSrcEl.id;
            var piece = positions[srcid[0]][parseInt(srcid[1])];
            //if a pawn is moved on the same cell and it's in the starting position enable 2 cell move again
            if((piece[0]=="w" && srcid[1]=="2" && piece[1]=="p") || (piece[0]=="b" && srcid[1]=="7" && piece[1]=="p"))  
                pawnsfirstmove[piece[0]][parseInt(srcid[0].charCodeAt(0))-parseInt("A".charCodeAt(0))]=true;

        }
        islegalmove = false;    
        return false;
    }
        let items = document.querySelectorAll('img.imgdiv');    
        items.forEach(function(item) {
            item.addEventListener('dragstart', handleDragStart);
            item.addEventListener('dragover', handleDragOver);
            item.addEventListener('dragenter', handleDragEnter);
            item.addEventListener('dragleave', handleDragLeave);
            item.addEventListener('dragend', handleDragEnd);
            item.addEventListener('drop', handleDrop);
        });
});

function showPromotionWindow(color,srcid, destid){
    var divcontainer = document.getElementById("promotioncontainer");

    var promotionWindow = document.createElement("table");
    promotionWindow.setAttribute("id","promotionwindow");
    promotionWindow.setAttribute("class","promotionwindow");

    var tr = document.createElement("tr");
    tr.setAttribute("class","chessrow");
    var td = document.createElement("td");
    td.setAttribute("class","chesscell");
    var img = document.createElement("img");
    img.setAttribute("src","/static/imgs/"+color+"r.png");
    img.setAttribute("class","imgdiv");
    img.setAttribute("onclick","promote('"+srcid+"','"+destid+"','r','"+color+"')");
    td.appendChild(img);
    tr.appendChild(td);
    promotionWindow.appendChild(tr);

    var tr = document.createElement("tr");
    tr.setAttribute("class","chessrow");
    var td = document.createElement("td");
    td.setAttribute("class","chesscell");
    var img = document.createElement("img");
    img.setAttribute("src","/static/imgs/"+color+"b.png");
    img.setAttribute("class","imgdiv");
    img.setAttribute("onclick","promote('"+srcid+"','"+destid+"','b','"+color+"')");
    td.appendChild(img);
    tr.appendChild(td);
    promotionWindow.appendChild(tr);

    var tr = document.createElement("tr");
    tr.setAttribute("class","chessrow");
    var td = document.createElement("td");
    td.setAttribute("class","chesscell");
    var img = document.createElement("img");
    img.setAttribute("src","/static/imgs/"+color+"n.png");
    img.setAttribute("class","imgdiv");
    img.setAttribute("onclick","promote('"+srcid+"','"+destid+"','n','"+color+"')");
    td.appendChild(img);
    tr.appendChild(td);
    promotionWindow.appendChild(tr);

    var tr = document.createElement("tr");
    tr.setAttribute("class","chessrow");
    var td = document.createElement("td");
    td.setAttribute("class","chesscell");
    var img = document.createElement("img");
    img.setAttribute("src","/static/imgs/"+color+"q.png");
    img.setAttribute("class","imgdiv");
    img.setAttribute("onclick","promote('"+srcid+"','"+destid+"','q','"+color+"')");
    td.appendChild(img);
    tr.appendChild(td);
    promotionWindow.appendChild(tr);

    divcontainer.appendChild(promotionWindow);
}

function promote(srcid,destid,piece,color){
    var image = "/static/imgs/"+color+piece+".png";
    document.getElementById(destid).setAttribute("src",image);
    positions[destid[0]][destid[1]]=color+piece;
    document.getElementById("promotionwindow").remove();

    updateMoveList();
    for(var i= move_index+1;i<move_list.length;i++)
        move_list.pop();
}

//move the board 1 position back
function move_back(){
    if(move_index>0){
        move_index--;
        loadChessboardFromPositions(move_index);
    }    
}
//move the board 1 position forward
function move_forward(){
    if(move_index<move_list.length-1){
        move_index++;
        loadChessboardFromPositions(move_index);
    }
    
}
//visualize the board in a certain position in time
function loadChessboardFromPositions(index){
    for(var i=0;i<8;i++){
        for(var j=1;j<=8;j++){
            var newImage = "";
            if(move_list[index][calculateNewCol("A",i)][j] == "")
                newImage = "/static/imgs/empty.png";
            else
                newImage = "/static/imgs/"+move_list[index][calculateNewCol("A",i)][j]+".png";
            positions[calculateNewCol("A",i)][j]=move_list[move_index][calculateNewCol("A",i)][j];  //update positions matrix

            if(j==2 && positions[calculateNewCol("A",i)][j]=="wp")  //if going back a pawn return to its starting position allow the 2 cell move again for that pawn
                pawnsfirstmove["w"][i]=true;
            else if(j==7 && positions[calculateNewCol("A",i)][j]=="bp")
                pawnsfirstmove["b"][i]=true;
            
            document.getElementById(calculateNewCol("A",i)+j).setAttribute("src",newImage);
        }
    }
    var kinghasmoved = [false,false];
    var leftrookhasmoved = [false,false];
    var rightrookhasmoved = [false,false];
    for(var i=0;i<index;i++){   //verify if going back a castle move is available again
        if(move_list[i]["E"][1]!="wk")
            kinghasmoved[0] = true;
        if(move_list[i]["A"][1]!="wr")
            leftrookhasmoved[0]= true;
        if(move_list[i]["H"][1]!="wr")
            rightrookhasmoved[0]= true;

        if(move_list[i]["E"][8]!="bk")
            kinghasmoved[1] = true;
        if(move_list[i]["A"][8]!="br")
            leftrookhasmoved[1]= true;
        if(move_list[i]["H"][8]!="br")
            rightrookhasmoved[1]= true;
    }

    cancastle["w"][0] = !kinghasmoved[0] && !leftrookhasmoved[0]; 
    cancastle["w"][1] = !kinghasmoved[0] && !rightrookhasmoved[0]; 
    cancastle["b"][0] = !kinghasmoved[1] && !leftrookhasmoved[1]; 
    cancastle["b"][1] = !kinghasmoved[1] && !rightrookhasmoved[1]; 
}

function updateMoveList(){  //every time a move in the board is made save the new configuration
    move_index++;
    move_list[move_index]={}
    for(var i=0;i<8;i++){
        var newcol = calculateNewCol("A",i);
        move_list[move_index][newcol]=[];
        move_list[move_index][newcol][0]=newcol;
        for(var j=1;j<=8;j++){
            move_list[move_index][newcol][j]=positions[newcol][j];
        }
    }
    move_list[move_index]["-1"]=[" ","1","2","3","4","5","6","7","8"];
    //console.log(move_list);
}