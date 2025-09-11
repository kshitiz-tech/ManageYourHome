from django.urls import path
from  routine_app import views


urlpatterns = [
    path('',views.ListLists.as_view(), name = 'lists' ),
    path('list/details/<int:pk>', views.Lists_Details.as_view(), name='list_detail'),
    path('create', views.CreateList.as_view(), name = 'create_list'),
    path('user/brought_by/<int:pk>', views.UserBroughtBy.as_view(),name = 'brought_by'),
    path('user/brought_to/<int:pk>', views.UserBroughtTo.as_view(), name = 'brought_to_you')

]