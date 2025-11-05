from django.urls import path
from routine_app import views
from rest_framework_simplejwt.views import TokenRefreshView


urlpatterns = [
    # JWT Authentication endpoints
    path("token/",views.MyTokenObtainPairView.as_view(),name = 'get_token'),
    # List endpoints
    path('', views.ListLists.as_view(), name='lists'),
    path('list/details/<int:pk>', views.Lists_Details.as_view(), name='list_detail'),
    path('create', views.CreateList.as_view(), name='create_list'),
    
    # User endpoints
    path('user/brought_by/<int:pk>', views.UserBroughtBy.as_view(), name='brought_by'),
    path('user/brought_to/<int:pk>', views.UserBroughtTo.as_view(), name='brought_to_you'),
    path('user/expense/<int:pk>/', views.user_expense, name='user_expense'),
]
