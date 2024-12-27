from django.contrib import admin
from api import models as api_models

admin.site.register(api_models.User)
admin.site.register(api_models.Profile)
admin.site.register(api_models.Project)
admin.site.register(api_models.Script)
admin.site.register(api_models.Shot)
admin.site.register(api_models.Task)
admin.site.register(api_models.Event)
admin.site.register(api_models.Budget)
admin.site.register(api_models.Expense)