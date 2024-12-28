# Generated by Django 4.2 on 2024-12-27 17:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0009_expense_budget'),
    ]

    operations = [
        migrations.AlterField(
            model_name='budget',
            name='total_budget',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=15),
        ),
    ]