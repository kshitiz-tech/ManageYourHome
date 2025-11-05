from django.urls import path
from routine_app import views
from rest_framework_simplejwt.views import TokenRefreshView


urlpatterns = [
    # Authentication endpoints
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/logout/', views.LogoutView.as_view(), name='logout'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # List endpoints
    path('', views.ListLists.as_view(), name='lists'),
    path('list/details/<int:pk>', views.Lists_Details.as_view(), name='list_detail'),
    path('create', views.CreateList.as_view(), name='create_list'),
    
    # User endpoints
    path('user/brought_by/<int:pk>', views.UserBroughtBy.as_view(), name='brought_by'),
    path('user/brought_to/<int:pk>', views.UserBroughtTo.as_view(), name='brought_to_you'),
    path('user/expense/<int:pk>/', views.user_expense, name='user_expense'),
]
