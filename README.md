# chess
The purpose of this project was to test a backend enviroment using python by building a website for playing chess.

Since I already know a bit of node.js and php for backend I wanted to try this new (for me at least) enviroment called django.
Django is used to set up the backend side of the website so that the user can send the move he wants to do, analyse it with a chess engine (Stockfish), calculate the winning chances of the part (black or white) that made the move and give all this information back to the frontend, with some indication of the best move the enemy can do and the best move to counter attack the enemy move.
The evaluation of the board is given in cp (centi-pawns) and in winning percentage.

A huge thanks goes to:
* The artist who made the pieces icons: Jurgenwesterhof from Wikipedia https://commons.wikimedia.org/wiki/File:Chess_Pieces_Sprite.svg
* The team that created the executable for Stockfish https://github.com/official-stockfish/Stockfish/tree/e6e324eb28fd49c1fc44b3b65784f85a773ec61c (this is a non official build, use this project at your own risk)
