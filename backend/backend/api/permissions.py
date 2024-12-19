from rest_framework.permissions import BasePermission
from .models import Project

class IsAuthorOrProjectMember(BasePermission):

    def has_object_permission(self, request, view, obj):

        print(f"User trying to access project details: {request.user}")
        print(f"Checking permissions for project ID: {obj.id}")

        if obj.author == request.user:
            print("User is the author of the project.")
            return True

        if request.user in obj.members.all():
            print("User is a member of the project's members.")
            return True

        print("User does NOT have permission to access this project.")
        return False


class IsAuthorOrMemberList(BasePermission):

    def has_permission(self, request, view):
        project_id = view.kwargs.get('project_id')
        if not project_id:
            return False

        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            return False

        return request.user == project.author or request.user in project.members.all()

from rest_framework import permissions


class IsAuthorOrMemberDetails(permissions.BasePermission):

    def has_object_permission(self, request, view, obj):

        if request.user == obj.project.author:
            return True
        
        if request.user in obj.project.members.all():
            return True

        return False