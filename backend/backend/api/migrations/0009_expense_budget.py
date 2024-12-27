# Generated by Django 4.2 on 2024-12-27 17:12

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0008_event_attendees'),
    ]

    operations = [
        migrations.CreateModel(
            name='Expense',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('description', models.CharField(max_length=255)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=10)),
                ('category', models.CharField(choices=[('Equipment', 'Equipment'), ('Transport', 'Transport'), ('Labor', 'Labor'), ('Other', 'Other')], default='Other', max_length=50)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='expenses', to='api.project')),
            ],
        ),
        migrations.CreateModel(
            name='Budget',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('total_budget', models.DecimalField(decimal_places=2, max_digits=15)),
                ('project', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='budget', to='api.project')),
            ],
        ),
    ]
