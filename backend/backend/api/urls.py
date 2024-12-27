from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from api import views as api_views

urlpatterns = [
    path('user/token/', api_views.CustomTokenObtainPairView.as_view()),
    path('user/token/refresh/', TokenRefreshView.as_view()),
    path('user/register/', api_views.RegisterView.as_view()),

    path('profile/', api_views.UserProfileView.as_view(), name='user-profile'),

    path('project/create/', api_views.ProjectCreateAPIView.as_view()),
    path('project/list/', api_views.UserProjectsListAPIView.as_view()),
    path('project/<int:pk>/delete/', api_views.ProjectDeleteAPIView.as_view(), name='project-delete'),
    path('project/<int:project_id>/add-member/', api_views.AddMemberAPIView.as_view(), name='add-member'),
    path('project/<int:pk>/', api_views.ProjectDetailView.as_view(), name='project-detail'),
    path('project/<int:project_id>/remove-member/', api_views.RemoveMemberAPIView.as_view(), name='remove-member'),
    path('project/<int:project_id>/users/', api_views.ProjectUsersAPIView.as_view(), name='project-users'),

    path('project/<int:project_id>/scripts/', api_views.ScriptListView.as_view(), name='script-list'),
    path('project/<int:projectid>/scripts/<int:id>/', api_views.ScriptDetailView.as_view(), name='script-detail'),

    path('project/<int:project_id>/shots/', api_views.ShotListCreateView.as_view(), name='shots-list'),
    path('project/<int:projectid>/shots/<int:id>/', api_views.ShotDetailView.as_view(), name='shots-detail'),

    path('project/<int:project_id>/tasks/', api_views.TaskListCreateView.as_view(), name='task-list-create'),
    path('project/<int:project_id>/tasks/<int:id>/', api_views.TaskDetailView.as_view(), name='task-detail'),
    path('project/<int:project_id>/tasks/<int:id>/assign/', api_views.TaskAssignUserView.as_view(), name='task-assign-user'),
    path('project/<int:project_id>/tasks/status/<str:status>/', api_views.TaskByStatusListView.as_view(), name='task-by-status'),

    path('project/<int:project_id>/events/', api_views.EventListCreateView.as_view(), name='events-list'),
    path('project/<int:project_id>/events/<int:id>/', api_views.EventDetailView.as_view(), name='event-detail'),
    path('events/<int:event_id>/toggle-attendance/', api_views.toggle_attendance, name='toggle-attendance'),

    path('project/<int:project_id>/budget/', api_views.BudgetRetrieveUpdateView.as_view(), name='project-budget'),
    path('project/<int:project_id>/expenses/', api_views.ExpenseListCreateView.as_view(), name='project-expenses'),
    path('project/<int:project_id>/expenses/<int:expense_id>/', api_views.ExpenseDetailView.as_view(), name='expense-detail'),


    ]