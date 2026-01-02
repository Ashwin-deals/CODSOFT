from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # Load the Tic-Tac-Toe game at the homepage
    path('', include('game.urls')),
]
