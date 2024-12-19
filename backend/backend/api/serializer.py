from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from api import models as api_models

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token['full_name'] = user.full_name
        token['email'] = user.email
        token['username'] = user.username
        return token

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = api_models.User
        fields = ['full_name', 'email', 'password', 'password2']
    
    def validate(self, attr):
        if attr['password'] != attr['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match!"})
        
        return attr
    
    def create(self, validated_data):
        user = api_models.User.objects.create(
            full_name = validated_data['full_name'],
            email = validated_data['email'],
        )
        email_username, mobile = user.email.split("@")
        user.username = email_username

        user.set_password(validated_data['password'])
        user.save()
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = api_models.User
        fields = ['id', 'email', 'full_name', 'username']

class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = api_models.Profile
        fields = ['user', 'image', 'full_name', 'bio']

class ProjectSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    members = UserSerializer(many=True)

    class Meta:
        model = api_models.Project
        fields = ['id', 'title', 'description', 'author', 'members', 'created_at', 'last_modified']
        read_only_fields = ['created_at', 'last_modified']

    def __init__(self, *args, **kwargs):
        super(ProjectSerializer, self).__init__(*args, **kwargs)
        request = self.context.get('request')
        if request and request.method == 'POST':
            self.Meta.depth = 0
        else:
            self.Meta.depth = 1

class ScriptSerializer(serializers.ModelSerializer):
    content = serializers.JSONField(default=list)  # Domyślnie pusta lista
    class Meta:
        model = api_models.Script
        fields = '__all__'
    
    def validate_title(self, value):
        if len(value) < 3:
            raise serializers.ValidationError("Title must be at least 3 characters long.")
        return value
    
class ShotSerializer(serializers.ModelSerializer):
    class Meta:
        model = api_models.Shot
        fields = '__all__'
