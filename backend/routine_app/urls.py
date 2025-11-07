from django.urls import path
from routine_app import views
from rest_framework_simplejwt.views import TokenRefreshView


urlpatterns = [

    # List endpoints
    path('', views.ListListCreateView.as_view(), name='list-list'),
    path('<int:pk>/', views.ListDetailView.as_view(), name='list-detail'),
    path('brought_by/<int:pk>', views.UserBroughtByView.as_view(), name='brought_by'),
    path('brought_to/<int:pk>', views.UserBroughtToView.as_view(), name='brought_to_you'),
    # Item endpoints
    path('<int:list_id>/items/', views.ListItemView.as_view(), name='list-items'),
    path('items/', views.ItemView.as_view(), name='item-list'),
    path('items/<int:pk>/', views.ItemDetailView.as_view(), name='item-detail'),

    
]
