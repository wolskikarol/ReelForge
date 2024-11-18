from rest_framework import status
from rest_framework.decorators import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated

from api import serializer as api_serializer
from api import models as api_models

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = api_serializer.CustomTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = api_models.User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = api_serializer.RegisterSerializer

class ProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [AllowAny]
    serializer_class = api_serializer.ProfileSerializer

    def get_object(self):
        user_id = self.kwargs['user_id']
        user = api_models.User.objects.get(id=user_id)
        profile = api_models.Profile.objects.get(user=user)
        return profile


class ProjectCreateAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.ProjectSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        print(request.data)
        # Get title from the request data
        title = request.data.get('title')

        # Use the authenticated user
        author = request.user

        print(author)
        print(title)

        # Create the project with the current user as the author
        try:
            post = api_models.Project.objects.create(
                author=author,  # Use the authenticated user
                title=title,
            )
            return Response({"message": "Project Created Successfully"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)



class UserProjectsListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Pobierz projekty, które użytkownik stworzył lub do których został przypisany
        return api_models.Project.objects.filter(
            api_models.models.Q(author=user) | api_models.models.Q(members=user)
        ).distinct()



class ProjectDeleteAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk, *args, **kwargs):
        try:
            # Pobierz projekt na podstawie ID (pk)
            project = api_models.Project.objects.get(id=pk)

            # Sprawdź, czy użytkownik jest autorem projektu
            if project.author != request.user:
                return Response({"detail": "You do not have permission to delete this project."}, status=status.HTTP_403_FORBIDDEN)

            project.delete()
            return Response({"message": "Project deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

        except api_models.Project.DoesNotExist:
            return Response({"detail": "Project not found."}, status=status.HTTP_404_NOT_FOUND)




class AddMemberAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, project_id):
        # Pobierz email z request
        email = request.data.get("email")
        if not email:
            return Response({"detail": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Znajdź użytkownika po email
        try:
            user = api_models.User.objects.get(email=email)
        except api_models.User.DoesNotExist:
            return Response({"detail": "User with this email does not exist"}, status=status.HTTP_404_NOT_FOUND)

        # Znajdź projekt
        try:
            project = api_models.Project.objects.get(id=project_id, author=request.user)
        except api_models.Project.DoesNotExist:
            return Response({"detail": "Project not found or you do not have access"}, status=status.HTTP_404_NOT_FOUND)

        # Sprawdź, czy użytkownik już jest członkiem
        if user in project.members.all():
            return Response({"detail": "User is already a member of this project"}, status=status.HTTP_400_BAD_REQUEST)

        # Dodaj użytkownika do projektu
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
        # Pobierz email z request
        email = request.data.get("email")
        if not email:
            return Response({"detail": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Znajdź użytkownika po email
        try:
            user = api_models.User.objects.get(email=email)
        except api_models.User.DoesNotExist:
            return Response({"detail": "User with this email does not exist"}, status=status.HTTP_404_NOT_FOUND)

        # Znajdź projekt
        try:
            project = api_models.Project.objects.get(id=project_id, author=request.user)
        except api_models.Project.DoesNotExist:
            return Response({"detail": "Project not found or you do not have access"}, status=status.HTTP_404_NOT_FOUND)

        # Sprawdź, czy użytkownik jest członkiem projektu
        if user not in project.members.all():
            return Response({"detail": "User is not a member of this project"}, status=status.HTTP_400_BAD_REQUEST)

        # Usuń użytkownika z projektu
        project.members.remove(user)
        project.save()

        return Response({"message": "User removed from project successfully"}, status=status.HTTP_200_OK)



class ProjectDetailView(generics.RetrieveAPIView):
    queryset = api_models.Project.objects.all()
    serializer_class = api_serializer.ProjectSerializer
    permission_classes = [IsAuthenticated]

