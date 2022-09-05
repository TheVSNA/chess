from asyncio import events
from asyncio.windows_events import NULL
from posixpath import dirname
from tokenize import String
from xml.dom.minidom import TypeInfo
from django.shortcuts import render
from django.http import HttpResponse

import json

import chess
import chess.engine
import os

fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
board = chess.Board(fen)
engine = chess.engine.SimpleEngine.popen_uci(os.path.join(os.getcwd(),"mychess","stockfish_15_win_x64_avx2","stockfish_15_x64_avx2.exe"))

def reset(request):
    global board, engine
    board = chess.Board(fen)
    engine = chess.engine.SimpleEngine.popen_uci(os.path.join(os.getcwd(),"mychess","stockfish_15_win_x64_avx2","stockfish_15_x64_avx2.exe"))
    return HttpResponse(json.dumps({}), content_type="application/json")


def home(request):
    return render(request,"index.html")


def evaluateMove(request):
    body_unicode = request.body.decode('utf-8')
    body = json.loads(body_unicode)
    move = body["move"]
    move = move.lower()

    best_moves = []

    moves_t = str(board.legal_moves)[37:-1] # get the list of legal moves on a readable format to send them back to the user
    moves_t = moves_t.replace("(", "")
    moves_t = moves_t.replace(")", "")
    moves_t = moves_t.replace(" ", "")
    moves_t = moves_t.split(",")

    """cont =0
    for el in board.legal_moves:    #evaluate all the legal moves to find the best 3
        info = engine.analyse(board, chess.engine.Limit(time=1), root_moves=[el])
        t = info["score"]
        score = t.relative.score(mate_score=32000)
        print(el," ",score)
        best_moves.append({'move':moves_t[cont],'score':score})
        cont+=1

    best_moves.sort(key=lambda x: x["score"],reverse=True)  #sort the moves based on their score
    top_3_moves = []
    max = 3 if len(best_moves)>3 else len(best_moves)
    
    for i in range(max):
        top_3_moves.append({
            'move':best_moves[i]["move"],
            'score':calculateWinningChances(best_moves[i]["score"])
        })"""

    evaluation = engine.analyse(board, chess.engine.Limit(time=1), root_moves=[chess.Move.from_uci(move)])
    print(evaluation)
    t = evaluation["score"]
    if(len(evaluation["pv"])>2):
        best_enemy_move = evaluation["pv"][1].uci()
        best_response_to_enemy_best_move= evaluation["pv"][2].uci()
    elif(len(evaluation["pv"])==2):
        best_enemy_move = evaluation["pv"][1].uci()
        best_response_to_enemy_best_move= "NAN"
    else:
        best_enemy_move = "NAN"
        best_response_to_enemy_best_move= "NAN"
        
    print("Best enemy move: ",best_enemy_move)
    print("Best response: ",best_response_to_enemy_best_move)
    score = t.relative.score(mate_score=32000)
    
    percentage_score = calculateWinningChances(score)
    score = score if board.turn else -score
    board.push(chess.Move.from_uci(move))

    response_data={
        'board_evaluation':(percentage_score*100),
        'cp_evaluation': score,
        'best_enemy_move':best_enemy_move,
        'best_response_to_enemy_best_move':best_response_to_enemy_best_move
    }
    print(board)
    return HttpResponse(json.dumps(response_data), content_type="application/json")

#see https://www.chessprogramming.org/Pawn_Advantage,_Win_Percentage,_and_Elo
def calculateWinningChances(cp):
    cp = cp/100.0
    return 1.0/(1+ 10**(-cp/4.0))

def getLegalMoves(request):
    uci_moves = {
        "legalmoves":[]
    }
    for move in board.legal_moves:
        uci_moves["legalmoves"].append(move.uci())
    #print(uci_moves)

    return HttpResponse(json.dumps(uci_moves), content_type="application/json")

#verify if a move is a capture
def moveisenpassant(request):
    body_unicode = request.body.decode('utf-8')
    body = json.loads(body_unicode)
    move = body["move"]
    move = move.lower()
    iscapture = {
        "iscapture":False,
        "enpassant":False
    }
    if board.is_capture(chess.Move.from_uci(move)):
        iscapture["iscapture"]=True
        if board.is_en_passant(chess.Move.from_uci(move)):
            iscapture["enpassant"]=True
    return HttpResponse(json.dumps(iscapture),content_type="application/json")