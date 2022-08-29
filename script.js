/*positions={
    "wr":["A1","H1"],
    "wh":["B1","G1"],
    "wb":["C1","F1"],
    "wq":"D1",
    "wk":"E1",
    "wp":["A2","B2","C2","D2","E2","F2","G2","h2"],
    "br":["A8","H8"],
    "bh":["B8","G8"],
    "bb":["C8","F8"],
    "bq":"D8",
    "bk":"E8",
    "bp":["A7","B7","C7","D7","E7","F7","G7","h7"]
}*/
//configuration of the checkboard
positions={
    "A":["wr","wp","","","","","bp","br"],
    "B":["wh","wp","","","","","bp","bh"],
    "C":["wb","wp","","","","","bp","bb"],
    "D":["wq","wp","","","","","bp","bq"],
    "E":["wk","wp","","","","","bp","bk"],
    "F":["wb","wp","","","","","bp","bb"],
    "G":["wh","wp","","","","","bp","bh"],
    "H":["wr","wp","","","","","bp","br"],
}

//say if the pawn is at its first move (so it is able to move 2 cells)
pawnsfirstmove ={
    "w":[true,true,true,true,true,true,true,true],
    "b":[true,true,true,true,true,true,true,true],
}

function loadChessboard(){
    chessboard = document.getElementById("chessboard");

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

            img = document.createElement("img");
            img.setAttribute("src","imgs/empty.png");
            img.setAttribute("class","imgdiv");
            img.setAttribute("draggable","true");
            img.setAttribute("id",String.fromCharCode(parseInt('A'.charCodeAt(0))+j)+i);
            //imgdiv.appendChild(img);
            cell.appendChild(img);
            row.appendChild(cell);
        }
        chessboard.appendChild(row);
        
    }
    loadPieces();  
}
function loadPieces(){ 
    //rooks
    document.querySelectorAll("#A1")[0].setAttribute("src","imgs/wr.png");
    document.querySelectorAll("#H1")[0].setAttribute("src","imgs/wr.png");

    document.querySelectorAll("#A8")[0].setAttribute("src","imgs/br.png");
    document.querySelectorAll("#H8")[0].setAttribute("src","imgs/br.png");

    //knights
    document.querySelectorAll("#B1")[0].setAttribute("src","imgs/wn.png");
    document.querySelectorAll("#G1")[0].setAttribute("src","imgs/wn.png");
    
    document.querySelectorAll("#B8")[0].setAttribute("src","imgs/bn.png");
    document.querySelectorAll("#G8")[0].setAttribute("src","imgs/bn.png");

    //bishops
    document.querySelectorAll("#C1")[0].setAttribute("src","imgs/wb.png");
    document.querySelectorAll("#F1")[0].setAttribute("src","imgs/wb.png");
    
    document.querySelectorAll("#C8")[0].setAttribute("src","imgs/bb.png");
    document.querySelectorAll("#F8")[0].setAttribute("src","imgs/bb.png");

    //queens and kings
    document.querySelectorAll("#D1")[0].setAttribute("src","imgs/wq.png");
    document.querySelectorAll("#E1")[0].setAttribute("src","imgs/wk.png");
    
    document.querySelectorAll("#D8")[0].setAttribute("src","imgs/bq.png");
    document.querySelectorAll("#E8")[0].setAttribute("src","imgs/bk.png");

    //pawns 
    for(var i=0;i<8;i++){
        document.querySelectorAll("#"+(String.fromCharCode(parseInt('A'.charCodeAt(0))+i)+"2"))[0].setAttribute("src","imgs/wp.png");
        document.querySelectorAll("#"+(String.fromCharCode(parseInt('A'.charCodeAt(0))+i)+"7"))[0].setAttribute("src","imgs/bp.png");
    }
}

