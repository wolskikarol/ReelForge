from rest_framework import status
from rest_framework.decorators import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import NotFound
from django.db import models


from api import serializer as api_serializer
from api import models as api_models
from api.permissions import IsAuthorOrProjectMember,IsAuthorOrMemberList,IsAuthorOrMemberDetails


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = api_serializer.CustomTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = api_models.User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = api_serializer.RegisterSerializer

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = api_models.Profile.objects.get(user=request.user)
            serializer = api_serializer.ProfileSerializer(profile)
            return Response(serializer.data)
        except api_models.Profile.DoesNotExist:
            return Response({"error": "Profile does not exist"}, status=404)

class ProjectCreateAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.ProjectSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        print(request.data)
        # Get data from the request data
        title = request.data.get('title')
        description = request.data.get('description')
        author = request.user

        print(author)
        print(title)
        print(description)

        # Create the project with the current user as the author
        try:
            post = api_models.Project.objects.create(
                author=author,
                title=title,
                description=description,
            )
            return Response({"message": "Project Created Successfully"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)



class UserProjectsListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Return projects that the user has created or been assigned to
        return api_models.Project.objects.filter(
            api_models.models.Q(author=user) | api_models.models.Q(members=user)
        ).distinct()



class ProjectDeleteAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk, *args, **kwargs):
        try:
            project = api_models.Project.objects.get(id=pk)

            # Check if the user is the author of the project
            if project.author != request.user:
                return Response({"detail": "You do not have permission to delete this project."}, status=status.HTTP_403_FORBIDDEN)

            project.delete()
            return Response({"message": "Project deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

        except api_models.Project.DoesNotExist:
            return Response({"detail": "Project not found."}, status=status.HTTP_404_NOT_FOUND)




class AddMemberAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, project_id):
        # Get email from request
        email = request.data.get("email")
        if not email:
            return Response({"detail": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Find a user by email
        try:
            user = api_models.User.objects.get(email=email)
        except api_models.User.DoesNotExist:
            return Response({"detail": "User with this email does not exist"}, status=status.HTTP_404_NOT_FOUND)

        # Find a project
        try:
            project = api_models.Project.objects.get(id=project_id, author=request.user)
        except api_models.Project.DoesNotExist:
            return Response({"detail": "Project not found or you do not have access"}, status=status.HTTP_404_NOT_FOUND)

        # Check if the user is already a member
        if user in project.members.all():
            return Response({"detail": "User is already a member of this project"}, status=status.HTTP_400_BAD_REQUEST)

        # Add a user to the project
        project.members.add(user)
        project.save()

        return Response({
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email
        }, status=status.HTTP_200_OK)


class RemoveMemberAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, project_id):
        # Get email from request
        email = request.data.get("email")
        if not email:
            return Response({"detail": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Find a user by email
        try:
            user = api_models.User.objects.get(email=email)
        except api_models.User.DoesNotExist:
            return Response({"detail": "User with this email does not exist"}, status=status.HTTP_404_NOT_FOUND)

        # Find a project
        try:
            project = api_models.Project.objects.get(id=project_id, author=request.user)
        except api_models.Project.DoesNotExist:
            return Response({"detail": "Project not found or you do not have access"}, status=status.HTTP_404_NOT_FOUND)

        # Check if the user is a member of the project
        if user not in project.members.all():
            return Response({"detail": "User is not a member of this project"}, status=status.HTTP_400_BAD_REQUEST)

        # Remove a user from the project
        project.members.remove(user)
        project.save()

        return Response({"message": "User removed from project successfully"}, status=status.HTTP_200_OK)



class ProjectDetailView(generics.RetrieveAPIView):
    queryset = api_models.Project.objects.all()
    serializer_class = api_serializer.ProjectSerializer
    permission_classes = [IsAuthenticated, IsAuthorOrProjectMember]


class ProjectUsersAPIView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated, IsAuthorOrProjectMember]

    def retrieve(self, request, *args, **kwargs):
        project_id = self.kwargs.get("project_id")
        try:
            project = api_models.Project.objects.get(id=project_id)
        except api_models.Project.DoesNotExist:
            return Response({"detail": "Project not found."}, status=404)

        if request.user != project.author and request.user not in project.members.all():
            return Response({"detail": "You do not have permission to view this project."}, status=403)

        users = [project.author] + list(project.members.all())
        serializer = api_serializer.UserSerializer(users, many=True)
        return Response(serializer.data)


class ScriptListView(generics.ListCreateAPIView):
    serializer_class = api_serializer.ScriptSerializer
    permission_classes = [IsAuthenticated, IsAuthorOrMemberList]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        if not project_id:
            raise NotFound("Project ID not provided")
        return api_models.Script.objects.filter(project_id=project_id)

    def create(self, request, *args, **kwargs):
        project_id = self.kwargs.get('project_id')
        if not project_id:
            return Response({"detail": "Project ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        project = get_object_or_404(api_models.Project, id=project_id)
        if request.user != project.author and request.user not in project.members.all():
            return Response({"detail": "You do not have permission to add scripts to this project."},
                            status=status.HTTP_403_FORBIDDEN)

        data = request.data.copy()
        data['project'] = project_id
        data['created_by'] = request.user.id
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
class ScriptDetailView(generics.RetrieveUpdateAPIView):
    queryset = api_models.Script.objects.all()
    serializer_class = api_serializer.ScriptSerializer
    lookup_field = "id"
    permission_classes = [IsAuthenticated, IsAuthorOrMemberDetails]

    def get_queryset(self):
        script_id = self.kwargs.get('id')
        user = self.request.user

        return api_models.Script.objects.filter(
            id=script_id,
        ).filter(
            models.Q(project__members=user) | models.Q(created_by=user)
        )
    
    def update(self, request, *args, **kwargs):
            partial = kwargs.pop('partial', True)
            instance = self.get_object()

            data = {**request.data, "title": instance.title, "project": instance.project.id, "created_by": instance.created_by.id}

            serializer = self.get_serializer(instance, data=data, partial=partial)
            if not serializer.is_valid():
                raise ValidationError(serializer.errors)

            self.perform_update(serializer)

            return Response(serializer.data, status=status.HTTP_200_OK)
    

class ShotListCreateView(generics.ListCreateAPIView):
    serializer_class = api_serializer.ShotSerializer
    permission_classes = [IsAuthenticated, IsAuthorOrMemberList]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        if not project_id:
            raise NotFound("Project ID not provided")
        return api_models.Shot.objects.filter(project_id=project_id)

    def create(self, request, *args, **kwargs):
        project_id = self.kwargs.get('project_id')
        if not project_id:
            return Response({"detail": "Project ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        project = get_object_or_404(api_models.Project, id=project_id)
        if request.user != project.author and request.user not in project.members.all():
            return Response(
                {"detail": "You do not have permission to add shots to this project."},
                status=status.HTTP_403_FORBIDDEN
            )

        data = request.data.copy()
        data['project'] = project_id
        data['created_by'] = request.user.id
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ShotDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = api_models.Shot.objects.all()
    serializer_class = api_serializer.ShotSerializer
    lookup_field = "id"
    permission_classes = [IsAuthenticated, IsAuthorOrMemberDetails]

    def get_queryset(self):
        shot_id = self.kwargs.get('id')
        user = self.request.user

        return api_models.Shot.objects.filter(
            id=shot_id
        ).filter(
            models.Q(project__author=user) | models.Q(project__members=user)
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        instance = self.get_object()

        data = {**request.data, "project": instance.project.id}

        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data, status=status.HTTP_200_OK)


class TaskListCreateView(generics.ListCreateAPIView):
    serializer_class = api_serializer.TaskSerializer
    permission_classes = [IsAuthenticated, IsAuthorOrProjectMember]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        if not project_id:
            return api_models.Task.objects.none()
        return api_models.Task.objects.filter(project_id=project_id)

    def create(self, request, *args, **kwargs):
        project_id = self.kwargs.get('project_id')
        project = get_object_or_404(api_models.Project, id=project_id)

        if request.user != project.author and request.user not in project.members.all():
            return Response({"detail": "You do not have permission to add tasks to this project."},
                            status=status.HTTP_403_FORBIDDEN)

        data = request.data.copy()
        data['project'] = project_id
        data['created_by'] = request.user.id

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save(created_by=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)



class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = api_models.Task.objects.all()
    serializer_class = api_serializer.TaskSerializer
    lookup_field = "id"
    permission_classes = [IsAuthenticated, IsAuthorOrMemberDetails]

    def get_queryset(self):
        task_id = self.kwargs.get('id')
        user = self.request.user
        return api_models.Task.objects.filter(id=task_id).filter(
            models.Q(project__author=user) | models.Q(project__members=user)
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        instance = self.get_object()

        data = {**request.data, "project": instance.project.id}
        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data, status=status.HTTP_200_OK)

class TaskAssignUserView(generics.UpdateAPIView):
    queryset = api_models.Task.objects.all()
    serializer_class = api_serializer.TaskSerializer
    permission_classes = [IsAuthenticated, IsAuthorOrProjectMember]

    def update(self, request, *args, **kwargs):
        task = self.get_object()
        user_id = request.data.get('assigned_to')
        user = get_object_or_404(User, id=user_id)

        if request.user != task.project.author and request.user not in task.project.members.all():
            return Response({"detail": "You do not have permission to assign users."}, status=status.HTTP_403_FORBIDDEN)

        task.assigned_to = user
        task.save()
        return Response(TaskSerializer(task).data, status=status.HTTP_200_OK)


class TaskByStatusListView(generics.ListAPIView):
    serializer_class = api_serializer.TaskSerializer
    permission_classes = [IsAuthenticated, IsAuthorOrProjectMember]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        status_filter = self.kwargs.get('status')
        if not project_id or status_filter not in ['new', 'todo', 'in_progress', 'done']:
            return api_models.Task.objects.none()

        return api_models.Task.objects.filter(project_id=project_id, status=status_filter)
