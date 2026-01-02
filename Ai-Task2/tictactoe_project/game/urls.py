from django.urls import path
from . import views

app_name = "game"

urlpatterns = [
    path("", views.game_view, name="game"),
    path("move/", views.move_view, name="move"),
]