function printpositions(){
    for(var i=0;i<8;i++){
        console.log(positions[String.fromCharCode(parseInt('A'.charCodeAt(0))+i)]);
   }
}
function calculatelegalmoves(piece,cell){
    legalmoves=[];
    var col = cell[0];
    var row = cell[1];
    console.log(col+" "+row);
    console.log(piece[0]+" "+piece[1]);
    switch(piece[1]){
        case "p":{  //piece is pawn
            if(pawnsfirstmove[piece[0]][parseInt(col.charCodeAt(0)-"A".charCodeAt(0))]){//fist move can move of 2 cells
                pawnsfirstmove[piece[0]][parseInt(col.charCodeAt(0)-"A".charCodeAt(0))]=false;
                if(piece[0]=="b"){
                    legalmoves[0]=col+(parseInt(row)-1);
                    legalmoves[1]=col+(parseInt(row)-2);
                }else{
                    legalmoves[0]=col+(parseInt(row)+1);
                    legalmoves[1]=col+(parseInt(row)+2);
                }
            }else{
                if(piece[0]=="b")
                    legalmoves[0]=col+(parseInt(row)-1);
                else
                    legalmoves[0]=col+(parseInt(row)+1);
            }
            break;
        }
        case "r":{  //piece is rook
            for(var i=1;i<=8;i++){
                if(i!=row)
                    legalmoves[legalmoves.length]=col+i;
            }
            for(var i=0;i<8;i++){
                var newcol = String.fromCharCode(parseInt("A".charCodeAt(0))+i);
                if(newcol!=col){
                    legalmoves[legalmoves.length]=newcol+row;
                }
            }
            break;
        }
        case "h":{//piece is horse
            newcol=[];
            newcol[0] = String.fromCharCode("A".charCodeAt(0)+(col.charCodeAt(0)-"A".charCodeAt(0)+1));
            newcol[1] = String.fromCharCode("A".charCodeAt(0)+(col.charCodeAt(0)-"A".charCodeAt(0)-1));
            newcol[2] = String.fromCharCode("A".charCodeAt(0)+(col.charCodeAt(0)-"A".charCodeAt(0)+2));
            newcol[3] = String.fromCharCode("A".charCodeAt(0)+(col.charCodeAt(0)-"A".charCodeAt(0)-2));
            
            newrow=[];
            newrow[0] = parseInt(row)+2;
            newrow[1] = parseInt(row)-2;
            newrow[2] = parseInt(row)+1;
            newrow[3] = parseInt(row)-1;

            for(var i=0;i<2;i++){
                for(var j=0;j<2;j++)
                    if(newcol[i]>="A" && newcol[i]<="H" && newrow[j]>=1 && newrow[j]<=8)
                        legalmoves[legalmoves.length]=newcol[i]+newrow[j]+"";
            }      
            for(var i=2;i<4;i++){
                for(var j=2;j<4;j++)
                    if(newcol[i]>="A" && newcol[i]<="H" && newrow[j]>=1 && newrow[j]<=8)
                        legalmoves[legalmoves.length]=newcol[i]+newrow[j]+"";
            } 
            break;
        }
        case "b":{  //piece is bishop
            for(var i=1;i<=8;i++){
                var tmpcolplus = String.fromCharCode("A".charCodeAt(0)+(col.charCodeAt(0)-"A".charCodeAt(0)+i));
                var tmprowplus = parseInt(row)+i;
                var tmpcolminus = String.fromCharCode("A".charCodeAt(0)+(col.charCodeAt(0)-"A".charCodeAt(0)-i));
                var tmprowminus = parseInt(row)-i;
                /*console.log(tmpcolplus+tmprowplus+"");
                console.log(tmpcolplus+tmprowminus+"");
                console.log(tmpcolminus+tmprowplus+"");
                console.log(tmpcolminus+tmprowminus+"");*/
                
                if(tmpcolplus>="A" && tmpcolplus<="H" && tmprowplus>=1 && tmprowplus<=8){
                    legalmoves[legalmoves.length]=tmpcolplus+tmprowplus+"";
                }
                
                if(tmpcolplus>="A" && tmpcolplus<="H" && tmprowminus>=1 && tmprowminus<=8){
                    legalmoves[legalmoves.length]=tmpcolplus+tmprowminus+"";
                }
                
                if(tmpcolminus>="A" && tmpcolminus<="H" && tmprowplus>=1 && tmprowplus<=8){
                    legalmoves[legalmoves.length]=tmpcolminus+tmprowplus+"";
                }
                
                if(tmpcolminus>="A" && tmpcolminus<="H" && tmprowminus>=1 && tmprowminus<=8){
                    legalmoves[legalmoves.length]=tmpcolminus+tmprowminus+"";
                }
            }
            break;
        }
        case "q":{
            for(var i=1;i<=8;i++){
                var tmpcolplus = String.fromCharCode("A".charCodeAt(0)+(col.charCodeAt(0)-"A".charCodeAt(0)+i));
                var tmprowplus = parseInt(row)+i;
                var tmpcolminus = String.fromCharCode("A".charCodeAt(0)+(col.charCodeAt(0)-"A".charCodeAt(0)-i));
                var tmprowminus = parseInt(row)-i;
                /*console.log(tmpcolplus+tmprowplus+"");
                console.log(tmpcolplus+tmprowminus+"");
                console.log(tmpcolminus+tmprowplus+"");
                console.log(tmpcolminus+tmprowminus+"");*/
                
                if(tmpcolplus>="A" && tmpcolplus<="H" && tmprowplus>=1 && tmprowplus<=8){
                    legalmoves[legalmoves.length]=tmpcolplus+tmprowplus+"";
                }
                
                if(tmpcolplus>="A" && tmpcolplus<="H" && tmprowminus>=1 && tmprowminus<=8){
                    legalmoves[legalmoves.length]=tmpcolplus+tmprowminus+"";
                }
                
                if(tmpcolminus>="A" && tmpcolminus<="H" && tmprowplus>=1 && tmprowplus<=8){
                    legalmoves[legalmoves.length]=tmpcolminus+tmprowplus+"";
                }
                
                if(tmpcolminus>="A" && tmpcolminus<="H" && tmprowminus>=1 && tmprowminus<=8){
                    legalmoves[legalmoves.length]=tmpcolminus+tmprowminus+"";
                }
            }
            for(var i=1;i<=8;i++){
                if(i!=row)
                    legalmoves[legalmoves.length]=col+i;
            }
            for(var i=0;i<8;i++){
                var newcol = String.fromCharCode(parseInt("A".charCodeAt(0))+i);
                if(newcol!=col){
                    legalmoves[legalmoves.length]=newcol+row;
                }
            }
            break;
        }
        case "k":{
            newcol=[];
            newcol[0] = String.fromCharCode("A".charCodeAt(0)+(col.charCodeAt(0)-"A".charCodeAt(0)+1));
            newcol[1] = String.fromCharCode("A".charCodeAt(0)+(col.charCodeAt(0)-"A".charCodeAt(0)-1));
            newcol[2] = col;
            
            newrow=[];
            newrow[0] = parseInt(row)+1;
            newrow[1] = parseInt(row)-1;
            newrow[2] = row;

            for(var i=0;i<3;i++){
                for(var j=0;j<3;j++)
                    if(newcol[i]>="A" && newcol[i]<="H" && newrow[j]>=1 && newrow[j]<=8 && !(i==2 && j==2))
                        legalmoves[legalmoves.length]=newcol[i]+newrow[j]+"";
            }
            break;
        }
        default:{
            console.log("An error occurred!");
            break;
        }
    }
    return legalmoves;
}

document.addEventListener('DOMContentLoaded', (event) => {
    loadChessboard();
    
    function handleDragStart(e) {
        this.style.opacity = '0.4';
        dragSrcEl = this;
        srcpiece = positions[this.id[0]][parseInt(this.id[1])-1];
        legalmoves = calculatelegalmoves(srcpiece,this.id);
        console.log(legalmoves);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('img', this.src);
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
        e.stopPropagation(); // stops the browser from redirecting.
        if (dragSrcEl !== this) {
            dragSrcEl.src = this.src;
            this.src = e.dataTransfer.getData('img');
            srcid = dragSrcEl.id;
            destid = this.id;
            destpiece = positions[destid[0]][parseInt(destid[1])-1];

            positions[srcid[0]][parseInt(srcid[1])-1]=destpiece;
            positions[destid[0]][parseInt(destid[1])-1]=srcpiece;
            printpositions();
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