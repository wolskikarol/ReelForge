from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from api import views as api_views

urlpatterns = [
    path('user/token/', api_views.CustomTokenObtainPairView.as_view()),
    path('user/token/refresh/', TokenRefreshView.as_view()),
    path('user/register/', api_views.RegisterView.as_view()),
    path('user/profile/<user_id>/', api_views.ProfileView.as_view()),

    path('project/create/', api_views.ProjectCreateAPIView.as_view()),
    path('project/list/', api_views.UserProjectsListAPIView.as_view()),
    path('project/<int:pk>/delete/', api_views.ProjectDeleteAPIView.as_view(), name='project-delete'),
    path('project/<int:project_id>/add-member/', api_views.AddMemberAPIView.as_view(), name='add-member'),
    path('project/<int:pk>/', api_views.ProjectDetailView.as_view(), name='project-detail'),
    path('project/<int:project_id>/remove-member/', api_views.RemoveMemberAPIView.as_view(), name='remove-member'),

    ]