"""Tic-Tac-Toe AI using Minimax with Alpha-Beta pruning.

Board representation: list of 9 elements containing "X", "O", or " ".
Human is "X". AI is "O".

Public API:
- `get_best_move(board, difficulty='hard') -> int | None` : returns index (0-8)
  for the chosen move, or `None` if no moves available.
"""

import random
from typing import List, Optional, Tuple


WIN_LINES = (
	(0, 1, 2),
	(3, 4, 5),
	(6, 7, 8),
	(0, 3, 6),
	(1, 4, 7),
	(2, 5, 8),
	(0, 4, 8),
	(2, 4, 6),
)

HUMAN = "X"
AI = "O"
EMPTY = " "


def is_winner(board: List[str], player: str) -> bool:
	return any(all(board[i] == player for i in line) for line in WIN_LINES)


def is_full(board: List[str]) -> bool:
	return all(cell != EMPTY for cell in board)


def available_moves(board: List[str]) -> List[int]:
	return [i for i, v in enumerate(board) if v == EMPTY]


def _heuristic(board: List[str]) -> int:
	"""Simple heuristic used when minimax is cut off by depth for `medium`.

	Counts potential line advantages: +1 for each AI mark in a line with no
	HUMAN marks, -1 for each HUMAN mark in a line with no AI marks.
	"""
	score = 0
	for a, b, c in WIN_LINES:
		vals = (board[a], board[b], board[c])
		if HUMAN not in vals and AI in vals:
			score += vals.count(AI)
		if AI not in vals and HUMAN in vals:
			score -= vals.count(HUMAN)
	return score


def _evaluate_terminal(board: List[str], depth: int) -> Optional[int]:
	if is_winner(board, AI):
		return 10 - depth
	if is_winner(board, HUMAN):
		return -10 + depth
	if is_full(board):
		return 0
	return None


def _minimax(
	board: List[str],
	depth: int,
	alpha: int,
	beta: int,
	maximizing: bool,
	depth_limit: int,
) -> Tuple[Optional[int], int]:
	"""Return tuple (best_move_index, score)."""
	terminal = _evaluate_terminal(board, depth)
	if terminal is not None:
		return None, terminal

	if depth >= depth_limit:
		# cutoff: use heuristic
		return None, _heuristic(board)

	best_move: Optional[int] = None

	if maximizing:
		max_eval = -10_000
		for mv in available_moves(board):
			board[mv] = AI
			_, score = _minimax(board, depth + 1, alpha, beta, False, depth_limit)
			board[mv] = EMPTY
			if score > max_eval:
				max_eval = score
				best_move = mv
			alpha = max(alpha, score)
			if beta <= alpha:
				break
		return best_move, max_eval
	else:
		min_eval = 10_000
		for mv in available_moves(board):
			board[mv] = HUMAN
			_, score = _minimax(board, depth + 1, alpha, beta, True, depth_limit)
			board[mv] = EMPTY
			if score < min_eval:
				min_eval = score
				best_move = mv
			beta = min(beta, score)
			if beta <= alpha:
				break
		return best_move, min_eval


def get_best_move(board: List[str], difficulty: str = "hard") -> Optional[int]:
	"""Return best move index (0-8) for the AI depending on difficulty.

	difficulty: 'easy' | 'medium' | 'hard'
	- easy: random available move
	- medium: minimax with depth limit (quick lookahead)
	- hard: full minimax with alpha-beta (exhaustive)
	"""
	if not isinstance(board, list) or len(board) != 9:
		raise ValueError("board must be a list of 9 elements")

	moves = available_moves(board)
	if not moves:
		return None

	difficulty = (difficulty or "hard").lower()
	if difficulty == "easy":
		return random.choice(moves)

	if difficulty == "medium":
		depth_limit = 3  # shallow lookahead
	else:
		depth_limit = 9  # full search

	best_move, _ = _minimax(board, depth=0, alpha=-10_000, beta=10_000, maximizing=True, depth_limit=depth_limit)
	# Fallback to random move if minimax didn't pick one (shouldn't happen)
	return best_move if best_move is not None else random.choice(moves)


__all__ = ["get_best_move"]

