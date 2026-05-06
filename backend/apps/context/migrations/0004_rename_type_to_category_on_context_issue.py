from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('context', '0003_add_category_to_interested_party'),
    ]

    operations = [
        migrations.RenameField(
            model_name='contextissue',
            old_name='type',
            new_name='category',
        ),
    ]
