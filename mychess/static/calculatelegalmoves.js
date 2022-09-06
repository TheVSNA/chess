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