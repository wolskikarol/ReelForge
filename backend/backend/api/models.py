from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.signals import post_save

class User(AbstractUser):
    username = models.CharField(unique=True, max_length=100)
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=100, null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email
    
    def save(self, *args, **kwargs):
        email_username, mobile = self.email.split("@")
        if self.full_name == "" or self.full_name == None:
            self.full_name = email_username
        if self.username == "" or self.username == None:
            self.username = email_username  
    
        super(User, self).save(*args, **kwargs)

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    image = models.FileField(upload_to="image", default="default/default-user.jpg", null=True, blank=True)
    full_name = models.CharField(max_length=100, null=True, blank=True)
    bio = models.TextField(null=True, blank=True)

    def __str__(self):
        if self.full_name:
            return str(self.full_name)
        else:
            return str(self.user.full_name)
    

    def save(self, *args, **kwargs):
        if self.full_name == "" or self.full_name == None:
            self.full_name = self.user.full_name
        super(Profile, self).save(*args, **kwargs)


def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()

post_save.connect(create_user_profile, sender=User)
post_save.connect(save_user_profile, sender=User)


class Project(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="projects")
    members = models.ManyToManyField(User, related_name="shared_projects", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_modified = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class Script(models.Model):
    project = models.ForeignKey('Project', on_delete=models.CASCADE, related_name='scripts')
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.title
    
class Shot(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='shots')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    shot_type = models.CharField(max_length=50)
    duration = models.DurationField()
    scene_number = models.PositiveIntegerField()
    shot_number = models.PositiveIntegerField()
    equipment = models.TextField(blank=True, null=True)
    movement = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.title} (Scene {self.scene_number}, Shot {self.shot_number})"
    

class Task(models.Model):
    STATUS_CHOICES = [
        ('new', 'New'),
        ('todo', 'To Do'),
        ('in_progress', 'In Progress'),
        ('done', 'Done'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_tasks')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tasks')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.status}"
    

class Event(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='events')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    attendees = models.ManyToManyField(User, related_name="event_attendees", blank=True)

    def __str__(self):
        return f"{self.title} ({self.start_time} - {self.end_time})"

class ExpenseCategory(models.TextChoices):
    EQUIPMENT = "Equipment", "Equipment"
    TRANSPORT = "Transport", "Transport"
    LABOR = "Labor", "Labor"
    OTHER = "Other", "Other"

class Expense(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='expenses')
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=50, choices=ExpenseCategory.choices, default=ExpenseCategory.OTHER)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.description} - {self.amount} PLN ({self.category})"

class Budget(models.Model):
    project = models.OneToOneField(Project, on_delete=models.CASCADE, related_name='budget')
    total_budget = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)

    @property
    def total_expenses(self):
        return sum(expense.amount for expense in self.project.expenses.all())

    @property
    def remaining_budget(self):
        return self.total_budget - self.total_expenses

    def __str__(self):
        return f"Budget for {self.project.title}"
