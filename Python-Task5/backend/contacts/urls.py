from django.urls import path
from . import views

urlpatterns = [
    path('api/contacts/', views.contacts_list, name='contacts_list'),
    path('api/add/', views.add_contact, name='add_contact'),
    path('api/update/', views.update_contact, name='update_contact'),
    path('api/delete/', views.delete_contact, name='delete_contact'),
    path('api/favorite/', views.toggle_favorite, name='toggle_favorite'),
]
