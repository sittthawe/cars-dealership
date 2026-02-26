from django.urls import path

from . import views

urlpatterns = [
    path('health/', views.health),
    path('register/', views.register_user),
    path('login/', views.login_user),
    path('logout/', views.logout_user),
    path('me/', views.current_user),
    path('cars/', views.list_cars),
    path('dealers/', views.list_dealers),
    path('dealers/<int:dealer_id>/', views.dealer_detail),
    path('dealers/<int:dealer_id>/reviews/', views.list_dealer_reviews),
    path('reviews/', views.create_review),
]
