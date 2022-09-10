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

#reset the chessboard position (called every time the page is loaded/refreshed)
def reset(request):
    global board, engine
    board = chess.Board(fen)
    engine = chess.engine.SimpleEngine.popen_uci(os.path.join(os.getcwd(),"mychess","stockfish_15_win_x64_avx2","stockfish_15_x64_avx2.exe"))
    return render(request,"move_evaluation.html")


def home(request):
    return render(request,"index.html")

def move_evaluation(request):
    return render(request,"move_evaluation.html")


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

    success = False
    iserror = False
    timelimit = 1   #if the analyse function cannot calculate the next moves with a given time, try double the time, until it can calculate the moves
    best_enemy_move = "NAN"
    best_response_to_enemy_best_move="NAN"
    while(not success and timelimit<32 and not iserror):
        evaluation = engine.analyse(board, chess.engine.Limit(time=timelimit), root_moves=[chess.Move.from_uci(move)])
        #print(evaluation)
        t = evaluation["score"]
        try:
            if(len(evaluation["pv"])>2):
                best_enemy_move = evaluation["pv"][1].uci()
                best_response_to_enemy_best_move= evaluation["pv"][2].uci()
                success=True
            else:
                timelimit = timelimit*2
                print("timelimit is: ",timelimit)
        except:
            print("Errore")
            iserror = True
        if(t.is_mate()):
            success=True

    print("Best enemy move: ",best_enemy_move)
    print("Best response: ",best_response_to_enemy_best_move)
    score = t.relative.score(mate_score=32000)
    
    percentage_score = calculateWinningChances(score)
    if percentage_score>1:
        percentage_score=1
    score = score if board.turn else -score
    board.push(chess.Move.from_uci(move))

    response_data={
        'board_evaluation':(percentage_score*100),
        'cp_evaluation': score,
        'best_enemy_move':best_enemy_move,
        'best_response_to_enemy_best_move':best_response_to_enemy_best_move,
        'is_checkmate':board.is_checkmate(),
        'is_stalemate':board.is_stalemate(),
        'is_insufficient_material':board.is_insufficient_material()
    }
    print(response_data)
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


def freemoves(request):
    return render(request,"free_moves.html")