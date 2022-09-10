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
        document.querySelectorAll("#"+(calculateNewCol("A",i)+"2"))[0].setAttribute("src","/static/imgs/wp.png");
        document.querySelectorAll("#"+(calculateNewCol("A",i)+"7"))[0].setAttribute("src","/static/imgs/bp.png");
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
    return fetch("legal_moves/",{method:"GET",headers: { "X-CSRFToken": CSRF_TOKEN }}).then((resp)=>resp.json()).then(function(data){
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
            console.log(legalmoves);
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
                element = element.toUpperCase();
                if(element[0]+element[1]+element[2]+element[3]==dragSrcEl.id+""+this.id){   //cannot put element = dragSrcEl.id+""+this.id because pawn promotion code has 5 characters (the fifth indicates the promotion piece q,r,b,n)
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

                

                legalmoves.forEach(element => {
                    element = element.toUpperCase();
                    if(positions[element[2]][parseInt(element[3])]==""){
                        document.getElementById(element[2]+element[3]).setAttribute("src","/static/imgs/empty.png");
                    }
                        
                });
                document.getElementById(srcid).setAttribute("src","/static/imgs/empty.png");
                printpositions();
                var move = srcid+destid+"";

                if(piece == "wp" && destid[1] == "8"){
                    console.log("White is promoting");
                    showPromotionWindow("w",srcid,destid);
                }else if(piece=="bp" && destid[1]=="1"){
                    console.log("Black is promoting");
                    showPromotionWindow("b",srcid,destid);
                }else
                    evaluate(move);            
            }
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
    fetch("reset/",{method:"POST",headers: { "X-CSRFToken": CSRF_TOKEN }});
}
function moveIsEnPassant(move){
    return fetch("moveisenpassant/",{method:"POST",body:JSON.stringify({'move':move}),headers: { "X-CSRFToken": CSRF_TOKEN }}).then((resp)=>resp.json()).then(function(data){
       return data; 
    });
}

function showPromotionWindow(color,srcid, destid){
    console.log(color+" "+destid);
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
    evaluate(srcid+destid+piece);
}

function evaluate(move){
    console.log("Move: "+move);
    fetch("evaluate/",{method:"POST",body:JSON.stringify({'move':move}),headers: { "X-CSRFToken": CSRF_TOKEN }}).then((resp)=>resp.json()).then(function(data){
        var board_evaluation = data["board_evaluation"];
        var cp_evaluation = data["cp_evaluation"];
        var best_enemy_move = data["best_enemy_move"];
        var best_response_to_enemy_best_move = data["best_response_to_enemy_best_move"];
        var is_checkmate = data["is_checkmate"];
        var is_stalemate = data["is_stalemate"];
        var is_insufficient = data["is_insufficient_material"];
        if(is_checkmate){
            if(white_move)
                alert("White wins!");
            else
                alert("Black wins!");
        }
        else if(is_stalemate){
            alert("Draw for stalemate!");
        }
        else if(is_insufficient){
            alert("Draw for insufficient material!");
        }
        document.getElementById("best_enemy_move").innerText=best_enemy_move;
        document.getElementById("best_response").innerText=best_response_to_enemy_best_move;

        var bar = document.getElementById("myBar");
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
        white_move = !white_move;
    });
}