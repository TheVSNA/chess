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
}

//say if the pawn is at its first move (so it is able to move 2 cells)
var pawnsfirstmove ={
    "w":[true,true,true,true,true,true,true,true],
    "b":[true,true,true,true,true,true,true,true],
}

//when a pawn move by 2 cells save its position to calculate en passant move
var enpassantable = "";

//save if a king can castle
var cancastle = {
    "w":true,
    "b":true
}
var white_move = true;

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
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
        document.querySelectorAll("#"+(String.fromCharCode(parseInt('A'.charCodeAt(0))+i)+"2"))[0].setAttribute("src","/static/imgs/wp.png");
        document.querySelectorAll("#"+(String.fromCharCode(parseInt('A'.charCodeAt(0))+i)+"7"))[0].setAttribute("src","/static/imgs/bp.png");
    }
}
//print on console the chessboard
function printpositions(){
    for(var i=0;i<8;i++){
        console.log(positions[String.fromCharCode(parseInt('A'.charCodeAt(0))+i)]);
   }
   console.log(positions["-1"]);
}
//given a starting col and an offset calculate new col
function calculateNewCol(oldcol,offset){
    return String.fromCharCode(parseInt(oldcol.charCodeAt(0))+offset);
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

//calculate all the possible legal moves for a piece given its type and its positions
//extendedcalculation is used when the function is called inside the verifycheck function to calculate also the cells containing a piece protected by another piece 
//this function is no more used since the backend can calculate all the legal moves easily
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
                if(cancastle[piece[0]])
                    if(positions["F"][1]=="" && positions["G"][1]=="")//short castle
                        kinglegalmoves[kinglegalmoves.length]="G1";
                    if(positions["D"][1]=="" && positions["C"][1]=="" && positions["B"][1]=="") //long castle
                        kinglegalmoves[kinglegalmoves.length]="C1";
            }else if(piece[0]=="b"){
                if(cancastle[piece[0]])
                    if(positions["F"][8]=="" && positions["G"][8]=="")//short castle
                        kinglegalmoves[kinglegalmoves.length]="G8";
                    if(positions["D"][8]=="" && positions["C"][8]=="" && positions["B"][8]=="") //long castle
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

function removeCircles(legalmoves){
    legalmoves.forEach(element => {
        var newimage ="";
        var image = document.getElementById(element[2].toUpperCase()+element[3]).src.split("/").pop();
        switch(image){
            case "circle.png":{newimage="/static/imgs/empty.png";break;}

            case "brc.png":{newimage="/static/imgs/br.png";break;}
            case "wrc.png":{newimage="/static/imgs/wr.png";break;}

            case "bnc.png":{newimage="/static/imgs/bn.png";break;}
            case "wnc.png":{newimage="/static/imgs/wn.png";break;}

            case "bbc.png":{newimage="/static/imgs/bb.png";break;}
            case "wbc.png":{newimage="/static/imgs/wb.png";break;}

            case "bqc.png":{newimage="/static/imgs/bq.png";break;}
            case "wqc.png":{newimage="/static/imgs/wq.png";break;}

            case "bkc.png":{newimage="/static/imgs/bk.png";break;}
            case "wkc.png":{newimage="imgs/wk.png";break;}

            case "bpc.png":{newimage="/static/imgs/bp.png";break;}
            case "wpc.png":{newimage="/static/imgs/wp.png";break;}
            default:{newimage="/static/imgs/"+image; break;}
        }
        document.getElementById(element[2].toUpperCase()+element[3]).setAttribute("src",newimage);
    });
}

//get the set of legal moves from backend
function getLegalMoves(){
    var legal_moves = [];
    return fetch("/legal_moves/",{method:"GET",headers: { "X-CSRFToken": CSRF_TOKEN }}).then((resp)=>resp.json()).then(function(data){
        legal_moves=data["legalmoves"];
        return legal_moves;
    });
}

document.addEventListener('DOMContentLoaded', (event) => {
    loadChessboard();
    var dragSrcEl;
    var srcpiece;
    var legalmoves=[];
    var origin_piece  = "";
    function handleDragStart(e) {
        removeCircles(legalmoves);
        
        this.style.opacity = '0.4';
        dragSrcEl = this;
        srcpiece = positions[this.id[0]][parseInt(this.id[1])];

        getLegalMoves().then( response => { //get legal moves from backend
            legalmoves = response;
            e.dataTransfer.effectAllowed = 'move';
            origin_piece = this.src;
            legalmoves.forEach(element => {
                if(element[0].toUpperCase()+element[1]==this.id){
                    if(positions[element[2].toUpperCase()][parseInt(element[3])]==""){  //add dots / circles to alle the possible destination given a starting cell (e.g. a piece)
                        document.getElementById(element[2].toUpperCase()+element[3]).setAttribute("src","/static/imgs/circle.png");
                    }else{
                        document.getElementById(element[2].toUpperCase()+element[3]).setAttribute("src","/static/imgs/"+positions[element[2].toUpperCase()][parseInt(element[3])]+"c.png");
                    }
                }
                
                    
            });
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
                if(element.toUpperCase()==dragSrcEl.id+""+this.id){
                    islegalmove = true;
                }
            });
            if(islegalmove){
                dragSrcEl.src = this.src;
                this.src = origin_piece;
                origin_piece = "";
                var srcid = dragSrcEl.id;
                var destid = this.id;
                var destpiece = positions[destid[0]][parseInt(destid[1])];

                positions[srcid[0]][parseInt(srcid[1])]="";
                positions[destid[0]][parseInt(destid[1])]=srcpiece;
                

                var piece = positions[destid[0]][parseInt(destid[1])];

                moveIsEnPassant(srcid+destid).then(moveisenpassant => {
                    if(moveisenpassant["enpassant"]){
                        if(parseInt(destid[1])==6){
                            positions[destid[0]][parseInt(destid[1]-1)]="";
                            document.getElementById(destid[0]+parseInt(destid[1]-1)).setAttribute("src","/static/imgs/empty.png");
                        }else{
                            positions[destid[0]][parseInt(destid[1]+1)]="";
                            document.getElementById(destid[0]+parseInt(destid[1]+1)).setAttribute("src","/static/imgs/empty.png");
                        }    
                    }
                });
                

                //castle
                if(piece[1]=="k" && destid=="G1"){
                    document.getElementById("F1").setAttribute("src","/static/imgs/wr.png");
                    document.getElementById("H1").setAttribute("src","/static/imgs/empty.png");
                    positions["H"][1]="";
                    positions["F"][1]="wr";
                }else if(piece[1]=="k" && destid=="C1"){
                    document.getElementById("D1").setAttribute("src","/static/imgs/wr.png");
                    document.getElementById("A1").setAttribute("src","/static/imgs/empty.png");
                    positions["A"][1]="";
                    positions["D"][1]="wr";
                }else if(piece[1]=="k" && destid=="G8"){
                    document.getElementById("F8").setAttribute("src","/static/imgs/br.png");
                    document.getElementById("H8").setAttribute("src","/static/imgs/empty.png");
                    positions["H"][8]="";
                    positions["F"][8]="br";
                }else if(piece[1]=="k" && destid=="C8"){
                    document.getElementById("D8").setAttribute("src","/static/imgs/br.png");
                    document.getElementById("A8").setAttribute("src","/static/imgs/empty.png");
                    positions["A"][8]="";
                    positions["D"][8]="br";
                }
                    
                if(piece[1]=="r" || piece[1]=="k")
                    cancastle[piece[0]]=false;

                legalmoves.forEach(element => {
                    element = element.toUpperCase();
                    if(positions[element[2]][parseInt(element[3])]==""){
                        document.getElementById(element[2]+element[3]).setAttribute("src","/static/imgs/empty.png");
                    }
                        
                });
                document.getElementById(srcid).setAttribute("src","/static/imgs/empty.png");
                printpositions();
                var move = srcid+destid+"";
                console.log("Move: "+move);
                fetch("/evaluate/",{method:"POST",body:JSON.stringify({'move':move}),headers: { "X-CSRFToken": CSRF_TOKEN }}).then((resp)=>resp.json()).then(function(data){
                    var board_evaluation = data["board_evaluation"];
                    var cp_evaluation = data["cp_evaluation"];
                    var best_enemy_move = data["best_enemy_move"];
                    var best_response_to_enemy_best_move = data["best_response_to_enemy_best_move"];
                   // var best_moves = data["best_moves"];
                    console.log("Board evaluation: "+board_evaluation);
                    console.log("Cp evaluation: "+cp_evaluation);
                    console.log("Best enemy move: "+best_enemy_move)
                    console.log("Best response: "+best_response_to_enemy_best_move)
                    //console.log(best_moves);

                    var bar = document.getElementById("myBar");
                    console.log(white_move);
                    if(white_move == true){
                        bar.setAttribute("style","height:"+(100-board_evaluation)+"%");
                    }else{
                        bar.setAttribute("style","height:"+board_evaluation+"%");
                    }
                    if(cp_evaluation>0){
                        document.getElementById("cp_white").innerText=(cp_evaluation/100);
                        document.getElementById("cp_black").innerText="";
                    }else if(cp_evaluation<0){
                        document.getElementById("cp_white").innerText="";
                        document.getElementById("cp_black").innerText=(-cp_evaluation/100);
                    }else{
                        document.getElementById("cp_white").innerText="";
                        document.getElementById("cp_black").innerText="";
                    }
                    for(var i=1;i<=3;i++)
                        document.getElementById("move_"+i).innerText="";

                    /*for(var i=0;i<best_moves.length;i++)
                        document.getElementById("move_"+(i+1)).innerText=best_moves[i]["move"]+" "+best_moves[i]["score"];*/
                    white_move = !white_move;
                });
            
            }else{
                var srcid = dragSrcEl.id;
                var piece = positions[srcid[0]][parseInt(srcid[1])];
                //if a pawn is moved on the same cell and it's in the starting position enable 2 cell move again
                if((piece[0]=="w" && srcid[1]=="2" && piece[1]=="p") || (piece[0]=="b" && srcid[1]=="7" && piece[1]=="p"))  
                    pawnsfirstmove[piece[0]][parseInt(srcid[0].charCodeAt(0))-parseInt("A".charCodeAt(0))]=true;
                }
        }else{
            var srcid = dragSrcEl.id;
            var piece = positions[srcid[0]][parseInt(srcid[1])];
            //if a pawn is moved on the same cell and it's in the starting position enable 2 cell move again
            if((piece[0]=="w" && srcid[1]=="2" && piece[1]=="p") || (piece[0]=="b" && srcid[1]=="7" && piece[1]=="p"))  
                pawnsfirstmove[piece[0]][parseInt(srcid[0].charCodeAt(0))-parseInt("A".charCodeAt(0))]=true;                
        }
        
        
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

function reset(){
    fetch("reset/");
}
function moveIsEnPassant(move){
    return fetch("moveisenpassant/",{method:"POST",body:JSON.stringify({'move':move}),headers: { "X-CSRFToken": CSRF_TOKEN }}).then((resp)=>resp.json()).then(function(data){
       return data; 
    });
}