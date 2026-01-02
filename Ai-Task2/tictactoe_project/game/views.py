from django.http import JsonResponse, HttpRequest
from django.shortcuts import render
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
import json
from typing import List, Optional

from . import ai


def game_view(request: HttpRequest):
	"""Render the Tic Tac Toe page."""
	return render(request, "game.html")


def _find_winning_line(board: List[str], player: str) -> Optional[List[int]]:
	for line in ai.WIN_LINES:
		if all(board[i] == player for i in line):
			return list(line)
	return None


@csrf_exempt
@require_POST
def move_view(request: HttpRequest) -> JsonResponse:
	"""Handle AJAX POST to compute the AI move and return game state as JSON.

	Expects JSON body: { "board": [...], "difficulty": "easy|medium|hard" }
	"""
	try:
		payload = json.loads(request.body.decode("utf-8"))
	except Exception:
		return JsonResponse({"error": "invalid json"}, status=400)

	board = payload.get("board")
	difficulty = payload.get("difficulty", "hard")

	if not isinstance(board, list) or len(board) != 9:
		return JsonResponse({"error": "board must be a list of 9 elements"}, status=400)

	# sanitize board values
	board = [b if b in (ai.HUMAN, ai.AI, ai.EMPTY) else ai.EMPTY for b in board]

	# If human already won or board is full, don't make a move
	if ai.is_winner(board, ai.HUMAN):
		winning_line = _find_winning_line(board, ai.HUMAN)
		return JsonResponse({
			"aiMove": None,
			"winner": ai.HUMAN,
			"gameOver": True,
			"winningLine": winning_line,
		})

	if ai.is_full(board):
		return JsonResponse({
			"aiMove": None,
			"winner": "draw",
			"gameOver": True,
			"winningLine": None,
		})

	# compute AI move
	try:
		ai_move = ai.get_best_move(board, difficulty)
	except Exception:
		return JsonResponse({"error": "ai computation failed"}, status=500)

	if ai_move is not None:
		board[ai_move] = ai.AI

	# determine result
	if ai.is_winner(board, ai.AI):
		winner = ai.AI
		winning_line = _find_winning_line(board, ai.AI)
		game_over = True
	elif ai.is_winner(board, ai.HUMAN):
		winner = ai.HUMAN
		winning_line = _find_winning_line(board, ai.HUMAN)
		game_over = True
	elif ai.is_full(board):
		winner = "draw"
		winning_line = None
		game_over = True
	else:
		winner = "none"
		winning_line = None
		game_over = False

	return JsonResponse({
		"aiMove": ai_move,
		"winner": winner,
		"gameOver": game_over,
		"winningLine": winning_line,
	})

